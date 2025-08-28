import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6', 
    lg: 'w-8 h-8'
  }

  return (
    <div
      className={cn(
        'animate-spin rounded-full border-2 border-gray-200 border-t-gray-600',
        sizeClasses[size],
        className
      )}
    />
  )
}

export function LoadingCard({ children }: { children?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="text-center">
        <LoadingSpinner size="lg" className="mx-auto mb-4" />
        {children && <p className="text-gray-600">{children}</p>}
      </div>
    </div>
  )
}

export function LoadingPage({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="min-h-screen pt-20 bg-background">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <LoadingCard>
          {message}
        </LoadingCard>
      </div>
    </div>
  )
}