import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const spinnerVariants = cva(
  'loading-spinner',
  {
    variants: {
      size: {
        xs: 'h-3 w-3',
        sm: 'h-4 w-4',
        md: 'h-6 w-6',
        lg: 'h-8 w-8',
        xl: 'h-12 w-12',
      },
      variant: {
        default: 'border-current',
        primary: 'border-primary',
        secondary: 'border-secondary',
        muted: 'border-muted-foreground',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'default',
    },
  }
)

export interface LoadingSpinnerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {
  thickness?: 'thin' | 'normal' | 'thick'
}

export const LoadingSpinner = React.forwardRef<HTMLDivElement, LoadingSpinnerProps>(
  ({ size, variant, thickness = 'normal', className, ...props }, ref) => {
    const getThickness = () => {
      switch (thickness) {
        case 'thin': return 'border'
        case 'normal': return 'border-2'
        case 'thick': return 'border-4'
        default: return 'border-2'
      }
    }

    return (
      <div
        ref={ref}
        className={cn(
          spinnerVariants({ size, variant }),
          getThickness(),
          className
        )}
        role="status"
        aria-label="Loading"
        {...props}
      />
    )
  }
)
LoadingSpinner.displayName = 'LoadingSpinner'

// Dots loading indicator
export interface LoadingDotsProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg'
  color?: 'current' | 'primary' | 'secondary' | 'muted'
}

export const LoadingDots = React.forwardRef<HTMLDivElement, LoadingDotsProps>(
  ({ size = 'md', color = 'current', className, ...props }, ref) => {
    const getSizeClass = () => {
      switch (size) {
        case 'sm': return 'w-1 h-1'
        case 'md': return 'w-2 h-2'
        case 'lg': return 'w-3 h-3'
        default: return 'w-2 h-2'
      }
    }

    const getColorClass = () => {
      switch (color) {
        case 'primary': return 'bg-primary'
        case 'secondary': return 'bg-secondary'
        case 'muted': return 'bg-muted-foreground'
        default: return 'bg-current'
      }
    }

    const dotClass = cn(
      'rounded-full animate-pulse',
      getSizeClass(),
      getColorClass()
    )

    return (
      <div
        ref={ref}
        className={cn('flex items-center gap-1', className)}
        role="status"
        aria-label="Loading"
        {...props}
      >
        <div className={cn(dotClass, '[animation-delay:-0.3s]')} />
        <div className={cn(dotClass, '[animation-delay:-0.15s]')} />
        <div className={dotClass} />
      </div>
    )
  }
)
LoadingDots.displayName = 'LoadingDots'

// Pulse loading indicator
export interface LoadingPulseProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg'
}

export const LoadingPulse = React.forwardRef<HTMLDivElement, LoadingPulseProps>(
  ({ size = 'md', className, ...props }, ref) => {
    const getSizeClass = () => {
      switch (size) {
        case 'sm': return 'w-4 h-4'
        case 'md': return 'w-8 h-8'
        case 'lg': return 'w-12 h-12'
        default: return 'w-8 h-8'
      }
    }

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-full bg-primary animate-pulse',
          getSizeClass(),
          className
        )}
        role="status"
        aria-label="Loading"
        {...props}
      />
    )
  }
)
LoadingPulse.displayName = 'LoadingPulse'

// Loading overlay for full-screen loading
export interface LoadingOverlayProps extends React.HTMLAttributes<HTMLDivElement> {
  isVisible: boolean
  message?: string
  variant?: 'spinner' | 'dots' | 'pulse'
  blur?: boolean
}

export const LoadingOverlay = React.forwardRef<HTMLDivElement, LoadingOverlayProps>(
  ({ 
    isVisible, 
    message = 'Loading...', 
    variant = 'spinner',
    blur = true,
    className, 
    ...props 
  }, ref) => {
    if (!isVisible) return null

    const renderLoadingIndicator = () => {
      switch (variant) {
        case 'dots':
          return <LoadingDots size="lg" />
        case 'pulse':
          return <LoadingPulse size="lg" />
        default:
          return <LoadingSpinner size="lg" />
      }
    }

    return (
      <div
        ref={ref}
        className={cn(
          'fixed inset-0 z-50 flex items-center justify-center',
          blur ? 'bg-background/80 backdrop-blur-sm' : 'bg-background/90',
          className
        )}
        role="status"
        aria-label={message}
        {...props}
      >
        <div className="flex flex-col items-center gap-4">
          {renderLoadingIndicator()}
          {message && (
            <p className="text-sm text-muted-foreground font-medium">
              {message}
            </p>
          )}
        </div>
      </div>
    )
  }
)
LoadingOverlay.displayName = 'LoadingOverlay'

// Enhanced Loading Card
export interface LoadingCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
  variant?: 'spinner' | 'dots' | 'pulse'
  size?: 'sm' | 'md' | 'lg'
}

export const LoadingCard = React.forwardRef<HTMLDivElement, LoadingCardProps>(
  ({ children, variant = 'spinner', size = 'lg', className, ...props }, ref) => {
    const renderLoadingIndicator = () => {
      switch (variant) {
        case 'dots':
          return <LoadingDots size={size} />
        case 'pulse':
          return <LoadingPulse size={size} />
        default:
          return <LoadingSpinner size={size} />
      }
    }

    return (
      <div
        ref={ref}
        className={cn('flex items-center justify-center p-8', className)}
        {...props}
      >
        <div className="text-center">
          <div className="mx-auto mb-4">{renderLoadingIndicator()}</div>
          {children && <p className="text-muted-foreground">{children}</p>}
        </div>
      </div>
    )
  }
)
LoadingCard.displayName = 'LoadingCard'

// Enhanced Loading Page
export interface LoadingPageProps extends React.HTMLAttributes<HTMLDivElement> {
  message?: string
  variant?: 'spinner' | 'dots' | 'pulse'
  showHeader?: boolean
}

export const LoadingPage = React.forwardRef<HTMLDivElement, LoadingPageProps>(
  ({ 
    message = 'Loading...', 
    variant = 'spinner',
    showHeader = true,
    className, 
    ...props 
  }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'min-h-screen bg-background',
          showHeader ? 'pt-20' : 'pt-0',
          className
        )}
        {...props}
      >
        <div className="container-fluid py-12">
          <LoadingCard variant={variant}>
            {message}
          </LoadingCard>
        </div>
      </div>
    )
  }
)
LoadingPage.displayName = 'LoadingPage'