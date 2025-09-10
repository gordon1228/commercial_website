import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'btn',
  {
    variants: {
      variant: {
        default: 'btn-primary',
        secondary: 'btn-secondary',
        ghost: 'btn-ghost',
        outline: 'btn-outline',
        destructive: 'btn-destructive',
        success: 'bg-success text-white hover:bg-success/90 shadow-sm hover:shadow-md',
        warning: 'bg-warning text-white hover:bg-warning/90 shadow-sm hover:shadow-md',
        accent: 'bg-accent text-white hover:bg-accent/90 shadow-sm hover:shadow-md',
      },
      size: {
        default: 'h-10 px-4 py-2 text-sm',
        sm: 'btn-sm',
        lg: 'btn-lg',
        xl: 'h-12 px-6 py-3 text-base font-semibold',
        icon: 'h-10 w-10 p-0',
        'icon-sm': 'h-8 w-8 p-0',
        'icon-lg': 'h-12 w-12 p-0',
      },
      loading: {
        true: 'relative text-transparent',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      loading: false,
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  loadingText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    loading, 
    loadingText,
    leftIcon,
    rightIcon,
    asChild = false, 
    children,
    disabled,
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : 'button'
    
    const isDisabled = disabled || loading
    
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, loading, className }))}
        ref={ref}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        {...props}
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="loading-spinner h-4 w-4" />
          </div>
        )}
        {!asChild && (
          <>
            {leftIcon && !loading && (
              <span className="mr-2 flex-shrink-0">{leftIcon}</span>
            )}
            <span className={cn(loading && 'opacity-0')}>
              {loading && loadingText ? loadingText : children}
            </span>
            {rightIcon && !loading && (
              <span className="ml-2 flex-shrink-0">{rightIcon}</span>
            )}
          </>
        )}
        {asChild && children}
      </Comp>
    )
  }
)
Button.displayName = 'Button'

// Button Group Component for related actions
export interface ButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical'
  variant?: 'default' | 'outline'
}

const ButtonGroup = React.forwardRef<HTMLDivElement, ButtonGroupProps>(
  ({ className, orientation = 'horizontal', variant = 'default', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex',
          orientation === 'horizontal' 
            ? 'flex-row divide-x divide-border' 
            : 'flex-col divide-y divide-border',
          variant === 'outline' && 'border border-border rounded-lg overflow-hidden',
          className
        )}
        role="group"
        {...props}
      />
    )
  }
)
ButtonGroup.displayName = 'ButtonGroup'

// Icon Button Component for icon-only buttons
export interface IconButtonProps 
  extends Omit<ButtonProps, 'leftIcon' | 'rightIcon' | 'children'> {
  icon: React.ReactNode
  'aria-label': string
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, className, size = 'icon', ...props }, ref) => {
    return (
      <Button
        ref={ref}
        size={size}
        className={className}
        {...props}
      >
        {icon}
      </Button>
    )
  }
)
IconButton.displayName = 'IconButton'

export { Button, ButtonGroup, IconButton, buttonVariants }