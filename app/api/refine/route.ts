import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { anthropic } from '@/lib/claude/client'
import { REFINEMENT_SYSTEM_PROMPT, buildRefinementPrompt } from '@/lib/claude/prompts'
import { parseRefinementResponse } from '@/lib/claude/parse'
import { RefineRequestSchema } from '@/lib/validators/requirements'

const MODEL = 'claude-sonnet-4-20250514'
const MAX_REFINEMENTS_PER_HOUR = 10

export async function POST(req: NextRequest) {
  // 1. Auth
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json(
      { error: 'Authentication required', code: 'UNAUTHORIZED' },
      { status: 401 }
    )
  }

  // 2. Validate input
  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json(
      { error: 'Invalid JSON', code: 'VALIDATION_ERROR' },
      { status: 400 }
    )
  }

  const parsed = RefineRequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message, code: 'VALIDATION_ERROR' },
      { status: 400 }
    )
  }

  const { raw_input, persona_type, category } = parsed.data

  // 3. Per-user rate limit: max 10 refinements per hour
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
  const { count: recentCount } = await supabase
    .from('ai_usage_log')
    .select('id', { count: 'exact', head: true })
    .eq('contributor_id', user.id)
    .gte('created_at', oneHourAgo)

  if ((recentCount ?? 0) >= MAX_REFINEMENTS_PER_HOUR) {
    return NextResponse.json(
      { error: `You've used all ${MAX_REFINEMENTS_PER_HOUR} AI refinements for this hour. Try again later or submit without refinement.`, code: 'RATE_LIMITED' },
      { status: 429 }
    )
  }

  // 4. Daily cost cap — query ai_usage_log directly
  const todayStart = new Date().toISOString().split('T')[0]
  const { data: usageRows } = await supabase
    .from('ai_usage_log')
    .select('cost_usd')
    .gte('created_at', todayStart)

  const dailyCost = (usageRows ?? []).reduce((sum, r) => sum + Number(r.cost_usd), 0)
  const cap = parseFloat(process.env.CLAUDE_DAILY_COST_CAP_USD ?? '10')

  if (dailyCost >= cap) {
    return NextResponse.json(
      { error: 'AI refinement has reached its daily limit. You can still submit manually.', code: 'AI_UNAVAILABLE' },
      { status: 503 }
    )
  }

  // 5. Fetch existing requirements for duplicate detection (top 20 for this persona)
  const { data: existingRaw } = await supabase
    .from('requirements')
    .select('id, refined_title')
    .eq('persona_type', persona_type)
    .in('status', ['submitted', 'approved', 'in_review'])
    .not('refined_title', 'is', null)
    .order('upvotes', { ascending: false })
    .limit(20)

  const existing = (existingRaw ?? []).filter(
    (r): r is { id: string; refined_title: string } => r.refined_title !== null
  )

  // 6. Call Claude
  try {
    const message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 2000,
      temperature: 0.3,
      system: REFINEMENT_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: buildRefinementPrompt(raw_input, persona_type, category, existing ?? []),
        },
      ],
    })

    // 7. Parse response
    const responseText = message.content
      .filter((b) => b.type === 'text')
      .map((b) => (b as { type: 'text'; text: string }).text)
      .join('')

    const refinement = parseRefinementResponse(responseText)

    // 8. Log usage (service client — bypasses RLS on ai_usage_log)
    const inputTokens = message.usage.input_tokens
    const outputTokens = message.usage.output_tokens
    const costUsd = (inputTokens * 0.003 + outputTokens * 0.015) / 1000

    const serviceSupabase = await createServiceClient()
    await serviceSupabase.from('ai_usage_log').insert({
      contributor_id: user.id,
      tokens_input: inputTokens,
      tokens_output: outputTokens,
      model: MODEL,
      cost_usd: costUsd,
    })

    // 9. Resolve similar existing IDs
    const similarExisting = refinement.similar_existing_titles.length > 0
      ? existing
          .filter((r) => refinement.similar_existing_titles.includes(r.refined_title))
          .map((r) => ({ id: r.id, refined_title: r.refined_title }))
      : []

    return NextResponse.json({
      data: { ...refinement, similar_existing: similarExisting },
    })
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string }
    if (err.status === 408 || err.message?.includes('timeout')) {
      return NextResponse.json(
        { error: 'AI refinement timed out. Try again or submit without refinement.', code: 'AI_UNAVAILABLE' },
        { status: 504 }
      )
    }
    console.error('Claude API error:', error)
    return NextResponse.json(
      { error: 'AI refinement failed. You can still submit without it.', code: 'AI_UNAVAILABLE' },
      { status: 503 }
    )
  }
}
