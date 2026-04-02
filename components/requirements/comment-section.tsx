'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FlagButton } from './flag-button'

interface Contributor {
  id: string
  display_name: string | null
  avatar_url: string | null
}

interface Comment {
  id: string
  body: string
  created_at: string
  updated_at?: string
  contributors: Contributor
}

interface Props {
  requirementId: string
  initialComments: Comment[]
  isAuthenticated: boolean
  currentUserId?: string | null
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

function CommentItem({
  comment,
  requirementId,
  currentUserId,
  isAuthenticated,
  onDelete,
  onEdit,
}: {
  comment: Comment
  requirementId: string
  currentUserId?: string | null
  isAuthenticated: boolean
  onDelete: (id: string) => void
  onEdit: (id: string, newBody: string) => void
}) {
  const isOwner = currentUserId === comment.contributors.id
  const [editing, setEditing] = useState(false)
  const [editBody, setEditBody] = useState(comment.body)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  async function handleSaveEdit() {
    if (!editBody.trim() || editBody.trim() === comment.body) {
      setEditing(false)
      return
    }
    setSaving(true)
    setError('')
    const res = await fetch(
      `/api/requirements/${requirementId}/comments/${comment.id}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: editBody.trim() }),
      }
    )
    setSaving(false)
    if (!res.ok) {
      const json = await res.json()
      setError(json.error ?? 'Failed to save.')
      return
    }
    onEdit(comment.id, editBody.trim())
    setEditing(false)
  }

  async function handleDelete() {
    if (!confirm('Delete this comment?')) return
    setDeleting(true)
    const res = await fetch(
      `/api/requirements/${requirementId}/comments/${comment.id}`,
      { method: 'DELETE' }
    )
    if (!res.ok) {
      setDeleting(false)
      setError('Failed to delete.')
      return
    }
    onDelete(comment.id)
  }

  return (
    <li className="comment">
      <div className="comment__meta">
        <span className="comment__author">{displayName(comment.contributors)}</span>
        <time className="comment__date" dateTime={comment.created_at}>
          {formatDate(comment.created_at)}
        </time>
        {comment.updated_at && comment.updated_at !== comment.created_at && (
          <span className="comment__edited">(edited)</span>
        )}
        {!editing && (
          <span className="comment__actions">
            {isOwner && (
              <>
                <button
                  className="comment__action-btn"
                  onClick={() => { setEditing(true); setEditBody(comment.body) }}
                  aria-label="Edit comment"
                >
                  Edit
                </button>
                <button
                  className="comment__action-btn comment__action-btn--danger"
                  onClick={handleDelete}
                  disabled={deleting}
                  aria-label="Delete comment"
                >
                  {deleting ? '…' : 'Delete'}
                </button>
              </>
            )}
            {!isOwner && isAuthenticated && (
              <FlagButton
                targetId={comment.id}
                targetType="comment"
                requirementId={requirementId}
                isAuthenticated={isAuthenticated}
              />
            )}
          </span>
        )}
      </div>

      {editing ? (
        <div className="comment__edit">
          <textarea
            className="form-textarea"
            value={editBody}
            onChange={(e) => setEditBody(e.target.value)}
            rows={3}
            maxLength={2000}
            autoFocus
          />
          {error && <p className="form-error">{error}</p>}
          <div className="comment__edit-actions">
            <button
              className="btn btn--secondary"
              onClick={handleSaveEdit}
              disabled={saving || !editBody.trim()}
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button
              className="btn btn--ghost"
              onClick={() => { setEditing(false); setError('') }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <p className="comment__body">{comment.body}</p>
      )}

      {error && !editing && <p className="form-error">{error}</p>}
    </li>
  )
}

export function CommentSection({ requirementId, initialComments, isAuthenticated, currentUserId }: Props) {
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

  function handleDelete(id: string) {
    setComments((prev) => prev.filter((c) => c.id !== id))
  }

  function handleEdit(id: string, newBody: string) {
    setComments((prev) =>
      prev.map((c) => c.id === id ? { ...c, body: newBody, updated_at: new Date().toISOString() } : c)
    )
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
            <CommentItem
              key={c.id}
              comment={c}
              requirementId={requirementId}
              currentUserId={currentUserId}
              isAuthenticated={isAuthenticated}
              onDelete={handleDelete}
              onEdit={handleEdit}
            />
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
