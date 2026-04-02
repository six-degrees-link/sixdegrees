import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { CommentSchema } from '@/lib/validators/requirements'

type Params = { params: Promise<{ id: string; commentId: string }> }

// ============================================================
// PATCH /api/requirements/[id]/comments/[commentId]
// Edit own comment body
// ============================================================

export async function PATCH(req: NextRequest, { params }: Params) {
  const { commentId } = await params
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

  const parsed = CommentSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message, code: 'VALIDATION_ERROR' },
      { status: 400 }
    )
  }

  // Verify ownership before update
  const { data: existing } = await supabase
    .from('requirement_comments')
    .select('id, contributor_id')
    .eq('id', commentId)
    .single()

  if (!existing) {
    return NextResponse.json({ error: 'Comment not found', code: 'NOT_FOUND' }, { status: 404 })
  }
  if (existing.contributor_id !== user.id) {
    return NextResponse.json({ error: 'Cannot edit another user\'s comment', code: 'FORBIDDEN' }, { status: 403 })
  }

  const { data, error } = await supabase
    .from('requirement_comments')
    .update({ body: parsed.data.body })
    .eq('id', commentId)
    .select('*, contributors!inner(id, display_name, avatar_url)')
    .single()

  if (error) {
    return NextResponse.json(
      { error: 'Failed to update comment', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }

  return NextResponse.json({ data })
}

// ============================================================
// DELETE /api/requirements/[id]/comments/[commentId]
// Delete own comment
// ============================================================

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { commentId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json(
      { error: 'Authentication required', code: 'UNAUTHORIZED' },
      { status: 401 }
    )
  }

  // Verify ownership before delete
  const { data: existing } = await supabase
    .from('requirement_comments')
    .select('id, contributor_id')
    .eq('id', commentId)
    .single()

  if (!existing) {
    return NextResponse.json({ error: 'Comment not found', code: 'NOT_FOUND' }, { status: 404 })
  }
  if (existing.contributor_id !== user.id) {
    return NextResponse.json({ error: 'Cannot delete another user\'s comment', code: 'FORBIDDEN' }, { status: 403 })
  }

  const { error } = await supabase
    .from('requirement_comments')
    .delete()
    .eq('id', commentId)

  if (error) {
    return NextResponse.json(
      { error: 'Failed to delete comment', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }

  return new NextResponse(null, { status: 204 })
}
