import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/navbar'
import { VoteButtons } from '@/components/requirements/vote-buttons'
import { CommentSection } from '@/components/requirements/comment-section'

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase
    .from('requirements')
    .select('refined_title, raw_input')
    .eq('id', id)
    .single()

  const title = data?.refined_title ?? data?.raw_input?.slice(0, 80) ?? 'Requirement'
  return { title: `${title} — SixDegrees` }
}

function StatusBadge({ status }: { status: string }) {
  const labels: Record<string, string> = {
    draft: 'Draft',
    submitted: 'Submitted',
    in_review: 'In Review',
    approved: 'Approved',
    rejected: 'Rejected',
    merged: 'Merged',
  }
  return (
    <span className={`badge badge--status badge--${status}`}>
      {labels[status] ?? status}
    </span>
  )
}

function PersonaBadge({ persona }: { persona: string }) {
  const labels: Record<string, string> = {
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
  return <span className="badge badge--persona">{labels[persona] ?? persona}</span>
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export default async function RequirementPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  // Fetch requirement + contributor
  const { data: req, error } = await supabase
    .from('requirements')
    .select('*, contributors!inner(id, display_name, avatar_url, email)')
    .eq('id', id)
    .single()

  if (error || !req) notFound()

  // Fetch user's vote
  let userVote: 'up' | 'down' | null = null
  if (user) {
    const { data: vote } = await supabase
      .from('requirement_votes')
      .select('vote_type')
      .eq('requirement_id', id)
      .eq('contributor_id', user.id)
      .maybeSingle()
    userVote = (vote?.vote_type as 'up' | 'down') ?? null
  }

  // Fetch initial comments
  const { data: comments } = await supabase
    .from('requirement_comments')
    .select('*, contributors!inner(id, display_name, avatar_url)')
    .eq('requirement_id', id)
    .order('created_at', { ascending: true })
    .limit(50)

  const contributor = req.contributors as { id: string; display_name: string | null; avatar_url: string | null; email: string }
  const authorName = contributor.display_name ?? contributor.email.split('@')[0]
  const acceptanceCriteria = Array.isArray(req.acceptance_criteria) ? req.acceptance_criteria as string[] : []
  const tags = Array.isArray(req.tags) ? req.tags as string[] : []

  return (
    <div className="layout">
      <Navbar />
      <main className="page-content" id="main-content">

        {/* Back */}
        <Link href="/browse" className="req-back">
          ← Browse
        </Link>

        <div className="req-layout">

          {/* ── Main column ───────────────────────────── */}
          <div className="req-main">

            {/* Header */}
            <div className="req-header">
              <div className="req-badges">
                <StatusBadge status={req.status} />
                {req.persona_type && <PersonaBadge persona={req.persona_type} />}
                {req.category && (
                  <span className="badge badge--category">{req.category}</span>
                )}
              </div>

              <h1 className="req-title">
                {req.refined_title ?? req.raw_input.slice(0, 100)}
              </h1>

              <p className="req-meta">
                Submitted by <strong>{authorName}</strong> · {formatDate(req.created_at)}
              </p>
            </div>

            {/* User story */}
            {req.user_story && (
              <div className="req-section">
                <h2 className="req-section__title">User story</h2>
                <p className="req-user-story">{req.user_story}</p>
              </div>
            )}

            {/* Refined description */}
            {req.refined_description && (
              <div className="req-section">
                <h2 className="req-section__title">Description</h2>
                <p className="req-body">{req.refined_description}</p>
              </div>
            )}

            {/* Acceptance criteria */}
            {acceptanceCriteria.length > 0 && (
              <div className="req-section">
                <h2 className="req-section__title">Acceptance criteria</h2>
                <ol className="req-criteria">
                  {acceptanceCriteria.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ol>
              </div>
            )}

            {/* Raw input — always shown, collapsed if refined content exists */}
            <div className="req-section">
              <h2 className="req-section__title">
                {req.refined_title ? 'Original request' : 'Request'}
              </h2>
              <blockquote className="req-raw">{req.raw_input}</blockquote>
            </div>

            {/* Tags */}
            {tags.length > 0 && (
              <div className="req-tags">
                {tags.map((t) => (
                  <span key={t} className="badge badge--tag">{t}</span>
                ))}
              </div>
            )}

            {/* Comments */}
            <div className="req-section">
              <CommentSection
                requirementId={id}
                initialComments={(comments ?? []) as Parameters<typeof CommentSection>[0]['initialComments']}
                isAuthenticated={!!user}
              />
            </div>

          </div>

          {/* ── Sidebar ───────────────────────────────── */}
          <aside className="req-sidebar">

            <div className="req-sidebar__card">
              <p className="req-sidebar__label">Votes</p>
              <VoteButtons
                requirementId={id}
                initialUpvotes={req.upvotes}
                initialDownvotes={req.downvotes}
                initialVote={userVote}
                isAuthenticated={!!user}
              />
            </div>

            {req.priority_suggestion && (
              <div className="req-sidebar__card">
                <p className="req-sidebar__label">Priority</p>
                <p className="req-sidebar__value">{req.priority_suggestion}</p>
              </div>
            )}

            <div className="req-sidebar__card">
              <p className="req-sidebar__label">Status</p>
              <StatusBadge status={req.status} />
            </div>

          </aside>
        </div>
      </main>
    </div>
  )
}
