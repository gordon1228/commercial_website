'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  AlertTriangle, Home, ArrowLeft, RotateCcw, 
  Search, Phone, Mail, ExternalLink, 
  Wifi, Server, Lock, Clock, Bug, 
  Construction, Zap, Globe
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ResponsiveContainer } from '@/components/ui/responsive-container'
import { TouchButton } from '@/components/navigation/mobile-nav'
import { AccessibleButton } from '@/components/accessibility/accessible-button'
import { cn } from '@/lib/utils'

interface ErrorPageProps {
  title: string
  description: string
  statusCode?: number
  icon?: React.ComponentType<{ className?: string }>
  showBackButton?: boolean
  showHomeButton?: boolean
  showRetryButton?: boolean
  customActions?: React.ReactNode
  suggestions?: string[]
  contactInfo?: boolean
  className?: string
}

function BaseErrorPage({
  title,
  description,
  statusCode,
  icon: Icon = AlertTriangle,
  showBackButton = true,
  showHomeButton = true,
  showRetryButton = false,
  customActions,
  suggestions = [],
  contactInfo = false,
  className
}: ErrorPageProps) {
  const router = useRouter()
  const [countdown, setCountdown] = useState(5)
  const [autoRedirect, setAutoRedirect] = useState(false)

  useEffect(() => {
    if (autoRedirect && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else if (autoRedirect && countdown === 0) {
      router.push('/')
    }
  }, [autoRedirect, countdown, router])

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back()
    } else {
      router.push('/')
    }
  }

  const handleRetry = () => {
    window.location.reload()
  }

  return (
    <ResponsiveContainer className={cn("min-h-screen bg-gray-50 py-16 px-4", className)}>
      <div className="text-center max-w-2xl mx-auto">
        {/* Error Icon and Status */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4">
            <Icon className="h-10 w-10 text-red-600" aria-hidden="true" />
          </div>
          {statusCode && (
            <Badge variant="secondary" className="text-lg px-4 py-1 mb-4">
              Error {statusCode}
            </Badge>
          )}
        </div>

        {/* Error Content */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {title}
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            {description}
          </p>
          
          {autoRedirect && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                Redirecting to homepage in {countdown} seconds...
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAutoRedirect(false)}
                className="mt-2 text-blue-600 hover:text-blue-800"
              >
                Cancel redirect
              </Button>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
          {showHomeButton && (
            <AccessibleButton
              variant="primary"
              size="lg"
              icon={Home}
              href="/"
              as="a"
              className="min-w-[150px]"
            >
              Go Home
            </AccessibleButton>
          )}
          
          {showBackButton && (
            <AccessibleButton
              variant="secondary"
              size="lg"
              icon={ArrowLeft}
              onClick={handleBack}
              className="min-w-[150px]"
            >
              Go Back
            </AccessibleButton>
          )}
          
          {showRetryButton && (
            <AccessibleButton
              variant="secondary"
              size="lg"
              icon={RotateCcw}
              onClick={handleRetry}
              className="min-w-[150px]"
            >
              Try Again
            </AccessibleButton>
          )}
        </div>

        {/* Custom Actions */}
        {customActions && (
          <div className="mb-8">
            {customActions}
          </div>
        )}

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <Card className="mb-8 text-left">
            <CardContent className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <Zap className="h-5 w-5 mr-2" />
                What you can do:
              </h3>
              <ul className="space-y-3">
                {suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                    </div>
                    <span className="text-gray-700">{suggestion}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Contact Information */}
        {contactInfo && (
          <Card>
            <CardContent className="p-6 text-left">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <Phone className="h-5 w-5 mr-2" />
                Need help?
              </h3>
              <div className="space-y-3">
                <div className="flex items-center text-gray-700">
                  <Mail className="h-4 w-4 mr-3 text-gray-400" />
                  <a href="mailto:support@evtl.com" className="hover:text-blue-600 hover:underline">
                    support@evtl.com
                  </a>
                </div>
                <div className="flex items-center text-gray-700">
                  <Phone className="h-4 w-4 mr-3 text-gray-400" />
                  <a href="tel:+1-555-123-4567" className="hover:text-blue-600 hover:underline">
                    +1 (555) 123-4567
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Auto-redirect option for certain errors */}
        {!autoRedirect && statusCode === 404 && (
          <div className="mt-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAutoRedirect(true)}
              className="text-gray-500 hover:text-gray-700"
            >
              Auto-redirect to homepage
            </Button>
          </div>
        )}
      </div>
    </ResponsiveContainer>
  )
}

// Specific error page components
export function NotFoundPage({ className }: { className?: string }) {
  return (
    <BaseErrorPage
      statusCode={404}
      title="Page Not Found"
      description="The page you're looking for doesn't exist or has been moved."
      icon={Search}
      suggestions={[
        "Check the URL for any typos",
        "Use the search function to find what you're looking for",
        "Browse our vehicle catalog",
        "Visit our homepage for navigation options"
      ]}
      customActions={
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <TouchButton variant="secondary" href="/vehicles" size="md">
            Browse Vehicles
          </TouchButton>
          <TouchButton variant="secondary" href="/contact" size="md">
            Contact Us
          </TouchButton>
        </div>
      }
      className={className}
    />
  )
}

export function ServerErrorPage({ className }: { className?: string }) {
  return (
    <BaseErrorPage
      statusCode={500}
      title="Server Error"
      description="Something went wrong on our end. Our team has been notified and is working on a fix."
      icon={Server}
      showRetryButton={true}
      contactInfo={true}
      suggestions={[
        "Wait a few minutes and try again",
        "Clear your browser cache and cookies",
        "Try accessing the page from a different browser",
        "Contact our support team if the problem persists"
      ]}
      className={className}
    />
  )
}

export function NetworkErrorPage({ className }: { className?: string }) {
  return (
    <BaseErrorPage
      title="Connection Problem"
      description="Unable to connect to our servers. Please check your internet connection and try again."
      icon={Wifi}
      showRetryButton={true}
      suggestions={[
        "Check your internet connection",
        "Try refreshing the page",
        "Disable VPN if you're using one",
        "Contact your internet service provider if issues persist"
      ]}
      className={className}
    />
  )
}

export function UnauthorizedPage({ className }: { className?: string }) {
  return (
    <BaseErrorPage
      statusCode={401}
      title="Access Denied"
      description="You don't have permission to access this page. Please log in or contact an administrator."
      icon={Lock}
      showBackButton={false}
      customActions={
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <TouchButton variant="primary" href="/admin/login" size="md">
            Sign In
          </TouchButton>
          <TouchButton variant="secondary" href="/contact" size="md">
            Request Access
          </TouchButton>
        </div>
      }
      suggestions={[
        "Sign in with your account credentials",
        "Contact an administrator for access",
        "Check if you're using the correct URL",
        "Clear your browser cookies and try again"
      ]}
      className={className}
    />
  )
}

export function MaintenancePage({ className }: { className?: string }) {
  return (
    <BaseErrorPage
      title="Under Maintenance"
      description="We're performing scheduled maintenance to improve your experience. We'll be back shortly."
      icon={Construction}
      showBackButton={false}
      showRetryButton={false}
      customActions={
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <TouchButton variant="secondary" href="/contact" size="md">
            Contact Support
          </TouchButton>
          <TouchButton 
            variant="secondary" 
            href="https://status.evtl.com" 
            target="_blank"
            size="md"
          >
            Status Page
            <ExternalLink className="h-4 w-4 ml-2" />
          </TouchButton>
        </div>
      }
      contactInfo={true}
      suggestions={[
        "Check our status page for updates",
        "Follow us on social media for real-time updates",
        "Try again in a few minutes",
        "Contact support for urgent matters"
      ]}
      className={className}
    />
  )
}

export function RateLimitPage({ className }: { className?: string }) {
  return (
    <BaseErrorPage
      statusCode={429}
      title="Too Many Requests"
      description="You've made too many requests in a short period. Please wait before trying again."
      icon={Clock}
      showRetryButton={false}
      suggestions={[
        "Wait a few minutes before trying again",
        "Reduce the frequency of your requests",
        "Contact support if you need higher limits",
        "Consider using our API for automated requests"
      ]}
      className={className}
    />
  )
}

export function ForbiddenPage({ className }: { className?: string }) {
  return (
    <BaseErrorPage
      statusCode={403}
      title="Forbidden"
      description="You don't have permission to access this resource."
      icon={Lock}
      suggestions={[
        "Log in with an account that has the required permissions",
        "Contact an administrator for access",
        "Check if you're accessing the correct URL",
        "Return to a page you have access to"
      ]}
      contactInfo={true}
      className={className}
    />
  )
}

// Generic error boundary component
interface ErrorBoundaryPageProps {
  error?: Error
  reset?: () => void
  className?: string
}

export function ErrorBoundaryPage({ error, reset, className }: ErrorBoundaryPageProps) {
  const [showDetails, setShowDetails] = useState(false)

  return (
    <BaseErrorPage
      title="Something went wrong"
      description="An unexpected error occurred. Our team has been notified."
      icon={Bug}
      showRetryButton={false}
      contactInfo={true}
      customActions={
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {reset && (
            <TouchButton variant="primary" onClick={reset} size="md">
              Try Again
            </TouchButton>
          )}
          <TouchButton 
            variant="secondary" 
            onClick={() => setShowDetails(!showDetails)}
            size="md"
          >
            {showDetails ? 'Hide' : 'Show'} Details
          </TouchButton>
        </div>
      }
      suggestions={[
        "Try refreshing the page",
        "Clear your browser cache",
        "Try again in a few minutes",
        "Contact support with the error details below"
      ]}
      className={className}
    >
      {showDetails && error && (
        <Card className="mt-6 text-left">
          <CardContent className="p-6">
            <h4 className="font-medium text-gray-900 mb-3">Error Details</h4>
            <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm text-gray-800 overflow-x-auto">
              <div className="mb-2">
                <strong>Message:</strong> {error.message}
              </div>
              {error.stack && (
                <div>
                  <strong>Stack Trace:</strong>
                  <pre className="mt-2 whitespace-pre-wrap text-xs">{error.stack}</pre>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </BaseErrorPage>
  )
}

// Hook for handling different error states
export function useErrorHandler() {
  const [error, setError] = useState<{
    type: 'network' | 'server' | 'unauthorized' | 'forbidden' | 'not-found' | 'rate-limit' | 'generic'
    message?: string
    statusCode?: number
  } | null>(null)

  const handleError = (err: any) => {
    if (err?.response?.status) {
      switch (err.response.status) {
        case 401:
          setError({ type: 'unauthorized', statusCode: 401 })
          break
        case 403:
          setError({ type: 'forbidden', statusCode: 403 })
          break
        case 404:
          setError({ type: 'not-found', statusCode: 404 })
          break
        case 429:
          setError({ type: 'rate-limit', statusCode: 429 })
          break
        case 500:
        case 502:
        case 503:
        case 504:
          setError({ type: 'server', statusCode: err.response.status })
          break
        default:
          setError({ type: 'generic', statusCode: err.response.status, message: err.message })
      }
    } else if (err?.code === 'NETWORK_ERROR' || !navigator.onLine) {
      setError({ type: 'network' })
    } else {
      setError({ type: 'generic', message: err?.message || 'An unexpected error occurred' })
    }
  }

  const clearError = () => setError(null)

  const renderError = () => {
    if (!error) return null

    switch (error.type) {
      case 'network':
        return <NetworkErrorPage />
      case 'server':
        return <ServerErrorPage />
      case 'unauthorized':
        return <UnauthorizedPage />
      case 'forbidden':
        return <ForbiddenPage />
      case 'not-found':
        return <NotFoundPage />
      case 'rate-limit':
        return <RateLimitPage />
      default:
        return <ErrorBoundaryPage error={new Error(error.message || 'Unknown error')} />
    }
  }

  return {
    error,
    handleError,
    clearError,
    renderError
  }
}