'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback, useTransition, useState, useEffect } from 'react'
import { Search, X } from 'lucide-react'
import { PERSONAS, CATEGORIES } from '@/lib/constants/personas'

export function FilterBar() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()

  const currentPersona = searchParams.get('persona_type') ?? ''
  const currentCategory = searchParams.get('category') ?? ''
  const currentSort = searchParams.get('sort') ?? 'newest'
  const currentSearch = searchParams.get('search') ?? ''

  const [searchValue, setSearchValue] = useState(currentSearch)

  // Sync search input if URL changes externally (e.g. browser back)
  useEffect(() => {
    setSearchValue(searchParams.get('search') ?? '')
  }, [searchParams])

  const update = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      params.delete('page') // reset pagination on filter change
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`)
      })
    },
    [pathname, router, searchParams]
  )

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      const current = searchParams.get('search') ?? ''
      if (searchValue !== current) {
        update('search', searchValue)
      }
    }, 400)
    return () => clearTimeout(timer)
  }, [searchValue]) // eslint-disable-line react-hooks/exhaustive-deps

  const hasFilters = !!(currentPersona || currentCategory || currentSearch || currentSort !== 'newest')

  function clearAll() {
    setSearchValue('')
    startTransition(() => {
      router.push(pathname)
    })
  }

  return (
    <div className="filter-bar">
      {/* Search */}
      <div className="filter-search">
        <Search size={14} strokeWidth={1.5} className="filter-search__icon" aria-hidden />
        <input
          type="search"
          placeholder="Search requirements…"
          className="filter-search__input"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          aria-label="Search requirements"
        />
        {searchValue && (
          <button
            type="button"
            className="filter-search__clear"
            onClick={() => setSearchValue('')}
            aria-label="Clear search"
          >
            <X size={13} strokeWidth={1.5} />
          </button>
        )}
      </div>

      {/* Persona */}
      <select
        className="form-select filter-select"
        value={currentPersona}
        onChange={(e) => update('persona_type', e.target.value)}
        aria-label="Filter by persona"
      >
        <option value="">All personas</option>
        {PERSONAS.map((p) => (
          <option key={p.value} value={p.value}>{p.label}</option>
        ))}
      </select>

      {/* Category */}
      <select
        className="form-select filter-select"
        value={currentCategory}
        onChange={(e) => update('category', e.target.value)}
        aria-label="Filter by category"
      >
        <option value="">All categories</option>
        {CATEGORIES.map((c) => (
          <option key={c.value} value={c.value}>{c.label}</option>
        ))}
      </select>

      {/* Sort */}
      <select
        className="form-select filter-select"
        value={currentSort}
        onChange={(e) => update('sort', e.target.value)}
        aria-label="Sort by"
      >
        <option value="newest">Newest</option>
        <option value="oldest">Oldest</option>
        <option value="votes">Most voted</option>
      </select>

      {/* Clear all */}
      {hasFilters && (
        <button type="button" className="btn btn--ghost filter-clear" onClick={clearAll}>
          Clear
        </button>
      )}
    </div>
  )
}
