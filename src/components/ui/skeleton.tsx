import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const skeletonVariants = cva(
  'skeleton',
  {
    variants: {
      variant: {
        default: 'bg-muted',
        shimmer: 'bg-gradient-to-r from-muted via-muted/50 to-muted bg-[length:200%_100%] animate-[shimmer_2s_infinite]',
        pulse: 'bg-muted animate-pulse',
      },
      rounded: {
        none: 'rounded-none',
        sm: 'rounded-sm',
        md: 'rounded-md',
        lg: 'rounded-lg',
        full: 'rounded-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      rounded: 'md',
    },
  }
)

export interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {
  width?: string | number
  height?: string | number
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant, rounded, width, height, style, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(skeletonVariants({ variant, rounded }), className)}
        style={{
          width,
          height,
          ...style,
        }}
        {...props}
      />
    )
  }
)
Skeleton.displayName = 'Skeleton'

// Text skeleton for different text elements
export interface TextSkeletonProps extends Omit<SkeletonProps, 'height'> {
  lines?: number
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl'
  lastLineWidth?: string
}

const TextSkeleton = React.forwardRef<HTMLDivElement, TextSkeletonProps>(
  ({ lines = 1, size = 'base', lastLineWidth = '75%', className, ...props }, ref) => {
    const getHeight = () => {
      switch (size) {
        case 'xs': return '12px'
        case 'sm': return '14px'
        case 'base': return '16px'
        case 'lg': return '18px'
        case 'xl': return '20px'
        case '2xl': return '24px'
        case '3xl': return '30px'
        default: return '16px'
      }
    }

    const height = getHeight()

    if (lines === 1) {
      return <Skeleton ref={ref} height={height} className={className} {...props} />
    }

    return (
      <div ref={ref} className={cn('space-y-2', className)}>
        {Array.from({ length: lines }, (_, i) => (
          <Skeleton
            key={i}
            height={height}
            width={i === lines - 1 ? lastLineWidth : '100%'}
            {...props}
          />
        ))}
      </div>
    )
  }
)
TextSkeleton.displayName = 'TextSkeleton'

// Avatar skeleton
export interface AvatarSkeletonProps extends Omit<SkeletonProps, 'rounded'> {
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const AvatarSkeleton = React.forwardRef<HTMLDivElement, AvatarSkeletonProps>(
  ({ size = 'md', className, ...props }, ref) => {
    const getSize = () => {
      switch (size) {
        case 'sm': return 'w-8 h-8'
        case 'md': return 'w-10 h-10'
        case 'lg': return 'w-12 h-12'
        case 'xl': return 'w-16 h-16'
        default: return 'w-10 h-10'
      }
    }

    return (
      <Skeleton
        ref={ref}
        rounded="full"
        className={cn(getSize(), className)}
        {...props}
      />
    )
  }
)
AvatarSkeleton.displayName = 'AvatarSkeleton'

// Button skeleton
export interface ButtonSkeletonProps extends Omit<SkeletonProps, 'height'> {
  size?: 'sm' | 'md' | 'lg'
}

const ButtonSkeleton = React.forwardRef<HTMLDivElement, ButtonSkeletonProps>(
  ({ size = 'md', className, ...props }, ref) => {
    const getSize = () => {
      switch (size) {
        case 'sm': return 'h-8 w-20'
        case 'md': return 'h-10 w-24'
        case 'lg': return 'h-12 w-28'
        default: return 'h-10 w-24'
      }
    }

    return (
      <Skeleton
        ref={ref}
        className={cn(getSize(), className)}
        {...props}
      />
    )
  }
)
ButtonSkeleton.displayName = 'ButtonSkeleton'

// Card skeleton for loading cards
export interface CardSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  showHeader?: boolean
  showFooter?: boolean
  headerHeight?: string
  contentLines?: number
  footerHeight?: string
}

const CardSkeleton = React.forwardRef<HTMLDivElement, CardSkeletonProps>(
  ({ 
    showHeader = true, 
    showFooter = false, 
    headerHeight = '60px',
    contentLines = 3,
    footerHeight = '50px',
    className,
    ...props 
  }, ref) => {
    return (
      <div ref={ref} className={cn('card p-6 space-y-4', className)} {...props}>
        {showHeader && (
          <div className="space-y-2">
            <Skeleton height={headerHeight} />
          </div>
        )}
        
        <div className="space-y-2">
          <TextSkeleton lines={contentLines} />
        </div>
        
        {showFooter && (
          <div className="pt-2">
            <Skeleton height={footerHeight} />
          </div>
        )}
      </div>
    )
  }
)
CardSkeleton.displayName = 'CardSkeleton'

