'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Contributor {
  id: string
  display_name: string | null
  avatar_url: string | null
}

interface Comment {
  id: string
  body: string
  created_at: string
  contributors: Contributor
}

interface Props {
  requirementId: string
  initialComments: Comment[]
  isAuthenticated: boolean
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function displayName(c: Contributor) {
  return c.display_name ?? 'Anonymous'
}

export function CommentSection({ requirementId, initialComments, isAuthenticated }: Props) {
  const router = useRouter()
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!body.trim()) return

    if (!isAuthenticated) {
      router.push(`/signin?next=/requirements/${requirementId}`)
      return
    }

    setSubmitting(true)
    setError('')

    const res = await fetch(`/api/requirements/${requirementId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body: body.trim() }),
    })

    const json = await res.json()

    if (!res.ok) {
      setError(json.error ?? 'Failed to post comment.')
      setSubmitting(false)
      return
    }

    setComments((prev) => [...prev, json.data])
    setBody('')
    setSubmitting(false)
  }

  return (
    <section className="comments" id="comments" aria-labelledby="comments-heading">
      <h2 id="comments-heading" className="comments__heading">
        Comments{comments.length > 0 && <span className="comments__count">{comments.length}</span>}
      </h2>

      {comments.length === 0 && (
        <p className="comments__empty">No comments yet. Be the first.</p>
      )}

      {comments.length > 0 && (
        <ol className="comment-list">
          {comments.map((c) => (
            <li key={c.id} className="comment">
              <div className="comment__meta">
                <span className="comment__author">{displayName(c.contributors)}</span>
                <time className="comment__date" dateTime={c.created_at}>
                  {formatDate(c.created_at)}
                </time>
              </div>
              <p className="comment__body">{c.body}</p>
            </li>
          ))}
        </ol>
      )}

      <form className="comment-form" onSubmit={handleSubmit} noValidate>
        <div className="form-field">
          <label htmlFor="comment-body" className="form-label">
            {isAuthenticated ? 'Add a comment' : 'Sign in to comment'}
          </label>
          <textarea
            id="comment-body"
            className="form-textarea"
            placeholder={isAuthenticated ? 'Share your thoughts…' : 'You need to sign in first.'}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={3}
            maxLength={2000}
            disabled={submitting || !isAuthenticated}
          />
        </div>
        {error && (
          <p className="form-error" role="alert">{error}</p>
        )}
        {isAuthenticated ? (
          <button
            type="submit"
            className="btn btn--secondary"
            disabled={submitting || !body.trim()}
          >
            {submitting ? 'Posting…' : 'Post comment'}
          </button>
        ) : (
          <a href={`/signin?next=/requirements/${requirementId}`} className="btn btn--secondary">
            Sign in to comment
          </a>
        )}
      </form>
    </section>
  )
}
