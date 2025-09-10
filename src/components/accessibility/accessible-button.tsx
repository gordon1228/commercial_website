'use client'

import { forwardRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { Announcement } from './skip-links'

interface AccessibleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  loadingText?: string
  successMessage?: string
  errorMessage?: string
  icon?: React.ComponentType<{ className?: string }>
  iconPosition?: 'left' | 'right'
  fullWidth?: boolean
  as?: 'button' | 'a'
  href?: string
  target?: string
  rel?: string
}

const variantClasses = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
  secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
  ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
  destructive: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
}

const sizeClasses = {
  sm: 'px-3 py-2 text-sm min-h-[36px]',
  md: 'px-4 py-2 text-base min-h-[44px]',
  lg: 'px-6 py-3 text-lg min-h-[52px]'
}

export const AccessibleButton = forwardRef<HTMLButtonElement | HTMLAnchorElement, AccessibleButtonProps>(
  ({
    children,
    className,
    variant = 'primary',
    size = 'md',
    loading = false,
    loadingText = 'Loading...',
    successMessage,
    errorMessage,
    icon: Icon,
    iconPosition = 'left',
    fullWidth = false,
    disabled,
    onClick,
    as = 'button',
    href,
    target,
    rel,
    ...props
  }, ref) => {
    const [announcement, setAnnouncement] = useState('')

    const baseClasses = cn(
      // Base styling
      'inline-flex items-center justify-center font-medium rounded-lg',
      'transition-all duration-200 ease-in-out',
      // Focus styles for accessibility
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      // Disabled styles
      'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
      // Touch-friendly sizing
      'touch-manipulation select-none',
      // Variant and size classes
      variantClasses[variant],
      sizeClasses[size],
      fullWidth && 'w-full',
      className
    )

    const handleClick = async (e: React.MouseEvent) => {
      if (disabled || loading) {
        e.preventDefault()
        return
      }

      try {
        if (onClick) {
          const result = onClick(e as any)
          
          // Handle async onClick functions
          if (result instanceof Promise) {
            await result
            if (successMessage) {
              setAnnouncement(successMessage)
            }
          }
        }
      } catch (error) {
        if (errorMessage) {
          setAnnouncement(errorMessage)
        }
      }
    }

    const content = (
      <>
        {loading && (
          <svg 
            className="animate-spin -ml-1 mr-3 h-5 w-5" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4" 
              className="opacity-25"
            />
            <path 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              className="opacity-75"
            />
          </svg>
        )}
        
        {Icon && !loading && iconPosition === 'left' && (
          <Icon className={cn('h-5 w-5', children && 'mr-2')} aria-hidden="true" />
        )}
        
        <span>
          {loading ? loadingText : children}
        </span>
        
        {Icon && !loading && iconPosition === 'right' && (
          <Icon className={cn('h-5 w-5', children && 'ml-2')} aria-hidden="true" />
        )}
      </>
    )

    if (as === 'a' && href) {
      return (
        <>
          <a
            ref={ref as React.Ref<HTMLAnchorElement>}
            href={href}
            target={target}
            rel={target === '_blank' ? 'noopener noreferrer' : rel}
            className={baseClasses}
            onClick={handleClick}
            {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
          >
            {content}
          </a>
          {announcement && <Announcement message={announcement} />}
        </>
      )
    }

    return (
      <>
        <button
          ref={ref as React.Ref<HTMLButtonElement>}
          className={baseClasses}
          disabled={disabled || loading}
          onClick={handleClick}
          aria-disabled={disabled || loading}
          {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
        >
          {content}
        </button>
        {announcement && <Announcement message={announcement} />}
      </>
    )
  }
)

AccessibleButton.displayName = 'AccessibleButton'

// Accessible icon button with proper labeling
interface AccessibleIconButtonProps extends Omit<AccessibleButtonProps, 'children'> {
  icon: React.ComponentType<{ className?: string }>
  label: string
  showLabel?: boolean
}

export const AccessibleIconButton = forwardRef<HTMLButtonElement, AccessibleIconButtonProps>(
  ({ icon: Icon, label, showLabel = false, className, ...props }, ref) => {
    return (
      <AccessibleButton
        ref={ref}
        className={cn('p-2', !showLabel && 'min-w-[44px]', className)}
        aria-label={label}
        {...props}
      >
        <Icon className="h-5 w-5" aria-hidden="true" />
        {showLabel && <span className="ml-2">{label}</span>}
      </AccessibleButton>
    )
  }
)

AccessibleIconButton.displayName = 'AccessibleIconButton'

// Button group with proper ARIA labeling
interface AccessibleButtonGroupProps {
  children: React.ReactNode
  label?: string
  orientation?: 'horizontal' | 'vertical'
  className?: string
}

export function AccessibleButtonGroup({ 
  children, 
  label, 
  orientation = 'horizontal',
  className 
}: AccessibleButtonGroupProps) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cn(
        'inline-flex',
        orientation === 'horizontal' ? 'flex-row' : 'flex-col',
        '[&>*:not(:first-child)]:ml-[-1px] [&>*:not(:last-child)]:rounded-r-none [&>*:not(:first-child)]:rounded-l-none',
        orientation === 'vertical' && '[&>*:not(:first-child)]:mt-[-1px] [&>*:not(:first-child)]:ml-0 [&>*:not(:last-child)]:rounded-b-none [&>*:not(:first-child)]:rounded-t-none',
        className
      )}
    >
      {children}
    </div>
  )
}

// Toggle button with ARIA states
interface AccessibleToggleButtonProps extends Omit<AccessibleButtonProps, 'onClick'> {
  pressed?: boolean
  onToggle?: (pressed: boolean) => void
  pressedLabel?: string
  unpressedLabel?: string
}

export const AccessibleToggleButton = forwardRef<HTMLButtonElement, AccessibleToggleButtonProps>(
  ({ 
    pressed = false, 
    onToggle, 
    pressedLabel,
    unpressedLabel,
    children, 
    className,
    ...props 
  }, ref) => {
    const handleClick = () => {
      onToggle?.(!pressed)
    }

    return (
      <AccessibleButton
        ref={ref}
        className={cn(pressed && 'bg-blue-600 text-white', className)}
        onClick={handleClick}
        aria-pressed={pressed}
        aria-label={pressed ? pressedLabel : unpressedLabel}
        {...props}
      >
        {children}
      </AccessibleButton>
    )
  }
)

AccessibleToggleButton.displayName = 'AccessibleToggleButton'