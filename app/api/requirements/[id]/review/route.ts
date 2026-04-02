import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/auth/admin'
import { sendRequirementApproved } from '@/lib/email'

type Params = { params: Promise<{ id: string }> }

const ReviewSchema = z.object({
  status: z.enum(['in_review', 'approved', 'rejected', 'merged']),
  merged_into: z.string().uuid().optional(),
})

const VALID_TRANSITIONS: Record<string, string[]> = {
  submitted:  ['in_review', 'approved', 'rejected', 'merged'],
  in_review:  ['approved', 'rejected', 'merged'],
  approved:   ['rejected', 'merged'],
  rejected:   ['in_review', 'approved'],
  draft:      ['submitted', 'in_review', 'approved', 'rejected'],
}

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

  if (!isAdmin(user)) {
    return NextResponse.json(
      { error: 'Admin access required', code: 'FORBIDDEN' },
      { status: 403 }
    )
  }

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json(
      { error: 'Invalid JSON', code: 'VALIDATION_ERROR' },
      { status: 400 }
    )
  }

  const parsed = ReviewSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message, code: 'VALIDATION_ERROR' },
      { status: 400 }
    )
  }

  const { status: newStatus, merged_into } = parsed.data

  if (newStatus === 'merged' && !merged_into) {
    return NextResponse.json(
      { error: 'merged_into is required when merging', code: 'VALIDATION_ERROR' },
      { status: 400 }
    )
  }

  // Use service client for all DB writes — RLS would block admins updating others' requirements
  const service = createServiceClient()

  // Fetch requirement + contributor email
  const { data: requirement } = await service
    .from('requirements')
    .select('id, status, refined_title, raw_input, contributors!inner(email, display_name)')
    .eq('id', id)
    .single()

  if (!requirement) {
    return NextResponse.json(
      { error: 'Requirement not found', code: 'NOT_FOUND' },
      { status: 404 }
    )
  }

  const allowed = VALID_TRANSITIONS[requirement.status] ?? []
  if (!allowed.includes(newStatus)) {
    return NextResponse.json(
      { error: `Cannot transition from "${requirement.status}" to "${newStatus}"`, code: 'VALIDATION_ERROR' },
      { status: 400 }
    )
  }

  // Update status (and merged_into if merging)
  const updatePayload: Record<string, unknown> = { status: newStatus }
  if (newStatus === 'merged' && merged_into) updatePayload.merged_into = merged_into

  const { data: rows, error } = await service
    .from('requirements')
    .update(updatePayload)
    .eq('id', id)
    .select('id, status, refined_title, raw_input, merged_into')

  if (error || !rows || rows.length === 0) {
    console.error('Review update failed:', JSON.stringify(error))
    return NextResponse.json(
      { error: error?.message ?? 'Failed to update status', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }

  const updated = rows[0]

  // Send approval email
  if (newStatus === 'approved') {
    const contributor = requirement.contributors as { email: string; display_name: string | null }
    const title = requirement.refined_title ?? requirement.raw_input.slice(0, 80)
    await sendRequirementApproved({
      to: contributor.email,
      requirementTitle: title,
      requirementId: id,
    }).catch((err) => console.error('Failed to send approval email:', err))
  }

  return NextResponse.json({ data: updated })
}
