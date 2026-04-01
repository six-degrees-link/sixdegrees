'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronUp, ChevronDown } from 'lucide-react'

interface Props {
  requirementId: string
  initialUpvotes: number
  initialDownvotes: number
  initialVote: 'up' | 'down' | null
  isAuthenticated: boolean
}

export function VoteButtons({
  requirementId,
  initialUpvotes,
  initialDownvotes,
  initialVote,
  isAuthenticated,
}: Props) {
  const router = useRouter()
  const [upvotes, setUpvotes] = useState(initialUpvotes)
  const [downvotes, setDownvotes] = useState(initialDownvotes)
  const [currentVote, setCurrentVote] = useState(initialVote)
  const [loading, setLoading] = useState(false)

  async function handleVote(type: 'up' | 'down') {
    if (!isAuthenticated) {
      router.push(`/signin?next=/requirements/${requirementId}`)
      return
    }

    if (loading) return
    setLoading(true)

    const isRemoving = currentVote === type

    const res = isRemoving
      ? await fetch(`/api/requirements/${requirementId}/vote`, { method: 'DELETE' })
      : await fetch(`/api/requirements/${requirementId}/vote`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ vote_type: type }),
        })

    if (res.ok) {
      const { data } = await res.json()
      setUpvotes(data.upvotes)
      setDownvotes(data.downvotes)
      setCurrentVote(isRemoving ? null : type)
    }

    setLoading(false)
  }

  return (
    <div className="vote-buttons" aria-label="Vote on this requirement">
      <button
        type="button"
        className={`vote-btn${currentVote === 'up' ? ' vote-btn--active-up' : ''}`}
        onClick={() => handleVote('up')}
        disabled={loading}
        aria-label={`Upvote (${upvotes})`}
        aria-pressed={currentVote === 'up'}
      >
        <ChevronUp size={16} strokeWidth={1.5} />
        <span>{upvotes}</span>
      </button>
      <button
        type="button"
        className={`vote-btn${currentVote === 'down' ? ' vote-btn--active-down' : ''}`}
        onClick={() => handleVote('down')}
        disabled={loading}
        aria-label={`Downvote (${downvotes})`}
        aria-pressed={currentVote === 'down'}
      >
        <ChevronDown size={16} strokeWidth={1.5} />
        <span>{downvotes}</span>
      </button>
    </div>
  )
}
