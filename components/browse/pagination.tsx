import Link from 'next/link'

interface PaginationProps {
  page: number
  total: number
  limit: number
  baseUrl: string
}

export function Pagination({ page, total, limit, baseUrl }: PaginationProps) {
  const totalPages = Math.ceil(total / limit)
  if (totalPages <= 1) return null

  function pageUrl(p: number) {
    const url = new URL(baseUrl, 'http://x')
    url.searchParams.set('page', String(p))
    return url.pathname + url.search
  }

  return (
    <nav className="pagination" aria-label="Pagination">
      {page > 1 ? (
        <Link href={pageUrl(page - 1)} className="btn btn--secondary">
          ← Previous
        </Link>
      ) : (
        <span className="btn btn--secondary btn--disabled" aria-disabled>← Previous</span>
      )}

      <span className="pagination__info">
        Page {page} of {totalPages}
        <span className="pagination__total">({total.toLocaleString()} total)</span>
      </span>

      {page < totalPages ? (
        <Link href={pageUrl(page + 1)} className="btn btn--secondary">
          Next →
        </Link>
      ) : (
        <span className="btn btn--secondary btn--disabled" aria-disabled>Next →</span>
      )}
    </nav>
  )
}
