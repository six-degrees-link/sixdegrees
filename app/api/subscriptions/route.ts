import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { PersonaTypeSchema } from '@/lib/validators/requirements'

const SubscribeSchema = z.object({
  persona_type: PersonaTypeSchema,
})

// ============================================================
// GET /api/subscriptions — list current user's subscriptions
// ============================================================

export async function GET() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json(
      { error: 'Authentication required', code: 'UNAUTHORIZED' },
      { status: 401 }
    )
  }

  const { data, error } = await supabase
    .from('persona_subscriptions')
    .select('id, persona_type, created_at')
    .eq('contributor_id', user.id)
    .order('created_at', { ascending: true })

  if (error) {
    return NextResponse.json(
      { error: 'Failed to fetch subscriptions', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }

  return NextResponse.json({ data })
}

// ============================================================
// POST /api/subscriptions — subscribe to a persona type
// ============================================================

export async function POST(req: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
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

  const parsed = SubscribeSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message, code: 'VALIDATION_ERROR' },
      { status: 400 }
    )
  }

  const { data, error } = await supabase
    .from('persona_subscriptions')
    .insert({ contributor_id: user.id, persona_type: parsed.data.persona_type })
    .select('id, persona_type, created_at')
    .single()

  if (error) {
    // Unique constraint violation — already subscribed
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'Already subscribed to this persona', code: 'CONFLICT' },
        { status: 409 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to subscribe', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }

  return NextResponse.json({ data }, { status: 201 })
}

// ============================================================
// DELETE /api/subscriptions?persona_type=... — unsubscribe
// ============================================================

export async function DELETE(req: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json(
      { error: 'Authentication required', code: 'UNAUTHORIZED' },
      { status: 401 }
    )
  }

  const { searchParams } = new URL(req.url)
  const parsed = SubscribeSchema.safeParse({ persona_type: searchParams.get('persona_type') })
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message, code: 'VALIDATION_ERROR' },
      { status: 400 }
    )
  }

  const { error } = await supabase
    .from('persona_subscriptions')
    .delete()
    .eq('contributor_id', user.id)
    .eq('persona_type', parsed.data.persona_type)

  if (error) {
    return NextResponse.json(
      { error: 'Failed to unsubscribe', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }

  return new NextResponse(null, { status: 204 })
}
