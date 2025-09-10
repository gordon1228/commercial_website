import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface ResponsiveContainerProps {
  children: ReactNode
  className?: string
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '7xl' | 'full'
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  as?: keyof JSX.IntrinsicElements
}

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md', 
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '7xl': 'max-w-7xl',
  full: 'max-w-full'
}

const paddingClasses = {
  none: '',
  sm: 'px-4 py-2',
  md: 'px-6 py-4',
  lg: 'px-8 py-6',
  xl: 'px-12 py-8'
}

export function ResponsiveContainer({ 
  children, 
  className,
  maxWidth = '7xl',
  padding = 'md',
  as: Component = 'div'
}: ResponsiveContainerProps) {
  return (
    <Component 
      className={cn(
        'mx-auto w-full',
        maxWidthClasses[maxWidth],
        paddingClasses[padding],
        className
      )}
    >
      {children}
    </Component>
  )
}

// Mobile-first grid system
interface ResponsiveGridProps {
  children: ReactNode
  className?: string
  cols?: {
    default?: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
  }
  gap?: 'sm' | 'md' | 'lg' | 'xl'
}

const gapClasses = {
  sm: 'gap-2',
  md: 'gap-4', 
  lg: 'gap-6',
  xl: 'gap-8'
}

export function ResponsiveGrid({ 
  children, 
  className,
  cols = { default: 1, md: 2, lg: 3 },
  gap = 'md'
}: ResponsiveGridProps) {
  const gridCols = [
    cols.default && `grid-cols-${cols.default}`,
    cols.sm && `sm:grid-cols-${cols.sm}`,
    cols.md && `md:grid-cols-${cols.md}`,
    cols.lg && `lg:grid-cols-${cols.lg}`,
    cols.xl && `xl:grid-cols-${cols.xl}`
  ].filter(Boolean).join(' ')

  return (
    <div className={cn('grid', gridCols, gapClasses[gap], className)}>
      {children}
    </div>
  )
}

// Mobile-friendly stack component
interface ResponsiveStackProps {
  children: ReactNode
  className?: string
  direction?: {
    default?: 'row' | 'column'
    sm?: 'row' | 'column'
    md?: 'row' | 'column'
    lg?: 'row' | 'column'
  }
  gap?: 'sm' | 'md' | 'lg' | 'xl'
  align?: 'start' | 'center' | 'end' | 'stretch'
  justify?: 'start' | 'center' | 'end' | 'between' | 'around'
}

const directionClasses = {
  row: 'flex-row',
  column: 'flex-col'
}

const alignClasses = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch'
}

const justifyClasses = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
  around: 'justify-around'
}

export function ResponsiveStack({
  children,
  className,
  direction = { default: 'column', md: 'row' },
  gap = 'md',
  align = 'start',
  justify = 'start'
}: ResponsiveStackProps) {
  const directionCls = [
    direction.default && directionClasses[direction.default],
    direction.sm && `sm:${directionClasses[direction.sm]}`,
    direction.md && `md:${directionClasses[direction.md]}`,
    direction.lg && `lg:${directionClasses[direction.lg]}`
  ].filter(Boolean).join(' ')

  return (
    <div className={cn(
      'flex',
      directionCls,
      gapClasses[gap],
      alignClasses[align],
      justifyClasses[justify],
      className
    )}>
      {children}
    </div>
  )
}