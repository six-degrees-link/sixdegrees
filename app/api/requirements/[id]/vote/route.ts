import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { VoteSchema } from '@/lib/validators/requirements'

type Params = { params: Promise<{ id: string }> }

// ============================================================
// POST /api/requirements/[id]/vote — upsert vote
// ============================================================

export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params
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

  const parsed = VoteSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message, code: 'VALIDATION_ERROR' },
      { status: 400 }
    )
  }

  const { vote_type } = parsed.data

  // Upsert — replaces existing vote if present
  const { error: voteError } = await supabase
    .from('requirement_votes')
    .upsert(
      { requirement_id: id, contributor_id: user.id, vote_type },
      { onConflict: 'requirement_id,contributor_id' }
    )

  if (voteError) {
    return NextResponse.json(
      { error: 'Failed to record vote', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }

  const { data: counts } = await supabase
    .from('requirements')
    .select('upvotes, downvotes')
    .eq('id', id)
    .single()

  return NextResponse.json({
    data: { vote_type, upvotes: counts?.upvotes ?? 0, downvotes: counts?.downvotes ?? 0 },
  })
}

// ============================================================
// DELETE /api/requirements/[id]/vote — remove vote
// ============================================================

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json(
      { error: 'Authentication required', code: 'UNAUTHORIZED' },
      { status: 401 }
    )
  }

  await supabase
    .from('requirement_votes')
    .delete()
    .eq('requirement_id', id)
    .eq('contributor_id', user.id)

  const { data: counts } = await supabase
    .from('requirements')
    .select('upvotes, downvotes')
    .eq('id', id)
    .single()

  return NextResponse.json({
    data: { vote_type: null, upvotes: counts?.upvotes ?? 0, downvotes: counts?.downvotes ?? 0 },
  })
}
