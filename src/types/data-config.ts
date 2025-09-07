// Vehicle Filter Types
export interface FilterOption {
  id: string
  label: string
}

export interface VehicleFiltersConfig {
  statusOptions: FilterOption[]
  fuelTypeOptions: FilterOption[]
  transmissionOptions: FilterOption[]
  makeOptions: FilterOption[]
}

// Company Info Types
export interface CompanyInfo {
  companyName: string
  companyDescription: string
  storyTitle: string
  storyParagraph1: string
  storyParagraph2: string
  storyParagraph3: string
  missionTitle: string
  missionText: string
  visionTitle: string
  visionText: string
}

export interface CompanyValue {
  id: string
  title: string
  description: string
  iconName: string
  order: number
}

export interface Certification {
  id: string
  name: string
  order: number
}

export interface CompanyInfoConfig {
  companyInfo: CompanyInfo
  values: CompanyValue[]
  certifications: Certification[]
}

// Contact Info Types
export interface ContactInfo {
  salesPhone: string
  servicePhone: string
  financePhone: string
  salesEmail: string
  serviceEmail: string
  supportEmail: string
  address: string
  city: string
  state: string
  postcode: string
  country: string
  directions: string
  mondayToFriday: string
  saturday: string
  sunday: string
}

export interface ContactService {
  icon: string
  title: string
  description: string
  color: string
}

export interface ContactInfoConfig {
  contactInfo: ContactInfo
  contactServices: ContactService[]
}

// Admin Navigation Types
export interface NavigationItem {
  id: string
  name: string
  href: string
  icon: string
  roles: string[]
}

export interface AdminNavigationConfig {
  navigationItems: NavigationItem[]
}

// Dashboard Types
export interface DashboardStat {
  id: string
  title: string
  icon: string
  href: string
  dataKey: string
}

export interface QuickAction {
  id: string
  title: string
  icon: string
  href: string
}

export interface DashboardConfig {
  stats: DashboardStat[]
  quickActions: QuickAction[]
}

// Status Color Types
export interface StatusColorMappings {
  inquiryStatus: {
    [key: string]: string
    default: string
  }
  vehicleStatus: {
    [key: string]: string
    default: string
  }
}

// API Fallback Data Types
export interface ContactInfoFallback {
  id: string
  salesPhone: string
  servicePhone: string
  financePhone: string
  salesEmail: string
  serviceEmail: string
  supportEmail: string
  address: string
  city: string
  state: string
  postcode: string
  country: string
  directions: string
  mondayToFriday: string
  saturday: string
  sunday: string
  siteName: string
  emailNotifications: boolean
  systemNotifications: boolean
  maintenanceMode: boolean
  companyDescription: string
  facebookUrl: string
  twitterUrl: string
  instagramUrl: string
  linkedinUrl: string
  privacyPolicyUrl: string
  termsOfServiceUrl: string
  createdAt?: Date
  updatedAt?: Date
}

export interface CompanyInfoFallback {
  id: string
  companyName: string
  companyDescription: string
  foundedYear: number
  totalVehiclesSold: number
  totalHappyCustomers: number
  totalYearsExp: number
  satisfactionRate: number
  storyTitle: string
  storyParagraph1: string
  storyParagraph2: string
  storyParagraph3: string
  missionTitle: string
  missionText: string
  visionTitle: string
  visionText: string
  createdAt?: Date
  updatedAt?: Date
}

export interface CompanyValueFallback {
  id: string
  title: string
  description: string
  iconName: string
  order: number
  active: boolean
  createdAt?: Date
  updatedAt?: Date
}

export interface CertificationFallback {
  id: string
  name: string
  order: number
  active: boolean
  createdAt?: Date
  updatedAt?: Date
}

// Generic Data Loader Types
export interface DataLoaderResult<T> {
  data: T | null
  error: string | null
  loading: boolean
}