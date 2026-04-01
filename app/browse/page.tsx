import type { Metadata } from 'next'
import { Suspense } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/navbar'
import { FilterBar } from '@/components/browse/filter-bar'
import { RequirementCard } from '@/components/browse/requirement-card'
import { Pagination } from '@/components/browse/pagination'
import { RequirementsQuerySchema } from '@/lib/validators/requirements'

export const metadata: Metadata = {
  title: 'Browse requirements',
  description: 'Community-submitted requirements for the SixDegrees platform.',
}

type PageProps = {
  searchParams: Promise<Record<string, string | string[]>>
}

const LIMIT = 20

export default async function BrowsePage({ searchParams }: PageProps) {
  const raw = await searchParams

  // Flatten arrays to first value for Zod parsing
  const flat = Object.fromEntries(
    Object.entries(raw).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v])
  )

  const parsed = RequirementsQuerySchema.safeParse({ ...flat, limit: LIMIT })
  const query = parsed.success ? parsed.data : { sort: 'newest' as const, page: 1, limit: LIMIT }

  const supabase = await createClient()

  let dbQuery = supabase
    .from('requirements')
    .select(
      `id, refined_title, raw_input, persona_type, category, status,
       upvotes, downvotes, comment_count, created_at,
       contributors!inner(display_name, email)`,
      { count: 'exact' }
    )

  // Status filter — default excludes draft/rejected/merged
  if (query.status) {
    dbQuery = dbQuery.eq('status', query.status)
  } else {
    dbQuery = dbQuery.in('status', ['submitted', 'in_review', 'approved'])
  }

  if (query.persona_type) dbQuery = dbQuery.eq('persona_type', query.persona_type)
  if (query.category) dbQuery = dbQuery.eq('category', query.category)

  if (query.search) {
    dbQuery = dbQuery.textSearch('search_vector', query.search, { type: 'websearch' })
  }

  if (query.sort === 'votes') {
    dbQuery = dbQuery.order('upvotes', { ascending: false })
  } else if (query.sort === 'oldest') {
    dbQuery = dbQuery.order('created_at', { ascending: true })
  } else {
    dbQuery = dbQuery.order('created_at', { ascending: false })
  }

  const offset = (query.page - 1) * LIMIT
  dbQuery = dbQuery.range(offset, offset + LIMIT - 1)

  const { data: requirements, count } = await dbQuery

  const total = count ?? 0
  const currentUrl = '/browse?' + new URLSearchParams(flat).toString()

  return (
    <div className="layout">
      <Navbar />
      <main className="page-content" id="main-content">
        <div className="browse-header">
          <div>
            <h1 className="page-title">Requirements</h1>
            <p className="page-subtitle">
              {total > 0
                ? `${total.toLocaleString()} requirement${total === 1 ? '' : 's'} from the community`
                : 'No requirements match your filters'}
            </p>
          </div>
          <Link href="/submit" className="btn btn--primary">
            Contribute
          </Link>
        </div>

        {/* Filter bar — wrapped in Suspense because it uses useSearchParams */}
        <Suspense fallback={<div className="filter-bar-skeleton" />}>
          <FilterBar />
        </Suspense>

        {/* Results */}
        {!requirements || requirements.length === 0 ? (
          <div className="browse-empty">
            <p className="browse-empty__text">Nothing here yet.</p>
            <Link href="/submit" className="btn btn--secondary">
              Submit the first one
            </Link>
          </div>
        ) : (
          <div className="req-grid">
            {requirements.map((r) => (
              <RequirementCard
                key={r.id}
                {...r}
                contributors={r.contributors as { display_name: string | null; email: string }}
              />
            ))}
          </div>
        )}

        <Pagination
          page={query.page}
          total={total}
          limit={LIMIT}
          baseUrl={currentUrl}
        />
      </main>
    </div>
  )
}
