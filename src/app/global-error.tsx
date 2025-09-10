'use client'

import { useEffect } from 'react'
import { ErrorBoundaryPage } from '@/components/errors/error-pages'

interface GlobalErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global application error:', error)
  }, [error])

  return (
    <html>
      <body>
        <ErrorBoundaryPage error={error} reset={reset} />
      </body>
    </html>
  )
}