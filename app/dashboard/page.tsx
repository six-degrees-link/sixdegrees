import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/navbar'
import { PERSONAS, CATEGORIES } from '@/lib/constants/personas'

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Persona and category coverage of community requirements.',
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: requirements } = await supabase
    .from('requirements')
    .select('persona_type, category, status')
    .in('status', ['approved', 'in_review', 'submitted'])

  const all = requirements ?? []
  const total = all.length

  // Count per persona
  const personaCounts = new Map<string, number>()
  for (const r of all) {
    if (r.persona_type) {
      personaCounts.set(r.persona_type, (personaCounts.get(r.persona_type) ?? 0) + 1)
    }
  }

  // Count per category
  const categoryCounts = new Map<string, number>()
  for (const r of all) {
    if (r.category) {
      categoryCounts.set(r.category, (categoryCounts.get(r.category) ?? 0) + 1)
    }
  }

  const maxPersona = Math.max(...PERSONAS.map((p) => personaCounts.get(p.value) ?? 0), 1)
  const maxCategory = Math.max(...CATEGORIES.map((c) => categoryCounts.get(c.value) ?? 0), 1)

  return (
    <div className="layout">
      <Navbar />
      <main className="page-content" id="main-content">
        <div className="page-header">
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">
            {total > 0
              ? `Coverage across ${total.toLocaleString()} requirement${total === 1 ? '' : 's'} — see where the gaps are.`
              : 'No requirements yet.'}
          </p>
        </div>

        <div className="dashboard-grid">

          {/* Persona coverage */}
          <section className="dashboard-section">
            <h2 className="dashboard-section__title">Persona coverage</h2>
            <p className="dashboard-section__desc">
              Which user types have the most requirements submitted.
            </p>
            <div className="coverage-list">
              {PERSONAS.map((p) => {
                const count = personaCounts.get(p.value) ?? 0
                const pct = total > 0 ? Math.round((count / maxPersona) * 100) : 0
                const coveragePct = total > 0 ? Math.round((count / total) * 100) : 0
                return (
                  <div key={p.value} className="coverage-row">
                    <div className="coverage-row__label">
                      <span className="coverage-row__name">{p.label}</span>
                      <span className="coverage-row__count">{count}</span>
                    </div>
                    <div className="coverage-bar">
                      <div
                        className={`coverage-bar__fill${count === 0 ? ' coverage-bar__fill--zero' : ''}`}
                        style={{ width: `${pct}%` }}
                        aria-label={`${count} requirements, ${coveragePct}% of total`}
                      />
                    </div>
                    <Link
                      href={`/browse?persona_type=${p.value}`}
                      className="coverage-row__link"
                      aria-label={`Browse ${p.label} requirements`}
                    >
                      Browse →
                    </Link>
                  </div>
                )
              })}
            </div>
          </section>

          {/* Category coverage */}
          <section className="dashboard-section">
            <h2 className="dashboard-section__title">Category coverage</h2>
            <p className="dashboard-section__desc">
              Which feature areas have the most requirements.
            </p>
            <div className="coverage-list">
              {CATEGORIES.map((c) => {
                const count = categoryCounts.get(c.value) ?? 0
                const pct = total > 0 ? Math.round((count / maxCategory) * 100) : 0
                return (
                  <div key={c.value} className="coverage-row">
                    <div className="coverage-row__label">
                      <span className="coverage-row__name">{c.label}</span>
                      <span className="coverage-row__count">{count}</span>
                    </div>
                    <div className="coverage-bar">
                      <div
                        className={`coverage-bar__fill coverage-bar__fill--category${count === 0 ? ' coverage-bar__fill--zero' : ''}`}
                        style={{ width: `${pct}%` }}
                        aria-label={`${count} requirements`}
                      />
                    </div>
                    <Link
                      href={`/browse?category=${c.value}`}
                      className="coverage-row__link"
                      aria-label={`Browse ${c.label} requirements`}
                    >
                      Browse →
                    </Link>
                  </div>
                )
              })}
            </div>
          </section>

        </div>

        <div className="dashboard-footer">
          <Link href="/submit" className="btn btn--primary">Fill a gap</Link>
          <Link href="/leaderboard" className="btn btn--ghost">Leaderboard →</Link>
        </div>
      </main>
    </div>
  )
}
