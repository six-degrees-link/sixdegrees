'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type State = 'idle' | 'loading' | 'sent' | 'error'

export function SignInForm() {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<State>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return

    setState('loading')
    setErrorMsg('')

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setState('error')
      setErrorMsg(error.message)
      return
    }

    setState('sent')
  }

  if (state === 'sent') {
    return (
      <div className="signin-sent">
        <div className="signin-sent__icon" aria-hidden="true">✓</div>
        <h2 className="signin-sent__title">Check your email</h2>
        <p className="signin-sent__body">
          We sent a sign-in link to <strong>{email}</strong>. Click it to
          continue. It expires in 1 hour.
        </p>
        <button
          type="button"
          className="signin-sent__resend"
          onClick={() => setState('idle')}
        >
          Use a different email
        </button>
      </div>
    )
  }

  return (
    <form className="signin-form" onSubmit={handleSubmit} noValidate>
      <div className="form-field">
        <label htmlFor="email" className="form-label">
          Email address
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          autoFocus
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={state === 'loading'}
          className="form-input"
          aria-describedby={state === 'error' ? 'signin-error' : undefined}
        />
      </div>

      {state === 'error' && (
        <p id="signin-error" className="form-error" role="alert">
          {errorMsg || 'Something went wrong. Try again.'}
        </p>
      )}

      <button
        type="submit"
        className="btn btn--primary btn--full"
        disabled={state === 'loading' || !email.trim()}
      >
        {state === 'loading' ? 'Sending…' : 'Send sign-in link'}
      </button>

      <p className="signin-form__note">
        No password. No account needed. Just your email.
      </p>
    </form>
  )
}