// Table skeleton for data tables
export interface TableSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  rows?: number
  columns?: number
  showHeader?: boolean
}

const TableSkeleton = React.forwardRef<HTMLDivElement, TableSkeletonProps>(
  ({ rows = 5, columns = 4, showHeader = true, className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('w-full', className)} {...props}>
        <div className="rounded-lg border">
          <table className="w-full">
            {showHeader && (
              <thead>
                <tr className="border-b">
                  {Array.from({ length: columns }, (_, i) => (
                    <th key={i} className="p-3">
                      <Skeleton height="20px" />
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {Array.from({ length: rows }, (_, rowIndex) => (
                <tr key={rowIndex} className="border-b last:border-b-0">
                  {Array.from({ length: columns }, (_, colIndex) => (
                    <td key={colIndex} className="p-3">
                      <Skeleton height="20px" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }
)
TableSkeleton.displayName = 'TableSkeleton'

// Form skeleton for loading forms
export interface FormSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  fields?: number
  showButtons?: boolean
}

const FormSkeleton = React.forwardRef<HTMLDivElement, FormSkeletonProps>(
  ({ fields = 4, showButtons = true, className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('space-y-6', className)} {...props}>
        {Array.from({ length: fields }, (_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton height="20px" width="30%" />
            <Skeleton height="40px" width="100%" />
          </div>
        ))}
        
        {showButtons && (
          <div className="flex gap-3 pt-4">
            <ButtonSkeleton />
            <ButtonSkeleton />
          </div>
        )}
      </div>
    )
  }
)
FormSkeleton.displayName = 'FormSkeleton'

// Vehicle card skeleton (specific to your app)
export interface VehicleCardSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

const VehicleCardSkeleton = React.forwardRef<HTMLDivElement, VehicleCardSkeletonProps>(
  ({ className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('card overflow-hidden', className)} {...props}>
        {/* Image skeleton */}
        <Skeleton height="200px" rounded="none" className="rounded-t-lg" />
        
        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Title */}
          <TextSkeleton size="lg" />
          
          {/* Price */}
          <Skeleton height="24px" width="40%" />
          
          {/* Specs */}
          <div className="space-y-2">
            <TextSkeleton lines={2} size="sm" />
          </div>
          
          {/* Buttons */}
          <div className="flex gap-2 pt-2">
            <ButtonSkeleton size="sm" />
            <ButtonSkeleton size="sm" />
          </div>
        </div>
      </div>
    )
  }
)
VehicleCardSkeleton.displayName = 'VehicleCardSkeleton'

// Page skeleton for full page loading
export interface PageSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  showHeader?: boolean
  showSidebar?: boolean
  showFooter?: boolean
}

const PageSkeleton = React.forwardRef<HTMLDivElement, PageSkeletonProps>(
  ({ showHeader = true, showSidebar = false, showFooter = true, className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('min-h-screen', className)} {...props}>
        {showHeader && (
          <div className="border-b">
            <div className="container-fluid py-4">
              <div className="flex items-center justify-between">
                <Skeleton height="40px" width="120px" />
                <div className="flex gap-4">
                  <Skeleton height="40px" width="80px" />
                  <Skeleton height="40px" width="80px" />
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className={cn('flex', showSidebar && 'gap-6')}>
          {showSidebar && (
            <div className="w-64 border-r p-6">
              <div className="space-y-4">
                {Array.from({ length: 6 }, (_, i) => (
                  <Skeleton key={i} height="40px" />
                ))}
              </div>
            </div>
          )}
          
          <div className="flex-1 p-6">
            <div className="space-y-6">
              <TextSkeleton size="3xl" />
              <TextSkeleton lines={3} />
              
              <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }, (_, i) => (
                  <CardSkeleton key={i} />
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {showFooter && (
          <div className="border-t mt-12">
            <div className="container-fluid py-8">
              <div className="grid gap-6 grid-cols-1 md:grid-cols-4">
                {Array.from({ length: 4 }, (_, i) => (
                  <div key={i} className="space-y-4">
                    <Skeleton height="20px" width="60%" />
                    <div className="space-y-2">
                      {Array.from({ length: 4 }, (_, j) => (
                        <Skeleton key={j} height="16px" width="80%" />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }
)
PageSkeleton.displayName = 'PageSkeleton'

export {
  Skeleton,
  TextSkeleton,
  AvatarSkeleton,
  ButtonSkeleton,
  CardSkeleton,
  TableSkeleton,
  FormSkeleton,
  VehicleCardSkeleton,
  PageSkeleton,
  skeletonVariants,
}