'use client'

import { useState } from 'react'
import { CheckCircle, XCircle, Clock, Loader2, Merge } from 'lucide-react'
import { MergeDialog } from './merge-dialog'

type Status = 'draft' | 'submitted' | 'in_review' | 'approved' | 'rejected' | 'merged'

interface Props {
  requirementId: string
  currentStatus: Status
  onStatusChange: (id: string, newStatus: Status) => void
}

const TRANSITIONS: Record<Status, { value: Status; label: string }[]> = {
  draft:      [{ value: 'in_review', label: 'Mark in review' }, { value: 'approved', label: 'Approve' }, { value: 'rejected', label: 'Reject' }],
  submitted:  [{ value: 'in_review', label: 'Mark in review' }, { value: 'approved', label: 'Approve' }, { value: 'rejected', label: 'Reject' }],
  in_review:  [{ value: 'approved', label: 'Approve' }, { value: 'rejected', label: 'Reject' }],
  approved:   [{ value: 'rejected', label: 'Reject' }],
  rejected:   [{ value: 'in_review', label: 'Restore' }, { value: 'approved', label: 'Approve' }],
  merged:     [],
}

const MERGEABLE: Status[] = ['submitted', 'in_review', 'approved']

export function ReviewActions({ requirementId, currentStatus, onStatusChange }: Props) {
  const [loading, setLoading] = useState<Status | null>(null)
  const [error, setError] = useState('')
  const [showMerge, setShowMerge] = useState(false)

  const actions = TRANSITIONS[currentStatus] ?? []
  const canMerge = MERGEABLE.includes(currentStatus)

  if (actions.length === 0 && !canMerge) return <span className="review-actions__done">—</span>

  async function handleAction(newStatus: Status) {
    setLoading(newStatus)
    setError('')

    const res = await fetch(`/api/requirements/${requirementId}/review`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })

    if (res.ok) {
      onStatusChange(requirementId, newStatus)
    } else {
      const json = await res.json()
      setError(json.error ?? 'Failed.')
    }

    setLoading(null)
  }

  return (
    <>
      <div className="review-actions">
        {actions.map((action) => (
          <button
            key={action.value}
            type="button"
            className={`review-btn review-btn--${action.value}`}
            onClick={() => handleAction(action.value)}
            disabled={loading !== null}
            title={action.label}
          >
            {loading === action.value ? (
              <Loader2 size={13} strokeWidth={1.5} className="spin" />
            ) : action.value === 'approved' ? (
              <CheckCircle size={13} strokeWidth={1.5} />
            ) : action.value === 'rejected' ? (
              <XCircle size={13} strokeWidth={1.5} />
            ) : (
              <Clock size={13} strokeWidth={1.5} />
            )}
            {action.label}
          </button>
        ))}
        {canMerge && (
          <button
            type="button"
            className="review-btn review-btn--merged"
            onClick={() => setShowMerge(true)}
            disabled={loading !== null}
            title="Merge into another requirement"
          >
            <Merge size={13} strokeWidth={1.5} />
            Merge
          </button>
        )}
        {error && <span className="review-actions__error">{error}</span>}
      </div>

      {showMerge && (
        <MergeDialog
          requirementId={requirementId}
          onMerged={(id) => onStatusChange(id, 'merged')}
          onClose={() => setShowMerge(false)}
        />
      )}
    </>
  )
}
