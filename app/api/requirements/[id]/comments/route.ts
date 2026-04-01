import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { CommentSchema } from '@/lib/validators/requirements'

type Params = { params: Promise<{ id: string }> }

// ============================================================
// GET /api/requirements/[id]/comments
// ============================================================

export async function GET(req: NextRequest, { params }: Params) {
  const { id } = await params
  const supabase = await createClient()

  const { searchParams } = new URL(req.url)
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') ?? '20')))
  const offset = (page - 1) * limit

  const { data, error, count } = await supabase
    .from('requirement_comments')
    .select('*, contributors!inner(id, display_name, avatar_url)', { count: 'exact' })
    .eq('requirement_id', id)
    .order('created_at', { ascending: true })
    .range(offset, offset + limit - 1)

  if (error) {
    return NextResponse.json(
      { error: 'Failed to fetch comments', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }

  return NextResponse.json({ data, meta: { page, limit, total: count ?? 0 } })
}

// ============================================================
// POST /api/requirements/[id]/comments
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

  const parsed = CommentSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message, code: 'VALIDATION_ERROR' },
      { status: 400 }
    )
  }

  const { data, error } = await supabase
    .from('requirement_comments')
    .insert({ requirement_id: id, contributor_id: user.id, body: parsed.data.body })
    .select('*, contributors!inner(id, display_name, avatar_url)')
    .single()

  if (error) {
    return NextResponse.json(
      { error: 'Failed to post comment', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }

  return NextResponse.json({ data }, { status: 201 })
}
