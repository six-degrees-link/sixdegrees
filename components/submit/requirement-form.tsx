'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles, AlertCircle, ChevronRight } from 'lucide-react'
import { PERSONAS, CATEGORIES } from '@/lib/constants/personas'
import type { PersonaType, FeatureCategory } from '@/lib/validators/requirements'
import type { RefinementResult } from '@/lib/claude/parse'

type Step = 'persona' | 'details' | 'review'

interface SimilarRequirement {
  id: string
  refined_title: string | null
}

interface RefinementData extends RefinementResult {
  similar_existing: SimilarRequirement[]
}

export function RequirementForm() {
  const router = useRouter()

  // Step state
  const [step, setStep] = useState<Step>('persona')

  // Form fields
  const [persona, setPersona] = useState<PersonaType | null>(null)
  const [category, setCategory] = useState<FeatureCategory | ''>('')
  const [rawInput, setRawInput] = useState('')

  // Refinement
  const [refining, setRefining] = useState(false)
  const [refineError, setRefineError] = useState('')
  const [refinement, setRefinement] = useState<RefinementData | null>(null)

  // Submission
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  // ── Handlers ────────────────────────────────────────────

  async function handleRefine() {
    if (!persona || rawInput.trim().length < 10) return

    setRefining(true)
    setRefineError('')

    const res = await fetch('/api/refine', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        raw_input: rawInput.trim(),
        persona_type: persona,
        category: category || undefined,
      }),
    })

    const json = await res.json()

    if (!res.ok) {
      setRefineError(json.error ?? 'Refinement failed.')
      setRefining(false)
      return
    }

    setRefinement(json.data)
    setStep('review')
    setRefining(false)
  }

  async function handleSubmit(withRefinement: boolean) {
    if (!persona) return

    setSubmitting(true)
    setSubmitError('')

    const body: Record<string, unknown> = {
      raw_input: rawInput.trim(),
      persona_type: persona,
      category: category || undefined,
    }

    if (withRefinement && refinement) {
      body.refined_title = refinement.refined_title
      body.user_story = refinement.user_story
      body.refined_description = refinement.refined_description
      body.acceptance_criteria = refinement.acceptance_criteria
      body.priority_suggestion = refinement.priority_suggestion
      body.tags = refinement.tags
      if (refinement.category) body.category = refinement.category
    }

    const res = await fetch('/api/requirements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    const json = await res.json()

    if (!res.ok) {
      setSubmitError(json.error ?? 'Submission failed.')
      setSubmitting(false)
      return
    }

    router.push(`/requirements/${json.data.id}`)
  }

  // ── Step 1: Persona selection ────────────────────────────

  if (step === 'persona') {
    return (
      <div className="submit-personas">
        <p className="submit-personas__hint">Who are you submitting this requirement as?</p>
        <div className="persona-grid">
          {PERSONAS.map((p) => (
            <button
              key={p.value}
              type="button"
              className={`persona-card${persona === p.value ? ' persona-card--selected' : ''}`}
              onClick={() => setPersona(p.value)}
            >
              <span className="persona-card__label">{p.label}</span>
              <span className="persona-card__desc">{p.description}</span>
            </button>
          ))}
        </div>
        <div className="submit-actions">
          <button
            type="button"
            className="btn btn--primary"
            disabled={!persona}
            onClick={() => setStep('details')}
          >
            Continue <ChevronRight size={14} strokeWidth={1.5} />
          </button>
        </div>
      </div>
    )
  }

  // ── Step 2: Details + AI refinement ─────────────────────

  if (step === 'details') {
    const selectedPersona = PERSONAS.find((p) => p.value === persona)!
    const remaining = 5000 - rawInput.length
    const canRefine = rawInput.trim().length >= 10

    return (
      <div className="submit-form">
        {/* Persona indicator */}
        <div className="submit-form__persona">
          <span className="submit-form__persona-label">Submitting as</span>
          <span className="submit-form__persona-value">{selectedPersona.label}</span>
          <button
            type="button"
            className="submit-form__persona-change"
            onClick={() => setStep('persona')}
            disabled={refining}
          >
            Change
          </button>
        </div>

        <div className="form-field">
          <label htmlFor="raw_input" className="form-label">
            Describe the feature you need
          </label>
          <textarea
            id="raw_input"
            className="form-textarea"
            placeholder="e.g. I want to filter job listings by whether the recruiter has a verified identity, so I don't waste time on ghost postings…"
            value={rawInput}
            onChange={(e) => setRawInput(e.target.value)}
            rows={6}
            maxLength={5000}
            autoFocus
            disabled={refining}
          />
          <span className={`form-char-count${remaining < 200 ? ' form-char-count--warn' : ''}`}>
            {remaining.toLocaleString()} characters remaining
          </span>
        </div>

        <div className="form-field">
          <label htmlFor="category" className="form-label">
            Category{' '}
            <span className="form-label--optional">(optional — AI can infer it)</span>
          </label>
          <select
            id="category"
            className="form-select"
            value={category}
            onChange={(e) => setCategory(e.target.value as FeatureCategory | '')}
            disabled={refining}
          >
            <option value="">— Select a category —</option>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        {refineError && (
          <div className="refine-error" role="alert">
            <AlertCircle size={14} strokeWidth={1.5} />
            <span>{refineError}</span>
          </div>
        )}

        <div className="submit-actions submit-actions--split">
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => setStep('persona')}
            disabled={refining}
          >
            Back
          </button>
          <div className="submit-actions__right">
            <button
              type="button"
              className="btn btn--secondary"
              disabled={submitting || rawInput.trim().length < 10}
              onClick={() => handleSubmit(false)}
            >
              {submitting ? 'Submitting…' : 'Submit as draft'}
            </button>
            <button
              type="button"
              className="btn btn--primary btn--ai"
              disabled={!canRefine || refining}
              onClick={handleRefine}
            >
              {refining ? (
                <>
                  <span className="spinner" aria-hidden /> Refining…
                </>
              ) : (
                <>
                  <Sparkles size={14} strokeWidth={1.5} />
                  Refine with AI
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Step 3: Review AI refinement ─────────────────────────

  if (step === 'review' && refinement) {
    return (
      <div className="refinement-review">

        {/* Similar requirements warning */}
        {refinement.similar_existing.length > 0 && (
          <div className="refine-similar">
            <AlertCircle size={14} strokeWidth={1.5} />
            <div>
              <p className="refine-similar__title">Similar requirements already exist</p>
              <ul className="refine-similar__list">
                {refinement.similar_existing.map((r) => (
                  <li key={r.id}>
                    <a href={`/requirements/${r.id}`} target="_blank" rel="noreferrer">
                      {r.refined_title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Clarifications needed */}
        {refinement.clarifications_needed && refinement.clarifications_needed.length > 0 && (
          <div className="refine-clarify">
            <p className="refine-clarify__title">AI needs more detail to write testable criteria:</p>
            <ul className="refine-clarify__list">
              {refinement.clarifications_needed.map((q, i) => (
                <li key={i}>{q}</li>
              ))}
            </ul>
            <button
              type="button"
              className="btn btn--ghost refine-clarify__back"
              onClick={() => setStep('details')}
            >
              ← Add more detail
            </button>
          </div>
        )}

        {/* Refined title */}
        <div className="refine-field">
          <span className="refine-field__label">Title</span>
          <p className="refine-field__value refine-field__value--title">{refinement.refined_title}</p>
        </div>

        {/* Badges row */}
        <div className="refine-meta">
          <span className="badge badge--persona">
            {PERSONAS.find((p) => p.value === refinement.persona_type)?.label ?? refinement.persona_type}
          </span>
          {refinement.category && (
            <span className="badge badge--category">{refinement.category}</span>
          )}
          {refinement.priority_suggestion && (
            <span className={`badge ${refinement.priority_suggestion.startsWith('High') ? 'badge--approved' : refinement.priority_suggestion.startsWith('Low') ? 'badge--draft' : 'badge--in_review'}`}>
              {refinement.priority_suggestion.split(' ')[0]} priority
            </span>
          )}
        </div>

        {/* User story */}
        <div className="refine-field">
          <span className="refine-field__label">User story</span>
          <p className="refine-field__value refine-field__value--story">{refinement.user_story}</p>
        </div>

        {/* Description */}
        <div className="refine-field">
          <span className="refine-field__label">Description</span>
          <p className="refine-field__value">{refinement.refined_description}</p>
        </div>

        {/* Acceptance criteria */}
        {refinement.acceptance_criteria.length > 0 && (
          <div className="refine-field">
            <span className="refine-field__label">Acceptance criteria</span>
            <ol className="refine-criteria">
              {refinement.acceptance_criteria.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ol>
          </div>
        )}

        {/* Tags */}
        {refinement.tags.length > 0 && (
          <div className="refine-field">
            <span className="refine-field__label">Tags</span>
            <div className="refine-tags">
              {refinement.tags.map((t) => (
                <span key={t} className="badge badge--tag">{t}</span>
              ))}
            </div>
          </div>
        )}

        {submitError && (
          <div className="refine-error" role="alert">
            <AlertCircle size={14} strokeWidth={1.5} />
            <span>{submitError}</span>
          </div>
        )}

        <div className="submit-actions submit-actions--split">
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => setStep('details')}
            disabled={submitting}
          >
            ← Edit
          </button>
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => handleSubmit(true)}
            disabled={submitting}
          >
            {submitting ? 'Submitting…' : 'Submit requirement'}
          </button>
        </div>
      </div>
    )
  }

  return null
}
