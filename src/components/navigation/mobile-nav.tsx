'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Menu, X, Home, Car, Phone, Info, Wrench, 
  ChevronDown, ChevronRight, ExternalLink 
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface NavItem {
  name: string
  href: string
  icon?: React.ComponentType<{ className?: string }>
  badge?: string
  children?: NavItem[]
}

interface MobileNavProps {
  logo?: React.ReactNode
  items?: NavItem[]
  className?: string
}

const defaultNavItems: NavItem[] = [
  { 
    name: 'Home', 
    href: '/', 
    icon: Home 
  },
  { 
    name: 'Vehicles', 
    href: '/vehicles', 
    icon: Car,
    children: [
      { name: 'All Vehicles', href: '/vehicles' },
      { name: 'Electric Trucks', href: '/vehicles?category=electric' },
      { name: 'Commercial Vans', href: '/vehicles?category=van' },
      { name: 'Heavy Duty', href: '/vehicles?category=heavy-duty' }
    ]
  },
  { 
    name: 'About', 
    href: '/about', 
    icon: Info 
  },
  { 
    name: 'Technology', 
    href: '/technology', 
    icon: Wrench 
  },
  { 
    name: 'Contact', 
    href: '/contact', 
    icon: Phone 
  }
]

export function MobileNav({ 
  logo, 
  items = defaultNavItems, 
  className 
}: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const pathname = usePathname()

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(itemName)) {
        newSet.delete(itemName)
      } else {
        newSet.add(itemName)
      }
      return newSet
    })
  }

  const isActiveLink = (href: string) => {
    if (href === '/') {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <div className={cn('lg:hidden', className)}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 hover:bg-gray-100"
          aria-label="Toggle mobile menu"
        >
          {isOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </Button>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Menu Panel */}
      <div
        className={cn(
          'fixed top-0 right-0 z-50 h-full w-80 max-w-[85vw] bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:hidden',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            {logo ? (
              logo
            ) : (
              <div className="text-xl font-bold text-gray-900">EVTL</div>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-gray-100"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-1">
            {items.map((item) => (
              <div key={item.name}>
                {item.children ? (
                  // Item with children (submenu)
                  <div>
                    <button
                      onClick={() => toggleExpanded(item.name)}
                      className={cn(
                        'w-full flex items-center justify-between px-4 py-3 text-left text-base font-medium transition-colors',
                        isActiveLink(item.href) 
                          ? 'text-blue-600 bg-blue-50' 
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      )}
                    >
                      <div className="flex items-center space-x-3">
                        {item.icon && <item.icon className="h-5 w-5" />}
                        <span>{item.name}</span>
                        {item.badge && (
                          <Badge variant="secondary" className="text-xs">
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                      {expandedItems.has(item.name) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                    
                    {/* Submenu */}
                    {expandedItems.has(item.name) && (
                      <div className="bg-gray-50 border-l-2 border-gray-200 ml-4">
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={cn(
                              'block px-4 py-2 text-sm transition-colors',
                              isActiveLink(child.href)
                                ? 'text-blue-600 bg-blue-50 font-medium'
                                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                            )}
                            onClick={() => setIsOpen(false)}
                          >
                            {child.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  // Regular navigation item
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center space-x-3 px-4 py-3 text-base font-medium transition-colors',
                      isActiveLink(item.href)
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    {item.icon && <item.icon className="h-5 w-5" />}
                    <span>{item.name}</span>
                    {item.badge && (
                      <Badge variant="secondary" className="text-xs">
                        {item.badge}
                      </Badge>
                    )}
                    {item.href.startsWith('http') && (
                      <ExternalLink className="h-4 w-4 text-gray-400" />
                    )}
                  </Link>
                )}
              </div>
            ))}
          </nav>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4">
          <div className="text-center">
            <p className="text-sm text-gray-500">
              © 2025 EVTL Commercial Vehicles
            </p>
            <div className="flex justify-center space-x-4 mt-2">
              <Link 
                href="/privacy" 
                className="text-xs text-gray-400 hover:text-gray-600"
                onClick={() => setIsOpen(false)}
              >
                Privacy
              </Link>
              <Link 
                href="/terms" 
                className="text-xs text-gray-400 hover:text-gray-600"
                onClick={() => setIsOpen(false)}
              >
                Terms
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

// Mobile-optimized header component
interface MobileHeaderProps {
  logo?: React.ReactNode
  actions?: React.ReactNode
  navItems?: NavItem[]
  className?: string
}

export function MobileHeader({ 
  logo, 
  actions, 
  navItems,
  className 
}: MobileHeaderProps) {
  return (
    <header className={cn('sticky top-0 z-30 bg-white border-b border-gray-200 lg:hidden', className)}>
      <div className="flex items-center justify-between px-4 py-3">
        {/* Logo */}
        <div className="flex items-center">
          {logo ? (
            logo
          ) : (
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-black rounded-sm flex items-center justify-center">
                <span className="text-white font-bold text-sm">E</span>
              </div>
              <span className="text-xl font-bold text-gray-900">EVTL</span>
            </Link>
          )}
        </div>

        {/* Actions and Menu */}
        <div className="flex items-center space-x-2">
          {actions}
          <MobileNav items={navItems} />
        </div>
      </div>
    </header>
  )
}

// Touch-friendly button component for mobile
interface TouchButtonProps {
  children: React.ReactNode
  onClick?: () => void
  href?: string
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  disabled?: boolean
}

export function TouchButton({ 
  children, 
  onClick, 
  href, 
  variant = 'primary',
  size = 'md',
  className,
  disabled = false
}: TouchButtonProps) {
  const baseClasses = cn(
    // Minimum touch target size (44px)
    'min-h-[44px] min-w-[44px] inline-flex items-center justify-center',
    'font-medium rounded-lg transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    // Better touch feedback
    'active:scale-95 touch-manipulation',
    className
  )

  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 active:bg-gray-400',
    ghost: 'text-gray-700 hover:bg-gray-100 active:bg-gray-200'
  }

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-6 py-4 text-lg'
  }

  const classes = cn(baseClasses, variantClasses[variant], sizeClasses[size])

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    )
  }

  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={classes}
    >
      {children}
    </button>
  )
}