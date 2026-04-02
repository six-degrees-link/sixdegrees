'use client'

import { useState, useRef, useEffect } from 'react'

interface SearchResult {
  id: string
  refined_title: string | null
  raw_input: string
  status: string
}

interface Props {
  requirementId: string
  onMerged: (id: string) => void
  onClose: () => void
}

export function MergeDialog({ requirementId, onMerged, onClose }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [selected, setSelected] = useState<SearchResult | null>(null)
  const [merging, setMerging] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    if (!query.trim() || query.length < 3) {
      setResults([])
      return
    }
    const timeout = setTimeout(async () => {
      setSearching(true)
      const res = await fetch(
        `/api/requirements?search=${encodeURIComponent(query)}&limit=10&status=approved`
      )
      const json = await res.json()
      setResults(
        (json.data ?? []).filter((r: SearchResult) => r.id !== requirementId)
      )
      setSearching(false)
    }, 300)
    return () => clearTimeout(timeout)
  }, [query, requirementId])

  async function handleMerge() {
    if (!selected) return
    setMerging(true)
    setError('')

    const res = await fetch(`/api/requirements/${requirementId}/review`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'merged', merged_into: selected.id }),
    })

    const json = await res.json()
    setMerging(false)

    if (!res.ok) {
      setError(json.error ?? 'Failed to merge.')
      return
    }

    onMerged(requirementId)
    onClose()
  }

  return (
    <div className="merge-overlay" role="dialog" aria-modal="true" aria-label="Merge requirement">
      <div className="merge-dialog">
        <div className="merge-dialog__header">
          <h2 className="merge-dialog__title">Merge into another requirement</h2>
          <button className="merge-dialog__close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <p className="merge-dialog__desc">
          Search for the canonical requirement this should be merged into.
          This requirement will be marked as <strong>merged</strong>.
        </p>

        <div className="form-field">
          <label className="form-label" htmlFor="merge-search">Search requirements</label>
          <input
            ref={inputRef}
            id="merge-search"
            type="text"
            className="form-input"
            placeholder="Type a title…"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelected(null) }}
          />
        </div>

        {searching && <p className="merge-dialog__searching">Searching…</p>}

        {results.length > 0 && !selected && (
          <ul className="merge-results">
            {results.map((r) => (
              <li key={r.id}>
                <button
                  className="merge-result-btn"
                  onClick={() => setSelected(r)}
                >
                  <span className="merge-result-btn__title">
                    {r.refined_title ?? r.raw_input.slice(0, 80)}
                  </span>
                  <span className={`badge badge--status badge--${r.status}`}>{r.status}</span>
                </button>
              </li>
            ))}
          </ul>
        )}

        {selected && (
          <div className="merge-selected">
            <span className="merge-selected__label">Merging into:</span>
            <span className="merge-selected__title">
              {selected.refined_title ?? selected.raw_input.slice(0, 80)}
            </span>
            <button
              className="merge-selected__clear"
              onClick={() => setSelected(null)}
            >
              Change
            </button>
          </div>
        )}

        {error && <p className="form-error">{error}</p>}

        <div className="merge-dialog__actions">
          <button
            className="btn btn--secondary"
            onClick={handleMerge}
            disabled={!selected || merging}
          >
            {merging ? 'Merging…' : 'Merge'}
          </button>
          <button className="btn btn--ghost" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  )
}
