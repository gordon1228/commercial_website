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
}

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
}

export interface CertificationFallback {
  id: string
  name: string
  order: number
  active: boolean
}

export interface CompanyValueFallback {
  id: string
  title: string
  description: string
  iconName: string
  order: number
  active: boolean
}