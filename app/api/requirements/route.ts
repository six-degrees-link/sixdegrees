import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { CreateRequirementSchema, RequirementsQuerySchema } from '@/lib/validators/requirements'

// ============================================================
// POST /api/requirements — create a requirement
// ============================================================

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json(
      { error: 'Authentication required', code: 'UNAUTHORIZED' },
      { status: 401 }
    )
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON', code: 'VALIDATION_ERROR' },
      { status: 400 }
    )
  }

  const parsed = CreateRequirementSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message, code: 'VALIDATION_ERROR' },
      { status: 400 }
    )
  }

  const {
    raw_input,
    persona_type,
    category,
    refined_title,
    user_story,
    refined_description,
    acceptance_criteria,
    priority_suggestion,
    tags,
  } = parsed.data

  // Status is 'submitted' only if AI-refined fields are present
  const hasRefinedFields = !!(refined_title && user_story && refined_description)
  const status = hasRefinedFields ? 'submitted' : 'draft'

  const { data, error } = await supabase
    .from('requirements')
    .insert({
      contributor_id: user.id,
      raw_input,
      persona_type,
      category: category ?? null,
      refined_title: refined_title ?? null,
      user_story: user_story ?? null,
      refined_description: refined_description ?? null,
      acceptance_criteria: acceptance_criteria ?? [],
      priority_suggestion: priority_suggestion ?? null,
      tags: tags ?? [],
      status,
    })
    .select('id, status, persona_type, created_at')
    .single()

  if (error) {
    console.error('Failed to create requirement:', error)
    return NextResponse.json(
      { error: 'Failed to create requirement', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }

  return NextResponse.json({ data }, { status: 201 })
}

// ============================================================
// GET /api/requirements — list requirements
// ============================================================

export async function GET(req: NextRequest) {
  const supabase = await createClient()

  const { searchParams } = new URL(req.url)
  const parsed = RequirementsQuerySchema.safeParse(
    Object.fromEntries(searchParams.entries())
  )

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message, code: 'VALIDATION_ERROR' },
      { status: 400 }
    )
  }

  const { persona_type, category, status, sort, search, page, limit } = parsed.data
  const offset = (page - 1) * limit

  let query = supabase
    .from('requirements')
    .select(
      `id, refined_title, raw_input, persona_type, category, status,
       upvotes, downvotes, comment_count, tags, created_at,
       contributors!inner(id, display_name, avatar_url)`,
      { count: 'exact' }
    )

  // Default: exclude merged/rejected unless explicitly requested
  if (status) {
    query = query.eq('status', status)
  } else {
    query = query.in('status', ['submitted', 'in_review', 'approved'])
  }

  if (persona_type) query = query.eq('persona_type', persona_type)
  if (category) query = query.eq('category', category)

  if (search) {
    query = query.textSearch('search_vector', search, { type: 'websearch' })
  }

  if (sort === 'votes') {
    query = query.order('upvotes', { ascending: false })
  } else if (sort === 'oldest') {
    query = query.order('created_at', { ascending: true })
  } else {
    query = query.order('created_at', { ascending: false })
  }

  query = query.range(offset, offset + limit - 1)

  const { data, error, count } = await query

  if (error) {
    console.error('Failed to list requirements:', error)
    return NextResponse.json(
      { error: 'Failed to fetch requirements', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    data,
    meta: {
      page,
      limit,
      total: count ?? 0,
    },
  })
}
