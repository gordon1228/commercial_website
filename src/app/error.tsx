'use client'

import { useEffect } from 'react'
import { ErrorBoundaryPage } from '@/components/errors/error-pages'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error)
  }, [error])

  return <ErrorBoundaryPage error={error} reset={reset} />
}