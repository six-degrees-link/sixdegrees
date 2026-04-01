import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { UpdateRequirementSchema } from '@/lib/validators/requirements'

type Params = { params: Promise<{ id: string }> }

// ============================================================
// GET /api/requirements/[id]
// ============================================================

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params
  const supabase = await createClient()

  const { data: requirement, error } = await supabase
    .from('requirements')
    .select(
      `*, contributors!inner(id, display_name, avatar_url, email)`
    )
    .eq('id', id)
    .single()

  if (error || !requirement) {
    return NextResponse.json(
      { error: 'Requirement not found', code: 'NOT_FOUND' },
      { status: 404 }
    )
  }

  // Attach the authenticated user's vote (null if not signed in)
  let user_vote: 'up' | 'down' | null = null
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const { data: vote } = await supabase
      .from('requirement_votes')
      .select('vote_type')
      .eq('requirement_id', id)
      .eq('contributor_id', user.id)
      .maybeSingle()

    user_vote = (vote?.vote_type as 'up' | 'down') ?? null
  }

  return NextResponse.json({ data: { ...requirement, user_vote } })
}

// ============================================================
// PATCH /api/requirements/[id] — owner only, draft/submitted
// ============================================================

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json(
      { error: 'Authentication required', code: 'UNAUTHORIZED' },
      { status: 401 }
    )
  }

  const { data: existing } = await supabase
    .from('requirements')
    .select('contributor_id, status')
    .eq('id', id)
    .single()

  if (!existing) {
    return NextResponse.json(
      { error: 'Requirement not found', code: 'NOT_FOUND' },
      { status: 404 }
    )
  }

  if (existing.contributor_id !== user.id) {
    return NextResponse.json(
      { error: 'You do not own this requirement', code: 'FORBIDDEN' },
      { status: 403 }
    )
  }

  if (!['draft', 'submitted'].includes(existing.status)) {
    return NextResponse.json(
      { error: 'Cannot edit a requirement in this state', code: 'FORBIDDEN' },
      { status: 403 }
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

  const parsed = UpdateRequirementSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message, code: 'VALIDATION_ERROR' },
      { status: 400 }
    )
  }

  const { data, error } = await supabase
    .from('requirements')
    .update(parsed.data)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json(
      { error: 'Failed to update requirement', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }

  return NextResponse.json({ data })
}
