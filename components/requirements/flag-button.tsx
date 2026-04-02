'use client'

import { useState } from 'react'

interface Props {
  targetId: string
  targetType: 'requirement' | 'comment'
  requirementId: string
  isAuthenticated: boolean
}

export function FlagButton({ targetId, targetType, requirementId, isAuthenticated }: Props) {
  const [flagged, setFlagged] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!isAuthenticated || flagged) {
    return flagged ? (
      <span className="flag-btn flag-btn--done" aria-label="Flagged for review">Flagged</span>
    ) : null
  }

  async function handleFlag() {
    setLoading(true)
    setError('')

    const url = targetType === 'requirement'
      ? `/api/requirements/${targetId}/flag`
      : `/api/requirements/${requirementId}/comments/${targetId}/flag`

    const res = await fetch(url, { method: 'POST' })
    setLoading(false)

    if (!res.ok) {
      const json = await res.json()
      setError(json.error ?? 'Failed to flag.')
      return
    }

    setFlagged(true)
  }

  return (
    <span className="flag-wrap">
      <button
        className="flag-btn"
        onClick={handleFlag}
        disabled={loading}
        aria-label="Flag for review"
        title="Flag this for admin review"
      >
        {loading ? '…' : 'Flag'}
      </button>
      {error && <span className="flag-error">{error}</span>}
    </span>
  )
}
