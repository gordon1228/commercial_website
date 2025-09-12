/**
 * Centralized Static Fallback Configuration
 * 
 * This file contains all static fallback data for the application.
 * Update this single file to change fallback values across the entire project.
 * 
 * Guidelines:
 * - Only include stable, rarely-changing business information
 * - Avoid dynamic content, pricing, or time-sensitive data
 * - Keep fallbacks professional and accurate
 */

// TypeScript interfaces for type safety
export interface CompanyFallbacks {
  name: string
  legalName: string
  tagline: string
  description: string
}

export interface ContactFallbacks {
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
  directions?: string
}

export interface NavigationFallbacks {
  mainMenu: Array<{
    label: string
    href: string
  }>
  socialMedia: {
    facebook?: string
    twitter?: string
    instagram?: string
    linkedin?: string
  }
  legal: {
    privacy: string
    terms: string
  }
}

export interface AssetFallbacks {
  logo: string
  comingSoonImage: string
  comingSoonImageMobile: string
  defaultVehicleImage: string
  favicon: string
}

export interface BusinessHoursFallbacks {
  mondayToFriday: string
  saturday: string
  sunday: string
}

export interface StaticFallbacksConfig {
  company: CompanyFallbacks
  contact: ContactFallbacks
  navigation: NavigationFallbacks
  assets: AssetFallbacks
  hours: BusinessHoursFallbacks
}

// Main fallback configuration
export const STATIC_FALLBACKS: StaticFallbacksConfig = {
  // Company Identity - Core business information
  company: {
    name: 'EVTL',
    legalName: 'EVTL Sdn. Bhd.',
    tagline: 'Mining 24 Hours a Day with Autonomous Trucks Coming Soon',
    description: 'EVTL Sdn. Bhd. is a next-generation mobility startup focusing on Electric Trucks (EV Trucks) and future smart transport solutions. We collaborate with local and international partners to accelerate Malaysia\'s green logistics transformation.'
  },

  // Contact Information - Critical business data that must always be available
  contact: {
    salesPhone: '+60 10 339 1414',
    servicePhone: '+60 16 332 2349',
    financePhone: '+60 16 332 2349',
    salesEmail: 'sales@evtl.com',
    serviceEmail: 'service@evtl.com',
    supportEmail: 'support@evtl.com',
    address: '3-20 Level 3 MKH Boulevard, Jalan Changkat',
    city: 'Kajang',
    state: 'Selangor',
    postcode: '43000',
    country: 'Malaysia',
    directions: 'Near MRT Station'
  },

  // Navigation Structure - Stable menu and link structure
  navigation: {
    mainMenu: [
      { label: 'Home', href: '/' },
      { label: 'Fleet', href: '/vehicles' },
      { label: 'About', href: '/about' },
      { label: 'Technology', href: '/technology' },
      { label: 'Contact', href: '/contact' }
    ],
    socialMedia: {
      facebook: 'https://facebook.com/evtl',
      linkedin: 'https://linkedin.com/company/evtl',
      instagram: 'https://instagram.com/evtl'
    },
    legal: {
      privacy: '/privacy-policy',
      terms: '/terms-of-service'
    }
  },

  // Static Assets - Default images and resources
  assets: {
    logo: '/images/evtl-logo.png',
    comingSoonImage: '/uploads/ComingSoon.jpg',
    comingSoonImageMobile: '/uploads/ComingSoon-mobile.jpg',
    defaultVehicleImage: '/images/default-vehicle.jpg',
    favicon: '/favicon.ico'
  },

  // Business Hours - Stable operating schedule
  hours: {
    mondayToFriday: '8:00 AM - 6:00 PM',
    saturday: '9:00 AM - 1:00 PM',
    sunday: 'Closed'
  }
}

// Utility functions for common fallback scenarios
export const getFallbackPhone = (type: 'sales' | 'service' | 'finance' = 'sales'): string => {
  return STATIC_FALLBACKS.contact[`${type}Phone`] || STATIC_FALLBACKS.contact.salesPhone
}

export const getFallbackEmail = (type: 'sales' | 'service' | 'support' = 'sales'): string => {
  return STATIC_FALLBACKS.contact[`${type}Email`] || STATIC_FALLBACKS.contact.salesEmail
}

export const getFullAddress = (): string => {
  const { address, city, state, postcode, country } = STATIC_FALLBACKS.contact
  return `${address}, ${city}, ${state} ${postcode}, ${country}`
}

export const getCurrentBusinessHours = (): string => {
  const today = new Date().getDay()
  if (today >= 1 && today <= 5) return STATIC_FALLBACKS.hours.mondayToFriday
  if (today === 6) return STATIC_FALLBACKS.hours.saturday
  return STATIC_FALLBACKS.hours.sunday
}

// Environment-specific fallbacks (if needed)
const isDevelopment = process.env.NODE_ENV === 'development'

export const ENVIRONMENT_FALLBACKS = isDevelopment ? {
  ...STATIC_FALLBACKS,
  company: {
    ...STATIC_FALLBACKS.company,
    name: 'EVTL (Development)'
  }
} : STATIC_FALLBACKS

export default STATIC_FALLBACKS