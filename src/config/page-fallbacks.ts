/**
 * Page-Specific Fallback Configuration
 * 
 * This file contains fallback data organized by page for better maintainability.
 * Each page has its own fallback data that can be easily managed and updated.
 */

// Page-specific interface definitions
export interface HomepageFallbacks {
  heroTitle: string
  heroSubtitle: string
  heroDescription: string
  heroButtonPrimary: string
  heroButtonSecondary: string
  comingSoonImage: string
  comingSoonImageMobile: string
  companyTagline: string
}

export interface AboutFallbacks {
  companyName: string
  companyDescription: string
  companyDescription2: string
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
  directions: string
  mondayToFriday: string
  saturday: string
  sunday: string
  companyDescription: string
  facebookUrl: string
  twitterUrl: string
  instagramUrl: string
  linkedinUrl: string
  privacyPolicyUrl: string
  termsOfServiceUrl: string
}

export interface TechnologyFallbacks {
  heroTitle: string
  heroSubtitle: string
  heroBackgroundImage: string
  heroBackgroundImageAlt: string
  section1Title: string
  section1Description: string
  section2Title: string
  section2Description: string
  section3Title: string
  section3Description: string
  section4Title: string
  section4Description: string
}

export interface VehiclesFallbacks {
  pageTitle: string
  pageDescription: string
  heroTitle: string
  heroSubtitle: string
  heroDescription: string
  filterTitle: string
  noVehiclesMessage: string
  defaultVehicleImage: string
}

export interface HeaderFallbacks {
  companyName: string
  navigation: Array<{
    label: string
    href: string
  }>
}

export interface FooterFallbacks {
  companyName: string
  companyDescription: string
  salesPhone: string
  servicePhone: string
  salesEmail: string
  serviceEmail: string
  supportEmail: string
  address: string
  city: string
  socialMedia: {
    facebook: string
    linkedin: string
    instagram: string
    twitter: string
  }
}

// Main page fallbacks configuration
export interface PageFallbacksConfig {
  homepage: HomepageFallbacks
  about: AboutFallbacks
  contact: ContactFallbacks
  technology: TechnologyFallbacks
  vehicles: VehiclesFallbacks
  header: HeaderFallbacks
  footer: FooterFallbacks
}

