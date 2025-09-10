import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'badge',
  {
    variants: {
      variant: {
        default: 'badge-default',
        secondary: 'badge-secondary',
        success: 'badge-success',
        warning: 'badge-warning',
        error: 'badge-error',
        outline: 'badge-outline',
        gradient: 'bg-gradient-to-r from-primary to-secondary text-white',
      },
      size: {
        sm: 'text-xs px-2 py-0.5',
        md: 'text-xs px-2.5 py-0.5',
        lg: 'text-sm px-3 py-1',
      },
      shape: {
        rounded: 'rounded-full',
        square: 'rounded-md',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      shape: 'rounded',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  children: React.ReactNode
  removable?: boolean
  onRemove?: () => void
  icon?: React.ReactNode
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, size, shape, children, removable, onRemove, icon, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(badgeVariants({ variant, size, shape }), className)}
        {...props}
      >
        {icon && <span className="mr-1 flex-shrink-0">{icon}</span>}
        <span className="truncate">{children}</span>
        {removable && onRemove && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onRemove()
            }}
            className="ml-1 flex-shrink-0 hover:bg-black/10 rounded-full p-0.5 transition-colors"
            aria-label="Remove badge"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>
    )
  }
)
Badge.displayName = 'Badge'

// Status Badge for specific status indicators
export interface StatusBadgeProps extends Omit<BadgeProps, 'variant'> {
  status: 'active' | 'inactive' | 'pending' | 'success' | 'error' | 'warning'
  showDot?: boolean
}

const StatusBadge = React.forwardRef<HTMLDivElement, StatusBadgeProps>(
  ({ status, showDot = true, children, className, ...props }, ref) => {
    const getVariant = (): BadgeProps['variant'] => {
      switch (status) {
        case 'active':
        case 'success':
          return 'success'
        case 'inactive':
          return 'secondary'
        case 'pending':
        case 'warning':
          return 'warning'
        case 'error':
          return 'error'
        default:
          return 'default'
      }
    }

    const getDotColor = () => {
      switch (status) {
        case 'active':
        case 'success':
          return 'bg-success'
        case 'inactive':
          return 'bg-secondary-400'
        case 'pending':
        case 'warning':
          return 'bg-warning'
        case 'error':
          return 'bg-error'
        default:
          return 'bg-primary'
      }
    }

    return (
      <Badge
        ref={ref}
        variant={getVariant()}
        icon={showDot ? <span className={cn('w-2 h-2 rounded-full', getDotColor())} /> : undefined}
        className={className}
        {...props}
      >
        {children || status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }
)
StatusBadge.displayName = 'StatusBadge'

// Badge Group for multiple badges
export interface BadgeGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  spacing?: 'tight' | 'normal' | 'loose'
  wrap?: boolean
}

const BadgeGroup = React.forwardRef<HTMLDivElement, BadgeGroupProps>(
  ({ className, children, spacing = 'normal', wrap = true, ...props }, ref) => {
    const getSpacing = () => {
      switch (spacing) {
        case 'tight':
          return 'gap-1'
        case 'normal':
          return 'gap-2'
        case 'loose':
          return 'gap-3'
        default:
          return 'gap-2'
      }
    }

    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center',
          getSpacing(),
          wrap ? 'flex-wrap' : 'flex-nowrap',
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
BadgeGroup.displayName = 'BadgeGroup'

// Count Badge for numerical indicators
export interface CountBadgeProps extends Omit<BadgeProps, 'children'> {
  count: number
  max?: number
  showZero?: boolean
}

const CountBadge = React.forwardRef<HTMLDivElement, CountBadgeProps>(
  ({ count, max = 99, showZero = false, className, ...props }, ref) => {
    if (count === 0 && !showZero) return null

    const displayCount = count > max ? `${max}+` : count.toString()

    return (
      <Badge
        ref={ref}
        className={cn('min-w-[20px] justify-center', className)}
        {...props}
      >
        {displayCount}
      </Badge>
    )
  }
)
CountBadge.displayName = 'CountBadge'

// Interactive Badge for clickable badges
export interface InteractiveBadgeProps extends BadgeProps {
  onClick?: () => void
  selected?: boolean
  disabled?: boolean
}

const InteractiveBadge = React.forwardRef<HTMLDivElement, InteractiveBadgeProps>(
  ({ className, onClick, selected, disabled, ...props }, ref) => {
    return (
      <Badge
        ref={ref}
        className={cn(
          'cursor-pointer transition-all',
          !disabled && 'hover:scale-105 hover:shadow-sm',
          selected && 'ring-2 ring-primary ring-offset-1',
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
        onClick={disabled ? undefined : onClick}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick && !disabled ? 0 : undefined}
        aria-disabled={disabled}
        aria-pressed={selected}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && onClick && !disabled) {
            e.preventDefault()
            onClick()
          }
        }}
        {...props}
      />
    )
  }
)
InteractiveBadge.displayName = 'InteractiveBadge'

export { Badge, StatusBadge, BadgeGroup, CountBadge, InteractiveBadge, badgeVariants }