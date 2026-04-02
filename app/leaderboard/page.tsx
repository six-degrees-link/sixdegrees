import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/navbar'

export const metadata: Metadata = {
  title: 'Leaderboard',
  description: 'Top contributors to the SixDegrees requirements platform.',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
}

export default async function LeaderboardPage() {
  const supabase = await createClient()

  // Aggregate: approved submissions + total upvotes received per contributor
  const { data: requirements } = await supabase
    .from('requirements')
    .select('contributor_id, upvotes, contributors!inner(id, display_name, email, created_at)')
    .in('status', ['approved', 'in_review', 'submitted'])
    .order('created_at', { ascending: true })

  // Aggregate per contributor
  const map = new Map<string, {
    id: string
    display_name: string | null
    email: string
    created_at: string
    submissions: number
    upvotes: number
  }>()

  for (const r of requirements ?? []) {
    const c = r.contributors as { id: string; display_name: string | null; email: string; created_at: string }
    const existing = map.get(c.id)
    if (existing) {
      existing.submissions += 1
      existing.upvotes += r.upvotes
    } else {
      map.set(c.id, {
        id: c.id,
        display_name: c.display_name,
        email: c.email,
        created_at: c.created_at,
        submissions: 1,
        upvotes: r.upvotes,
      })
    }
  }

  const entries = Array.from(map.values())
    .sort((a, b) => b.submissions - a.submissions || b.upvotes - a.upvotes)

  const maxSubmissions = entries[0]?.submissions ?? 1
  const maxUpvotes = Math.max(...entries.map((e) => e.upvotes), 1)

  return (
    <div className="layout">
      <Navbar />
      <main className="page-content" id="main-content">
        <div className="page-header">
          <h1 className="page-title">Leaderboard</h1>
          <p className="page-subtitle">
            Contributors ranked by requirements submitted and community upvotes received.
          </p>
        </div>

        {entries.length === 0 ? (
          <p className="leaderboard-empty">No contributions yet.</p>
        ) : (
          <div className="leaderboard">
            <div className="leaderboard-table-wrap">
              <table className="leaderboard-table">
                <thead>
                  <tr>
                    <th className="leaderboard-th leaderboard-th--rank">#</th>
                    <th className="leaderboard-th">Contributor</th>
                    <th className="leaderboard-th">Requirements</th>
                    <th className="leaderboard-th">Upvotes received</th>
                    <th className="leaderboard-th">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry, i) => {
                    const name = entry.display_name ?? entry.email.split('@')[0]
                    const submissionPct = Math.round((entry.submissions / maxSubmissions) * 100)
                    const upvotePct = Math.round((entry.upvotes / maxUpvotes) * 100)
                    return (
                      <tr key={entry.id} className={`leaderboard-row${i < 3 ? ` leaderboard-row--top-${i + 1}` : ''}`}>
                        <td className="leaderboard-td leaderboard-td--rank">
                          {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                        </td>
                        <td className="leaderboard-td leaderboard-td--name">
                          <span className="leaderboard-name">{name}</span>
                        </td>
                        <td className="leaderboard-td">
                          <div className="leaderboard-bar-wrap">
                            <span className="leaderboard-count">{entry.submissions}</span>
                            <div className="leaderboard-bar">
                              <div
                                className="leaderboard-bar__fill leaderboard-bar__fill--submissions"
                                style={{ width: `${submissionPct}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="leaderboard-td">
                          <div className="leaderboard-bar-wrap">
                            <span className="leaderboard-count">{entry.upvotes}</span>
                            <div className="leaderboard-bar">
                              <div
                                className="leaderboard-bar__fill leaderboard-bar__fill--upvotes"
                                style={{ width: `${upvotePct}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="leaderboard-td leaderboard-td--date">
                          {formatDate(entry.created_at)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="leaderboard-footer">
          <Link href="/browse" className="btn btn--ghost">← Browse requirements</Link>
          <Link href="/submit" className="btn btn--primary">Contribute</Link>
        </div>
      </main>
    </div>
  )
}
