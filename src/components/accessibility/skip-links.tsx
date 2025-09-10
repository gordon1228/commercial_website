'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface SkipLink {
  id: string
  label: string
  href: string
}

interface SkipLinksProps {
  links?: SkipLink[]
  className?: string
}

const defaultSkipLinks: SkipLink[] = [
  { id: 'main-content', label: 'Skip to main content', href: '#main-content' },
  { id: 'navigation', label: 'Skip to navigation', href: '#main-navigation' },
  { id: 'footer', label: 'Skip to footer', href: '#footer' }
]

export function SkipLinks({ links = defaultSkipLinks, className }: SkipLinksProps) {
  const [isFocused, setIsFocused] = useState(false)

  return (
    <div className={cn('sr-only focus-within:not-sr-only', className)}>
      <div className="fixed top-0 left-0 z-50 p-2">
        {links.map((link) => (
          <Link
            key={link.id}
            href={link.href}
            className={cn(
              'inline-block bg-blue-600 text-white px-4 py-2 rounded-md font-medium',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
              'transform -translate-y-full focus:translate-y-0',
              'transition-transform duration-200',
              'mr-2 mb-2'
            )}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  )
}

// Landmark component for better screen reader navigation
interface LandmarkProps {
  children: React.ReactNode
  as?: keyof JSX.IntrinsicElements
  label?: string
  id?: string
  className?: string
}

export function Landmark({ 
  children, 
  as: Component = 'div', 
  label, 
  id, 
  className 
}: LandmarkProps) {
  return (
    <Component 
      id={id}
      aria-label={label}
      role="region"
      className={className}
    >
      {children}
    </Component>
  )
}

// Visually hidden component for screen readers
interface VisuallyHiddenProps {
  children: React.ReactNode
  as?: keyof JSX.IntrinsicElements
  className?: string
}

export function VisuallyHidden({ 
  children, 
  as: Component = 'span', 
  className 
}: VisuallyHiddenProps) {
  return (
    <Component className={cn('sr-only', className)}>
      {children}
    </Component>
  )
}

// Focus trap for modals and overlays
interface FocusTrapProps {
  children: React.ReactNode
  enabled?: boolean
  className?: string
}

export function FocusTrap({ children, enabled = true, className }: FocusTrapProps) {
  useEffect(() => {
    if (!enabled) return

    const focusableElements = [
      'button:not([disabled])',
      '[href]',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])'
    ].join(', ')

    const container = document.querySelector('[data-focus-trap]')
    if (!container) return

    const focusableNodes = Array.from(
      container.querySelectorAll(focusableElements)
    ) as HTMLElement[]

    const firstNode = focusableNodes[0]
    const lastNode = focusableNodes[focusableNodes.length - 1]

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstNode) {
            e.preventDefault()
            lastNode?.focus()
          }
        } else {
          if (document.activeElement === lastNode) {
            e.preventDefault()
            firstNode?.focus()
          }
        }
      }
      
      if (e.key === 'Escape') {
        const closeButton = container.querySelector('[data-close]') as HTMLElement
        closeButton?.click()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    firstNode?.focus()

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [enabled])

  return (
    <div data-focus-trap className={className}>
      {children}
    </div>
  )
}

// Announcement component for screen readers
interface AnnouncementProps {
  message: string
  priority?: 'polite' | 'assertive'
  delay?: number
}

export function Announcement({ message, priority = 'polite', delay = 0 }: AnnouncementProps) {
  const [announce, setAnnounce] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnnounce(message)
      
      // Clear after announcement to allow re-announcement of same message
      const clearTimer = setTimeout(() => {
        setAnnounce('')
      }, 1000)

      return () => clearTimeout(clearTimer)
    }, delay)

    return () => clearTimeout(timer)
  }, [message, delay])

  return (
    <div 
      aria-live={priority}
      aria-atomic="true"
      className="sr-only"
    >
      {announce}
    </div>
  )
}