import { AlertCircle, RefreshCw, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'

interface ErrorDisplayProps {
  title?: string
  message?: string
  showRetry?: boolean
  onRetry?: () => void
  showHomeLink?: boolean
  className?: string
}

export function ErrorDisplay({ 
  title = "Something went wrong",
  message = "An unexpected error occurred. Please try again.",
  showRetry = true,
  onRetry,
  showHomeLink = false,
  className
}: ErrorDisplayProps) {
  return (
    <Card className={className}>
      <CardContent className="text-center py-12">
        <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">{message}</p>
        
        <div className="flex justify-center gap-4">
          {showRetry && onRetry && (
            <Button onClick={onRetry} className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
          )}
          {showHomeLink && (
            <Link href="/">
              <Button variant="outline" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Go Home
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export function ErrorPage({ 
  title = "Page Not Found",
  message = "The page you're looking for doesn't exist or has been moved.",
  showHomeLink = true
}: Omit<ErrorDisplayProps, 'className'>) {
  return (
    <div className="min-h-screen pt-20 bg-background">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <ErrorDisplay 
          title={title}
          message={message}
          showHomeLink={showHomeLink}
          showRetry={false}
        />
      </div>
    </div>
  )
}

export function InlineError({ 
  message,
  onDismiss 
}: { 
  message: string
  onDismiss?: () => void 
}) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
      <div className="flex">
        <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm text-red-800">{message}</p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="ml-3 text-red-400 hover:text-red-600"
          >
            <span className="sr-only">Dismiss</span>
            ×
          </button>
        )}
      </div>
    </div>
  )
}

export function SuccessMessage({ 
  message,
  onDismiss 
}: { 
  message: string
  onDismiss?: () => void 
}) {
  return (
    <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm text-green-800">{message}</p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="ml-3 text-green-400 hover:text-green-600"
          >
            <span className="sr-only">Dismiss</span>
            ×
          </button>
        )}
      </div>
    </div>
  )
}