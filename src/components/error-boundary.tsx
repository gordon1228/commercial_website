'use client'

import * as React from 'react'
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

// Error types for different scenarios
export type ErrorType = 'network' | 'validation' | 'permission' | 'not-found' | 'server' | 'unknown'

export interface ErrorInfo {
  type: ErrorType
  message: string
  details?: string
  statusCode?: number
  timestamp: Date
  userId?: string
  action?: string
  stack?: string
}

// Error boundary state
interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
  errorId: string
}

// Props for error boundary
interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error; reset: () => void }>
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  isolate?: boolean
  level?: 'page' | 'section' | 'component'
}

// Error logging service
class ErrorLogger {
  private static instance: ErrorLogger
  private logs: ErrorInfo[] = []

  static getInstance(): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger()
    }
    return ErrorLogger.instance
  }

  logError(error: Error, errorInfo?: React.ErrorInfo, additionalInfo?: Partial<ErrorInfo>): string {
    const errorId = this.generateErrorId()
    const logEntry: ErrorInfo = {
      type: this.categorizeError(error),
      message: error.message,
      details: error.stack,
      timestamp: new Date(),
      ...additionalInfo,
    }

    this.logs.push(logEntry)

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group(`🚨 Error ${errorId}`)
      console.error('Error:', error)
      console.error('Error Info:', errorInfo)
      console.error('Additional Info:', additionalInfo)
      console.groupEnd()
    }

    // In production, send to monitoring service
    if (process.env.NODE_ENV === 'production') {
      this.sendToMonitoring(errorId, logEntry)
    }

    return errorId
  }

  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private categorizeError(error: Error): ErrorType {
    const message = error.message.toLowerCase()
    
    if (message.includes('network') || message.includes('fetch')) {
      return 'network'
    }
    if (message.includes('validation') || message.includes('invalid')) {
      return 'validation'
    }
    if (message.includes('permission') || message.includes('unauthorized')) {
      return 'permission'
    }
    if (message.includes('not found') || message.includes('404')) {
      return 'not-found'
    }
    if (message.includes('server') || message.includes('500')) {
      return 'server'
    }
    
    return 'unknown'
  }

  private async sendToMonitoring(errorId: string, errorInfo: ErrorInfo) {
    try {
      // Send to external monitoring service (e.g., Sentry, LogRocket)
      await fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ errorId, ...errorInfo }),
      })
    } catch (monitoringError) {
      console.error('Failed to send error to monitoring:', monitoringError)
    }
  }

  getRecentErrors(count: number = 10): ErrorInfo[] {
    return this.logs.slice(-count).reverse()
  }

  clearLogs(): void {
    this.logs = []
  }
}

// Main Error Boundary component
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private logger = ErrorLogger.getInstance()

  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const errorId = this.logger.logError(error, errorInfo, {
      action: 'component_error',
      userId: this.getUserId(),
    })

    this.setState({
      errorInfo,
      errorId,
    })

    // Call custom error handler
    this.props.onError?.(error, errorInfo)
  }

  private getUserId(): string | undefined {
    // Get user ID from session or context
    if (typeof window !== 'undefined') {
      return localStorage.getItem('userId') || undefined
    }
    return undefined
  }

  private reset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
    })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return <FallbackComponent error={this.state.error} reset={this.reset} />
      }

      // Default error UI based on level
      return (
        <ErrorFallback
          error={this.state.error}
          errorId={this.state.errorId}
          level={this.props.level || 'page'}
          onReset={this.reset}
          isolate={this.props.isolate}
        />
      )
    }

    return this.props.children
  }
}

// Default error fallback component
interface ErrorFallbackProps {
  error: Error
  errorId: string
  level: 'page' | 'section' | 'component'
  onReset: () => void
  isolate?: boolean
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  errorId,
  level,
  onReset,
  isolate = false,
}) => {
  const [showDetails, setShowDetails] = React.useState(false)

  const getErrorMessage = () => {
    if (error.message.includes('ChunkLoadError')) {
      return 'A new version of the application is available. Please refresh the page.'
    }
    if (error.message.includes('Network')) {
      return 'Network connection problem. Please check your internet connection and try again.'
    }
    return 'Something went wrong. We apologize for the inconvenience.'
  }

  const getErrorIcon = () => {
    const iconClass = level === 'component' ? 'h-8 w-8' : 'h-12 w-12'
    return <AlertTriangle className={`${iconClass} text-error mx-auto`} />
  }

  const getErrorActions = () => {
    const actions = []

    // Always show retry
    actions.push(
      <Button key="retry" onClick={onReset} leftIcon={<RefreshCw className="h-4 w-4" />}>
        Try Again
      </Button>
    )

    // Page-level errors get more actions
    if (level === 'page') {
      actions.push(
        <Button key="home" variant="outline" onClick={() => window.location.href = '/'} leftIcon={<Home className="h-4 w-4" />}>
          Go Home
        </Button>
      )
      
      actions.push(
        <Button key="back" variant="ghost" onClick={() => window.history.back()} leftIcon={<ArrowLeft className="h-4 w-4" />}>
          Go Back
        </Button>
      )
    }

    return actions
  }

  if (level === 'component' && isolate) {
    return (
      <div className="p-4 border border-error-200 bg-error-50 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="h-4 w-4 text-error" />
          <span className="text-sm font-medium text-error-800">Component Error</span>
        </div>
        <p className="text-sm text-error-600 mb-3">{getErrorMessage()}</p>
        <Button size="sm" onClick={onReset}>
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className={`${level === 'page' ? 'min-h-screen' : 'min-h-[400px]'} flex items-center justify-center p-4`}>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {getErrorIcon()}
          <CardTitle className="mt-4">
            {level === 'page' ? 'Oops! Something went wrong' : 'Error occurred'}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">{getErrorMessage()}</p>
          
          <div className="flex flex-col gap-2">
            {getErrorActions()}
          </div>

          {process.env.NODE_ENV === 'development' && (
            <div className="mt-6 text-left">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDetails(!showDetails)}
                className="mb-2"
              >
                {showDetails ? 'Hide' : 'Show'} Details
              </Button>
              
              {showDetails && (
                <div className="p-3 bg-muted rounded-md text-xs font-mono overflow-auto max-h-32">
                  <div className="mb-2">
                    <strong>Error ID:</strong> {errorId}
                  </div>
                  <div className="mb-2">
                    <strong>Message:</strong> {error.message}
                  </div>
                  {error.stack && (
                    <div>
                      <strong>Stack:</strong>
                      <pre className="whitespace-pre-wrap">{error.stack}</pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Hook for handling async errors
export function useErrorHandler() {
  const logger = ErrorLogger.getInstance()

  const handleError = React.useCallback((error: Error, additionalInfo?: Partial<ErrorInfo>) => {
    logger.logError(error, undefined, additionalInfo)
  }, [logger])

  const handleAsyncError = React.useCallback((promise: Promise<any>, context?: string) => {
    promise.catch((error) => {
      handleError(error, { action: context || 'async_operation' })
    })
  }, [handleError])

  return { handleError, handleAsyncError }
}

// Higher-order component for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  )

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`
  return WrappedComponent
}

// React Query error boundary integration
export function QueryErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      level="section"
      onError={(error, errorInfo) => {
        ErrorLogger.getInstance().logError(error, errorInfo, {
          action: 'query_error',
          type: 'network',
        })
      }}
    >
      {children}
    </ErrorBoundary>
  )
}

export { ErrorLogger }