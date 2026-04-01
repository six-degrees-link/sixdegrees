import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/auth/admin'
import { Navbar } from '@/components/navbar'
import { AdminQueue } from '@/components/admin/admin-queue'

export const metadata: Metadata = {
  title: 'Admin',
}

const STATUS_COLOURS: Record<string, string> = {
  draft: '#6b6f76',
  submitted: '#a5adff',
  in_review: '#fbbf24',
  approved: '#4ade80',
  rejected: '#f87171',
  merged: '#c084fc',
}

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/signin?next=/admin')
  if (!isAdmin(user)) redirect('/')

  // Stats
  const { data: statusCounts } = await supabase
    .from('requirements')
    .select('status')

  const counts = (statusCounts ?? []).reduce<Record<string, number>>((acc, r) => {
    acc[r.status] = (acc[r.status] ?? 0) + 1
    return acc
  }, {})

  // Pending queue — submitted + in_review, newest first
  const { data: pending } = await supabase
    .from('requirements')
    .select(`
      id, refined_title, raw_input, persona_type, category,
      status, upvotes, comment_count, created_at,
      contributors!inner(id, display_name, email)
    `)
    .in('status', ['submitted', 'in_review'])
    .order('created_at', { ascending: false })
    .limit(100)

  const statusOrder = ['submitted', 'in_review', 'approved', 'rejected', 'draft', 'merged']

  return (
    <div className="layout">
      <Navbar />
      <main className="page-content" id="main-content">
        <div className="admin-header">
          <div>
            <h1 className="page-title">Admin</h1>
            <p className="page-subtitle">Review and moderate community requirements.</p>
          </div>
          <Link href="/browse" className="btn btn--ghost">← Browse</Link>
        </div>

        {/* Stats */}
        <div className="admin-stats">
          {statusOrder.map((s) => (
            <div key={s} className="admin-stat">
              <span className="admin-stat__count" style={{ color: STATUS_COLOURS[s] }}>
                {counts[s] ?? 0}
              </span>
              <span className="admin-stat__label">{s.replace('_', ' ')}</span>
            </div>
          ))}
        </div>

        {/* Queue */}
        <div className="admin-section">
          <h2 className="admin-section__title">
            Pending review
            {(counts.submitted ?? 0) + (counts.in_review ?? 0) > 0 && (
              <span className="admin-section__badge">
                {(counts.submitted ?? 0) + (counts.in_review ?? 0)}
              </span>
            )}
          </h2>

          {!pending || pending.length === 0 ? (
            <p className="admin-empty">Nothing pending review.</p>
          ) : (
            <AdminQueue
              initialItems={pending.map((r) => ({
                id: r.id,
                refined_title: r.refined_title,
                raw_input: r.raw_input,
                persona_type: r.persona_type,
                category: r.category,
                status: r.status as 'submitted' | 'in_review',
                upvotes: r.upvotes,
                comment_count: r.comment_count,
                created_at: r.created_at,
                contributor: r.contributors as { id: string; display_name: string | null; email: string },
              }))}
            />
          )}
        </div>
      </main>
    </div>
  )
}
