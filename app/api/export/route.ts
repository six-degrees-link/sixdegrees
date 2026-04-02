import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const ExportSchema = z.object({
  format: z.enum(['csv', 'json']).default('json'),
  status: z
    .enum(['approved', 'submitted', 'in_review', 'all'])
    .default('approved'),
})

// ============================================================
// GET /api/export?format=csv|json&status=approved|all
// ============================================================

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const parsed = ExportSchema.safeParse({
    format: searchParams.get('format') ?? 'json',
    status: searchParams.get('status') ?? 'approved',
  })

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message, code: 'VALIDATION_ERROR' },
      { status: 400 }
    )
  }

  const { format, status } = parsed.data
  const supabase = await createClient()

  let query = supabase
    .from('requirements')
    .select(`
      id, refined_title, raw_input, user_story, refined_description,
      acceptance_criteria, persona_type, category, priority_suggestion,
      tags, status, upvotes, downvotes, comment_count, created_at,
      contributors!inner(display_name, email)
    `)
    .order('created_at', { ascending: true })

  if (status === 'all') {
    query = query.in('status', ['approved', 'in_review', 'submitted'])
  } else {
    query = query.eq('status', status)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json(
      { error: 'Failed to fetch requirements', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }

  const filename = `sixdegrees-requirements-${status}-${new Date().toISOString().slice(0, 10)}`

  if (format === 'json') {
    return new NextResponse(JSON.stringify(data, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}.json"`,
      },
    })
  }

  // CSV
  const headers = [
    'id', 'refined_title', 'raw_input', 'user_story', 'refined_description',
    'persona_type', 'category', 'priority_suggestion', 'tags',
    'status', 'upvotes', 'downvotes', 'comment_count', 'contributor', 'created_at',
  ]

  function escapeCsv(val: unknown): string {
    if (val === null || val === undefined) return ''
    const str = Array.isArray(val) ? val.join('; ') : String(val)
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`
    }
    return str
  }

  const rows = (data ?? []).map((r) => {
    const contributor = r.contributors as { display_name: string | null; email: string }
    return [
      r.id,
      r.refined_title,
      r.raw_input,
      r.user_story,
      r.refined_description,
      r.persona_type,
      r.category,
      r.priority_suggestion,
      r.tags,
      r.status,
      r.upvotes,
      r.downvotes,
      r.comment_count,
      contributor.display_name ?? contributor.email,
      r.created_at,
    ].map(escapeCsv).join(',')
  })

  const csv = [headers.join(','), ...rows].join('\n')

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="${filename}.csv"`,
    },
  })
}
