import Link from 'next/link'
import { MessageSquare, ChevronUp } from 'lucide-react'

interface Contributor {
  display_name: string | null
  email: string
}

interface RequirementCardProps {
  id: string
  refined_title: string | null
  raw_input: string
  persona_type: string | null
  category: string | null
  status: string
  upvotes: number
  downvotes: number
  comment_count: number
  created_at: string
  contributors: Contributor
}

const PERSONA_LABELS: Record<string, string> = {
  general_user: 'Connected Professional',
  job_seeker: 'Job Seeker',
  employer: 'Employer',
  recruiter: 'Recruiter',
  content_moderator: 'Content Moderator',
  content_creator: 'Content Creator',
  company: 'Company',
  service_provider: 'Service Provider',
  coach: 'Coach',
  educator: 'Educator',
  platform_admin: 'Platform Admin',
}

const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  in_review: 'In Review',
  approved: 'Approved',
  rejected: 'Rejected',
  merged: 'Merged',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function RequirementCard({
  id,
  refined_title,
  raw_input,
  persona_type,
  category,
  status,
  upvotes,
  downvotes,
  comment_count,
  created_at,
  contributors,
}: RequirementCardProps) {
  const title = refined_title ?? raw_input.slice(0, 100)
  const preview = !refined_title ? null : raw_input.slice(0, 120)
  const score = upvotes - downvotes
  const authorName = contributors.display_name ?? contributors.email.split('@')[0]

  return (
    <Link href={`/requirements/${id}`} className="req-card card">
      <div className="req-card__header">
        <div className="req-card__badges">
          {persona_type && (
            <span className="badge badge--persona">
              {PERSONA_LABELS[persona_type] ?? persona_type}
            </span>
          )}
          {category && (
            <span className="badge badge--category">{category}</span>
          )}
          <span className={`badge badge--status badge--${status}`}>
            {STATUS_LABELS[status] ?? status}
          </span>
        </div>
      </div>

      <h2 className="req-card__title">{title}</h2>

      {preview && (
        <p className="req-card__preview">{preview}{raw_input.length > 120 ? '…' : ''}</p>
      )}

      <div className="req-card__footer">
        <span className="req-card__author">{authorName} · {formatDate(created_at)}</span>
        <div className="req-card__stats">
          <span className="req-card__stat" aria-label={`${score} votes`}>
            <ChevronUp size={14} strokeWidth={1.5} />
            {score}
          </span>
          <span className="req-card__stat" aria-label={`${comment_count} comments`}>
            <MessageSquare size={13} strokeWidth={1.5} />
            {comment_count}
          </span>
        </div>
      </div>
    </Link>
  )
}
