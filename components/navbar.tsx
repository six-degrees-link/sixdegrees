import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { NavbarUser } from './navbar-user'

export async function Navbar() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <header className="navbar" role="banner">
      <div className="navbar__inner">
        <div className="navbar__left">
          <Link href="/" className="navbar__logo">
            SixDegrees
          </Link>
          <nav className="navbar__nav" aria-label="Main navigation">
            <Link href="/browse" className="navbar__link">
              Browse
            </Link>
            <Link href="/submit" className="navbar__link">
              Contribute
            </Link>
          </nav>
        </div>
        <div className="navbar__right">
          <NavbarUser user={user} />
        </div>
      </div>
    </header>
  )
}
