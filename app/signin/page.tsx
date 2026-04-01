import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SignInForm } from '@/components/auth/sign-in-form'

export const metadata: Metadata = {
  title: 'Sign in',
}

export default async function SignInPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) redirect('/')

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card__header">
          <a href="/" className="auth-card__logo">
            SixDegrees
          </a>
          <h1 className="auth-card__title">Sign in</h1>
          <p className="auth-card__subtitle">
            Real humans only. No password required.
          </p>
        </div>
        <SignInForm />
      </div>
    </div>
  )
}