// Static fallback data organized by page
export const PAGE_FALLBACKS: PageFallbacksConfig = {
  homepage: {
    heroTitle: 'Premium Commercial',
    heroSubtitle: 'Vehicles',
    heroDescription: 'Discover EVTL fleet solutions built for businesses that demand excellence, reliability, and uncompromising quality.',
    heroButtonPrimary: 'Explore Fleet',
    heroButtonSecondary: 'Get Quote',
    comingSoonImage: '/uploads/ComingSoon.jpg',
    comingSoonImageMobile: '/uploads/ComingSoon-mobile.jpg',
    companyTagline: 'Mining 24 Hours a Day with Autonomous Trucks Coming Soon'
  },
  
  about: {
    companyName: 'EVTL',
    companyDescription: 'EVTL Sdn. Bhd. is a next-generation mobility startup focusing on Electric Trucks (EV Trucks) and future smart transport solutions. We collaborate with local and international partners to accelerate Malaysia\'s green logistics transformation.',
    companyDescription2: 'We specialize in providing high-quality commercial vehicles and comprehensive fleet solutions to meet diverse business needs, ensuring operational efficiency and environmental sustainability.',
    foundedYear: 1998,
    totalVehiclesSold: 2500,
    totalHappyCustomers: 850,
    totalYearsExp: 25,
    satisfactionRate: 98,
    storyTitle: 'Our Story',
    storyParagraph1: 'Founded in 1998, EVTL began as a small family business with a simple mission: to provide high-quality commercial trucks to businesses that demand excellence. What started as a modest dealership has grown into one of the region\'s most trusted commercial truck providers.',
    storyParagraph2: 'Over the years, we\'ve built our reputation on three core principles: quality trucks, exceptional service, and honest business practices. Our experienced team understands that choosing the right commercial truck is crucial for your business success.',
    storyParagraph3: 'Today, we continue to evolve with the industry, embracing new technologies and sustainable practices while maintaining the personal touch and attention to detail that our customers have come to expect.',
    missionTitle: 'Our Mission',
    missionText: 'To empower businesses with premium commercial trucks and exceptional service, enabling them to achieve their goals while building long-lasting partnerships based on trust and mutual success.',
    visionTitle: 'Our Vision',
    visionText: 'To be the leading commercial truck provider, recognized for our commitment to quality, innovation, and customer satisfaction, while contributing to sustainable transportation solutions for future generations.'
  },
  
  contact: {
    salesPhone: '+60 10 339 1414',
    servicePhone: '+60 16 332 2349',
    financePhone: '+60 16 332 2349',
    salesEmail: 'sales@evtl.com.my',
    serviceEmail: 'service@evtl.com.my',
    supportEmail: 'support@evtl.com.my',
    address: '3-20 Level 3 MKH Boulevard, Jalan Changkat',
    city: 'Kajang',
    state: 'Selangor',
    postcode: '43000',
    country: 'Malaysia',
    directions: 'EVTL Trucks Office',
    mondayToFriday: '9:00 AM - 6:00 PM',
    saturday: '9:00 AM - 1:00 PM',
    sunday: 'Closed',
    companyDescription: 'EVTL Sdn. Bhd. is a next-generation mobility startup focusing on Electric Trucks (EV Trucks) and future smart transport solutions.',
    facebookUrl: '',
    twitterUrl: '',
    instagramUrl: '',
    linkedinUrl: '',
    privacyPolicyUrl: '/privacy',
    termsOfServiceUrl: '/terms'
  },
  
  technology: {
    heroTitle: 'Next-Generation Electric Truck Technology',
    heroSubtitle: 'Advanced electric vehicle technology designed for commercial success and environmental sustainability',
    heroBackgroundImage: '/uploads/Technology_background.png',
    heroBackgroundImageAlt: 'Electric Truck Technology Background',
    section1Title: 'Advanced Battery Technology',
    section1Description: 'Our cutting-edge battery systems provide exceptional range and durability for commercial applications.',
    section2Title: 'Smart Fleet Management',
    section2Description: 'Integrated IoT solutions for real-time monitoring, maintenance prediction, and route optimization.',
    section3Title: 'Rapid Charging Infrastructure',
    section3Description: 'Fast-charging capabilities designed to minimize downtime and maximize operational efficiency.',
    section4Title: 'Sustainable Manufacturing',
    section4Description: 'Eco-friendly production processes that reduce environmental impact while maintaining quality.'
  },
  
  vehicles: {
    pageTitle: 'Our Fleet',
    pageDescription: 'Explore our comprehensive range of commercial electric vehicles designed for modern business needs.',
    heroTitle: 'Commercial Electric Vehicles',
    heroSubtitle: 'Built for Business Excellence',
    heroDescription: 'Discover our innovative fleet of electric commercial vehicles, engineered for reliability, efficiency, and environmental responsibility.',
    filterTitle: 'Find Your Perfect Vehicle',
    noVehiclesMessage: 'No vehicles match your current filters. Please adjust your search criteria.',
    defaultVehicleImage: '/images/default-vehicle.jpg'
  },
  
  header: {
    companyName: 'EVTL',
    navigation: [
      { label: 'Home', href: '/' },
      { label: 'Fleet', href: '/vehicles' },
      { label: 'About', href: '/about' },
      { label: 'Technology', href: '/technology' },
      { label: 'Contact', href: '/contact' }
    ]
  },
  
  footer: {
    companyName: 'EVTL',
    companyDescription: 'EVTL Sdn. Bhd. is a next-generation mobility startup focusing on Electric Trucks (EV Trucks) and future smart transport solutions.',
    salesPhone: '+60 10 339 1414',
    servicePhone: '+60 16 332 2349',
    salesEmail: 'sales@evtl.com.my',
    serviceEmail: 'service@evtl.com.my',
    supportEmail: 'support@evtl.com.my',
    address: '3-20 Level 3 MKH Boulevard, Jalan Changkat',
    city: 'Kajang',
    socialMedia: {
      facebook: '',
      linkedin: '',
      instagram: '',
      twitter: ''
    }
  }
}

// Utility functions for getting page-specific fallback data
export const getPageFallbacks = (page: keyof PageFallbacksConfig) => {
  return PAGE_FALLBACKS[page]
}

export const getAllPageNames = () => {
  return Object.keys(PAGE_FALLBACKS) as (keyof PageFallbacksConfig)[]
}

export default PAGE_FALLBACKS