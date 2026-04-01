'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function ConfirmInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') ?? '/'

  useEffect(() => {
    // Bust the Next.js router cache so server components (navbar, etc.)
    // re-render with the newly set session cookies.
    router.refresh()
    router.replace(next)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return null
}

export default function ConfirmPage() {
  return (
    <Suspense>
      <ConfirmInner />
    </Suspense>
  )
}
