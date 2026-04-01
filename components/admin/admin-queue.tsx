'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ReviewActions } from './review-actions'

type Status = 'draft' | 'submitted' | 'in_review' | 'approved' | 'rejected' | 'merged'

interface QueueItem {
  id: string
  refined_title: string | null
  raw_input: string
  persona_type: string | null
  category: string | null
  status: Status
  upvotes: number
  comment_count: number
  created_at: string
  contributor: { id: string; display_name: string | null; email: string }
}

const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft', submitted: 'Submitted', in_review: 'In Review',
  approved: 'Approved', rejected: 'Rejected', merged: 'Merged',
}

const PERSONA_LABELS: Record<string, string> = {
  general_user: 'Connected Pro', job_seeker: 'Job Seeker', employer: 'Employer',
  recruiter: 'Recruiter', content_moderator: 'Moderator', content_creator: 'Creator',
  company: 'Company', service_provider: 'Provider', coach: 'Coach',
  educator: 'Educator', platform_admin: 'Admin',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function AdminQueue({ initialItems }: { initialItems: QueueItem[] }) {
  const [items, setItems] = useState<QueueItem[]>(initialItems)

  function handleStatusChange(id: string, newStatus: Status) {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    )
  }

  // Group: in_review first, then submitted
  const sorted = [...items].sort((a, b) => {
    if (a.status === 'in_review' && b.status !== 'in_review') return -1
    if (b.status === 'in_review' && a.status !== 'in_review') return 1
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  return (
    <div className="admin-queue">
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Requirement</th>
              <th>Persona</th>
              <th>Status</th>
              <th>Contributor</th>
              <th>Submitted</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((item) => {
              const title = item.refined_title ?? item.raw_input.slice(0, 80)
              const authorName = item.contributor.display_name ?? item.contributor.email.split('@')[0]
              return (
                <tr key={item.id} className={`admin-row admin-row--${item.status}`}>
                  <td className="admin-td--title">
                    <Link href={`/requirements/${item.id}`} className="admin-req-link" target="_blank">
                      {title}
                      {item.refined_title && item.raw_input && (
                        <span className="admin-req-raw">{item.raw_input.slice(0, 60)}{item.raw_input.length > 60 ? '…' : ''}</span>
                      )}
                    </Link>
                    <div className="admin-req-meta">
                      {item.category && <span className="badge badge--category">{item.category}</span>}
                      <span className="admin-req-votes">▲ {item.upvotes}</span>
                      {item.comment_count > 0 && (
                        <span className="admin-req-votes">💬 {item.comment_count}</span>
                      )}
                    </div>
                  </td>
                  <td>
                    {item.persona_type && (
                      <span className="badge badge--persona">
                        {PERSONA_LABELS[item.persona_type] ?? item.persona_type}
                      </span>
                    )}
                  </td>
                  <td>
                    <span className={`badge badge--status badge--${item.status}`}>
                      {STATUS_LABELS[item.status]}
                    </span>
                  </td>
                  <td className="admin-td--author">
                    <span className="admin-author">{authorName}</span>
                    <span className="admin-author-email">{item.contributor.email}</span>
                  </td>
                  <td className="admin-td--date">{formatDate(item.created_at)}</td>
                  <td>
                    <ReviewActions
                      requirementId={item.id}
                      currentStatus={item.status}
                      onStatusChange={handleStatusChange}
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
