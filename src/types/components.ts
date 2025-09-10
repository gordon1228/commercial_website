import { ReactNode } from 'react'
import type { VehicleCardData } from './vehicle'

// Layout component props
export interface LayoutProps {
  children: ReactNode
  className?: string
  showHeader?: boolean
  showFooter?: boolean
}

// Page component props
export interface PageProps {
  params?: Record<string, string | string[]>
  searchParams?: Record<string, string | string[] | undefined>
}

// Vehicle-related component props
export interface VehicleCardProps {
  vehicle: VehicleCardData
  onSaveToggle?: (vehicleId: string, saved: boolean) => void
  showSaveButton?: boolean
  showViewCount?: boolean
  className?: string
}

export interface VehicleGridProps {
  initialFilters?: Record<string, string | string[]>
  showFilters?: boolean
  showPagination?: boolean
  itemsPerPage?: number
  className?: string
}

export interface VehicleFiltersProps {
  onFiltersChange: (filters: Record<string, string | string[]>) => void
  initialFilters?: Record<string, string | string[]>
  categories?: Array<{ id: string; name: string; slug: string }>
  showPriceRange?: boolean
  showYearRange?: boolean
  className?: string
}

export interface FeaturedVehiclesProps {
  limit?: number
  autoPlay?: boolean
  autoPlayInterval?: number
  showDots?: boolean
  showArrows?: boolean
  className?: string
}

// Form component props
export interface FormFieldProps {
  label: string
  name: string
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'textarea'
  placeholder?: string
  required?: boolean
  error?: string
  disabled?: boolean
  className?: string
}

export interface FormProps {
  onSubmit: (data: Record<string, unknown>) => void | Promise<void>
  children: ReactNode
  className?: string
  loading?: boolean
}

// Search component props
export interface SearchProps {
  onSearch: (query: string) => void
  placeholder?: string
  initialValue?: string
  showFilters?: boolean
  debounceMs?: number
  className?: string
}

// Modal component props
export interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  description?: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  closeOnBackdrop?: boolean
  showCloseButton?: boolean
  className?: string
}

export interface ConfirmModalProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void | Promise<void>
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: 'default' | 'destructive'
  loading?: boolean
}

// Data table component props
export interface DataTableColumn<T = unknown> {
  key: string
  label: string
  sortable?: boolean
  width?: string
  render?: (value: unknown, item: T) => ReactNode
  className?: string
}

export interface DataTableProps<T = unknown> {
  data: T[]
  columns: DataTableColumn<T>[]
  loading?: boolean
  pagination?: {
    page: number
    limit: number
    total: number
    onPageChange: (page: number) => void
    onLimitChange?: (limit: number) => void
  }
  sorting?: {
    key: string
    direction: 'asc' | 'desc'
    onSort: (key: string, direction: 'asc' | 'desc') => void
  }
  selection?: {
    selectedIds: string[]
    onSelectionChange: (ids: string[]) => void
    getItemId: (item: T) => string
  }
  actions?: Array<{
    key: string
    label: string
    icon?: ReactNode
    onClick: (item: T) => void
    variant?: 'default' | 'destructive'
    disabled?: (item: T) => boolean
  }>
  emptyMessage?: string
  className?: string
}

// Loading component props
export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  color?: 'primary' | 'secondary' | 'white'
  text?: string
  className?: string
}

export interface LoadingOverlayProps {
  loading: boolean
  children: ReactNode
  text?: string
  className?: string
}

// Error component props
export interface ErrorDisplayProps {
  error: string | Error
  retry?: () => void
  showDetails?: boolean
  className?: string
}

// Image component props
export interface ResponsiveImageProps {
  src: string
  alt: string
  mobileSrc?: string
  width?: number
  height?: number
  priority?: boolean
  fill?: boolean
  sizes?: string
  className?: string
  onLoad?: () => void
  onError?: () => void
}

export interface ImageUploadProps {
  onUpload: (files: File[]) => void | Promise<void>
  onRemove?: (filename: string) => void
  multiple?: boolean
  maxFiles?: number
  maxSize?: number // in bytes
  acceptedTypes?: string[]
  existingImages?: string[]
  loading?: boolean
  error?: string
  className?: string
}

// Navigation component props
export interface NavigationItem {
  id: string
  label: string
  href: string
  icon?: ReactNode
  active?: boolean
  disabled?: boolean
  children?: NavigationItem[]
}

export interface NavigationProps {
  items: NavigationItem[]
  orientation?: 'horizontal' | 'vertical'
  variant?: 'default' | 'pills' | 'underline'
  className?: string
}

// Badge component props
export interface BadgeProps {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning'
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
  className?: string
}

export interface StatusBadgeProps extends Omit<BadgeProps, 'variant' | 'children'> {
  status: string
  mapping?: Record<string, { variant: BadgeProps['variant']; label?: string }>
}

// Button component props
export interface ButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  type?: 'button' | 'submit' | 'reset'
  onClick?: () => void | Promise<void>
  children: ReactNode
  className?: string
}

export interface IconButtonProps extends Omit<ButtonProps, 'children'> {
  icon: ReactNode
  'aria-label': string
  tooltip?: string
}

// Card component props
export interface CardProps {
  title?: string
  description?: string
  children: ReactNode
  actions?: ReactNode
  className?: string
}

// Toast/notification props
export interface ToastProps {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  description?: string
  duration?: number
  onDismiss: (id: string) => void
}

// Theme and context props
export interface ThemeContextProps {
  theme: 'light' | 'dark' | 'system'
  setTheme: (theme: 'light' | 'dark' | 'system') => void
}

export interface SessionContextProps {
  user: {
    id: string
    email: string
    role: string
  } | null
  loading: boolean
  error?: string
}

// Utility types for common patterns
export type WithClassName<T = {}> = T & { className?: string }
export type WithChildren<T = {}> = T & { children: ReactNode }
export type WithOptionalChildren<T = {}> = T & { children?: ReactNode }
export type EventHandler<T = unknown> = (event: T) => void | Promise<void>
export type AsyncEventHandler<T = unknown> = (event: T) => Promise<void>