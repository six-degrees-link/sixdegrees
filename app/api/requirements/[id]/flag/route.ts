import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

type Params = { params: Promise<{ id: string }> }

const FlagSchema = z.object({
  reason: z.string().min(1).max(500).optional(),
})

// ============================================================
// POST /api/requirements/[id]/flag
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

  let body: unknown = {}
  try {
    body = await req.json()
  } catch {
    // reason is optional — empty body is fine
  }

  const parsed = FlagSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message, code: 'VALIDATION_ERROR' },
      { status: 400 }
    )
  }

  const { error } = await supabase
    .from('requirements')
    .update({ is_flagged: true, flag_reason: parsed.data.reason ?? null })
    .eq('id', id)

  if (error) {
    return NextResponse.json(
      { error: 'Failed to flag requirement', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }

  return NextResponse.json({ data: { flagged: true } })
}
