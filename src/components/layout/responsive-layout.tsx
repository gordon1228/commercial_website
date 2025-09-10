'use client'

import { ReactNode, useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { MobileHeader } from '@/components/navigation/mobile-nav'
import { ResponsiveContainer } from '@/components/ui/responsive-container'

interface ResponsiveLayoutProps {
  children: ReactNode
  className?: string
  showMobileHeader?: boolean
  headerContent?: {
    logo?: ReactNode
    actions?: ReactNode
    navItems?: Array<{
      name: string
      href: string
      icon?: React.ComponentType<{ className?: string }>
      children?: Array<{ name: string; href: string }>
    }>
  }
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '7xl' | 'full'
}

export function ResponsiveLayout({ 
  children, 
  className,
  showMobileHeader = true,
  headerContent,
  maxWidth = '7xl'
}: ResponsiveLayoutProps) {
  return (
    <div className={cn('min-h-screen bg-gray-50', className)}>
      {showMobileHeader && (
        <MobileHeader 
          logo={headerContent?.logo}
          actions={headerContent?.actions}
          navItems={headerContent?.navItems}
        />
      )}
      
      <main className="flex-1">
        <ResponsiveContainer maxWidth={maxWidth} padding="md">
          {children}
        </ResponsiveContainer>
      </main>
    </div>
  )
}

// Mobile-optimized form layout
interface MobileFormLayoutProps {
  children: ReactNode
  title?: string
  subtitle?: string
  className?: string
}

export function MobileFormLayout({ 
  children, 
  title, 
  subtitle, 
  className 
}: MobileFormLayoutProps) {
  return (
    <ResponsiveContainer maxWidth="md" padding="md">
      <div className={cn('bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8', className)}>
        {(title || subtitle) && (
          <div className="mb-6 text-center md:text-left">
            {title && (
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="text-gray-600">
                {subtitle}
              </p>
            )}
          </div>
        )}
        {children}
      </div>
    </ResponsiveContainer>
  )
}

// Mobile-optimized detail page layout
interface MobileDetailLayoutProps {
  children: ReactNode
  title: string
  breadcrumbs?: Array<{ name: string; href?: string }>
  actions?: ReactNode
  sidebar?: ReactNode
  className?: string
}

export function MobileDetailLayout({ 
  children, 
  title, 
  breadcrumbs,
  actions,
  sidebar,
  className 
}: MobileDetailLayoutProps) {
  const [showSidebar, setShowSidebar] = useState(false)

  return (
    <ResponsiveContainer maxWidth="7xl" padding="md">
      <div className={cn('space-y-6', className)}>
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
          {/* Breadcrumbs */}
          {breadcrumbs && (
            <nav className="mb-4" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-2 text-sm">
                {breadcrumbs.map((crumb, index) => (
                  <li key={index} className="flex items-center">
                    {index > 0 && (
                      <span className="text-gray-400 mx-2">/</span>
                    )}
                    {crumb.href ? (
                      <a 
                        href={crumb.href}
                        className="text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {crumb.name}
                      </a>
                    ) : (
                      <span className="text-gray-500">{crumb.name}</span>
                    )}
                  </li>
                ))}
              </ol>
            </nav>
          )}

          {/* Title and Actions */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              {title}
            </h1>
            {actions && (
              <div className="flex flex-col sm:flex-row gap-2">
                {actions}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-8 xl:col-span-9">
            {children}
          </div>

          {/* Sidebar */}
          {sidebar && (
            <>
              {/* Mobile Sidebar Toggle */}
              <div className="lg:hidden mb-6">
                <button
                  onClick={() => setShowSidebar(!showSidebar)}
                  className="w-full bg-white border border-gray-200 rounded-lg p-4 text-left hover:bg-gray-50"
                >
                  <span className="font-medium text-gray-900">
                    {showSidebar ? 'Hide' : 'Show'} Additional Info
                  </span>
                </button>
              </div>

              {/* Sidebar Content */}
              <div className={cn(
                'lg:col-span-4 xl:col-span-3 space-y-6',
                showSidebar ? 'block' : 'hidden lg:block'
              )}>
                {sidebar}
              </div>
            </>
          )}
        </div>
      </div>
    </ResponsiveContainer>
  )
}

// Mobile-optimized dashboard layout
interface MobileDashboardLayoutProps {
  children: ReactNode
  title?: string
  stats?: Array<{
    label: string
    value: string | number
    icon?: React.ComponentType<{ className?: string }>
    trend?: {
      value: number
      isPositive: boolean
    }
  }>
  quickActions?: ReactNode
  className?: string
}

export function MobileDashboardLayout({ 
  children, 
  title,
  stats,
  quickActions,
  className 
}: MobileDashboardLayoutProps) {
  return (
    <ResponsiveContainer maxWidth="7xl" padding="md">
      <div className={cn('space-y-6', className)}>
        {/* Title */}
        {title && (
          <div className="text-center md:text-left">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              {title}
            </h1>
          </div>
        )}

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  {stat.icon && (
                    <stat.icon className="h-8 w-8 text-gray-400" />
                  )}
                </div>
                {stat.trend && (
                  <div className={cn(
                    'mt-2 flex items-center text-sm',
                    stat.trend.isPositive ? 'text-green-600' : 'text-red-600'
                  )}>
                    <span>
                      {stat.trend.isPositive ? '+' : '-'}{Math.abs(stat.trend.value)}%
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        {quickActions && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            {quickActions}
          </div>
        )}

        {/* Main Content */}
        {children}
      </div>
    </ResponsiveContainer>
  )
}

// Mobile table wrapper with horizontal scroll
interface MobileTableWrapperProps {
  children: ReactNode
  className?: string
}

export function MobileTableWrapper({ children, className }: MobileTableWrapperProps) {
  return (
    <div className={cn('bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden', className)}>
      <div className="overflow-x-auto">
        <div className="min-w-full">
          {children}
        </div>
      </div>
    </div>
  )
}

// Mobile card list for data display
interface MobileCardListProps<T> {
  items: T[]
  renderCard: (item: T, index: number) => ReactNode
  className?: string
  loading?: boolean
  emptyState?: ReactNode
}

export function MobileCardList<T>({ 
  items, 
  renderCard, 
  className,
  loading = false,
  emptyState 
}: MobileCardListProps<T>) {
  if (loading) {
    return (
      <div className={cn('space-y-4', className)}>
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 animate-pulse">
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!items.length && emptyState) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        {emptyState}
      </div>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      {items.map((item, index) => renderCard(item, index))}
    </div>
  )
}

// Responsive section with mobile-optimized spacing
interface ResponsiveSectionProps {
  children: ReactNode
  title?: string
  subtitle?: string
  className?: string
  background?: 'white' | 'gray' | 'transparent'
  padding?: 'sm' | 'md' | 'lg' | 'xl'
}

const backgroundClasses = {
  white: 'bg-white',
  gray: 'bg-gray-50',
  transparent: 'bg-transparent'
}

const sectionPaddingClasses = {
  sm: 'py-8 md:py-12',
  md: 'py-12 md:py-16',
  lg: 'py-16 md:py-20',
  xl: 'py-20 md:py-24'
}

export function ResponsiveSection({ 
  children, 
  title, 
  subtitle,
  className,
  background = 'transparent',
  padding = 'md'
}: ResponsiveSectionProps) {
  return (
    <section className={cn(
      backgroundClasses[background],
      sectionPaddingClasses[padding],
      className
    )}>
      <ResponsiveContainer maxWidth="7xl" padding="md">
        {(title || subtitle) && (
          <div className="text-center mb-12 md:mb-16">
            {title && (
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
                {subtitle}
              </p>
            )}
          </div>
        )}
        {children}
      </ResponsiveContainer>
    </section>
  )
}