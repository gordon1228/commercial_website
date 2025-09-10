// Re-export all types for easier importing
export * from './vehicle'
export * from './api'
export * from './validation'
export * from './next-auth'

// Selective re-exports to avoid conflicts
export type {
  FilterOption,
  VehicleFiltersConfig,
  CompanyInfo,
  CompanyValue,
  Certification,
  CompanyInfoConfig,
  ContactInfo,
  ContactService,
  ContactInfoConfig,
  AdminNavigationConfig,
  DashboardStat,
  QuickAction,
  DashboardConfig,
  StatusColorMappings,
  ContactInfoFallback,
  CompanyInfoFallback,
  CompanyValueFallback,
  CertificationFallback,
  DataLoaderResult
} from './data-config'

export type {
  LayoutProps,
  PageProps,
  VehicleCardProps,
  VehicleGridProps,
  VehicleFiltersProps,
  FeaturedVehiclesProps,
  FormFieldProps,
  FormProps,
  SearchProps,
  ModalProps,
  ConfirmModalProps,
  DataTableColumn,
  DataTableProps,
  LoadingSpinnerProps,
  LoadingOverlayProps,
  ErrorDisplayProps,
  ResponsiveImageProps,
  ImageUploadProps,
  NavigationProps,
  BadgeProps,
  StatusBadgeProps,
  ButtonProps,
  IconButtonProps,
  CardProps,
  ToastProps,
  ThemeContextProps,
  SessionContextProps,
  WithClassName,
  WithChildren,
  WithOptionalChildren,
  EventHandler,
  AsyncEventHandler
} from './components'