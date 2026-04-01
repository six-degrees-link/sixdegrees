'use client'

import type { User } from '@supabase/supabase-js'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function NavbarUser({ user }: { user: User | null }) {
  const router = useRouter()
  const supabase = createClient()

  async function signOut() {
    await supabase.auth.signOut()
    router.refresh()
  }

  if (!user) {
    return (
      <Link href="/signin" className="btn btn--primary">
        Sign in
      </Link>
    )
  }

  return (
    <div className="navbar__user">
      <span className="navbar__user-email">{user.email}</span>
      <button type="button" onClick={signOut} className="btn btn--ghost">
        Sign out
      </button>
    </div>
  )
}
