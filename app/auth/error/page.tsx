import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Sign-in error — SixDegrees',
}

export default function AuthErrorPage() {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card__header">
          <a href="/" className="auth-card__logo">
            SixDegrees
          </a>
          <h1 className="auth-card__title">Link expired</h1>
          <p className="auth-card__subtitle">
            That sign-in link is invalid or has already been used. Links expire
            after 1 hour.
          </p>
        </div>
        <Link href="/signin" className="btn btn--primary btn--full">
          Request a new link
        </Link>
      </div>
    </div>
  )
}
