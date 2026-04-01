'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PERSONAS, CATEGORIES } from '@/lib/constants/personas'
import type { PersonaType, FeatureCategory } from '@/lib/validators/requirements'

type Step = 'persona' | 'details'

export function RequirementForm() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('persona')
  const [persona, setPersona] = useState<PersonaType | null>(null)
  const [category, setCategory] = useState<FeatureCategory | ''>('')
  const [rawInput, setRawInput] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!persona || rawInput.trim().length < 10) return

    setSubmitting(true)
    setError('')

    const res = await fetch('/api/requirements', {
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
      setError(json.error ?? 'Something went wrong. Try again.')
      setSubmitting(false)
      return
    }

    router.push(`/requirements/${json.data.id}`)
  }

  // ── Step 1: persona selection ─────────────────────────────

  if (step === 'persona') {
    return (
      <div className="submit-personas">
        <p className="submit-personas__hint">
          Who are you submitting this requirement as?
        </p>
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
            Continue
          </button>
        </div>
      </div>
    )
  }

  // ── Step 2: requirement details ───────────────────────────

  const selectedPersona = PERSONAS.find((p) => p.value === persona)!
  const remaining = 5000 - rawInput.length

  return (
    <form className="submit-form" onSubmit={handleSubmit} noValidate>
      <div className="submit-form__persona">
        <span className="submit-form__persona-label">Submitting as</span>
        <span className="submit-form__persona-value">{selectedPersona.label}</span>
        <button
          type="button"
          className="submit-form__persona-change"
          onClick={() => setStep('persona')}
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
          placeholder="e.g. I want to be able to filter job listings by whether the recruiter has a verified identity…"
          value={rawInput}
          onChange={(e) => setRawInput(e.target.value)}
          rows={6}
          maxLength={5000}
          required
          autoFocus
          aria-describedby={error ? 'submit-error' : undefined}
        />
        <span
          className={`form-char-count${remaining < 200 ? ' form-char-count--warn' : ''}`}
          aria-live="polite"
        >
          {remaining.toLocaleString()} characters remaining
        </span>
      </div>

      <div className="form-field">
        <label htmlFor="category" className="form-label">
          Category{' '}
          <span className="form-label--optional">(optional — we can infer it)</span>
        </label>
        <select
          id="category"
          className="form-select"
          value={category}
          onChange={(e) => setCategory(e.target.value as FeatureCategory | '')}
        >
          <option value="">— Select a category —</option>
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <p id="submit-error" className="form-error" role="alert">
          {error}
        </p>
      )}

      <div className="submit-actions">
        <button
          type="button"
          className="btn btn--ghost"
          onClick={() => setStep('persona')}
          disabled={submitting}
        >
          Back
        </button>
        <button
          type="submit"
          className="btn btn--primary"
          disabled={submitting || rawInput.trim().length < 10}
        >
          {submitting ? 'Submitting…' : 'Submit requirement'}
        </button>
      </div>

      <p className="submit-form__note">
        Your requirement will be saved as a draft. AI refinement into a structured
        user story is coming soon.
      </p>
    </form>
  )
}
