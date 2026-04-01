import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/navbar'
import { RequirementForm } from '@/components/submit/requirement-form'

export const metadata: Metadata = {
  title: 'Contribute a requirement',
  description: 'Tell us what the platform needs to exist.',
}

export default async function SubmitPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/signin?next=/submit')

  return (
    <div className="layout">
      <Navbar />
      <main className="page-content" id="main-content">
        <div className="page-header">
          <h1 className="page-title">Contribute a requirement</h1>
          <p className="page-subtitle">
            Tell us what SixDegrees needs to exist. Be specific — the more
            detail you give, the better the platform we can build.
          </p>
        </div>
        <div className="submit-card card">
          <RequirementForm />
        </div>
      </main>
    </div>
  )
}
