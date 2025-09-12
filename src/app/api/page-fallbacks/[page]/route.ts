import { NextRequest } from 'next/server'
import { createApiHandler, apiResponse } from '@/lib/api-handler'
import { prisma } from '@/lib/prisma'

// Page-specific fallback data
const PAGE_FALLBACKS = {
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

export const GET = createApiHandler(async (req: NextRequest, context) => {
  try {
    const { page } = context.params as { page: string }
    
    if (!page) {
      return apiResponse({ error: 'Page parameter is required' }, { status: 400 })
    }

    // Validate page name
    const validPages = Object.keys(PAGE_FALLBACKS)
    if (!validPages.includes(page)) {
      return apiResponse({ error: `Invalid page name. Valid pages: ${validPages.join(', ')}` }, { status: 400 })
    }

    // Try to get data from appropriate API first, then fallback to static data
    let pageData
    
    switch (page) {
      case 'homepage':
        try {
          const homepageContent = await prisma.homepageContent.findFirst()
          if (homepageContent) {
            pageData = {
              heroTitle: homepageContent.heroTitle,
              heroSubtitle: homepageContent.heroSubtitle,
              heroDescription: homepageContent.heroDescription,
              heroButtonPrimary: homepageContent.heroButtonPrimary,
              heroButtonSecondary: homepageContent.heroButtonSecondary,
              comingSoonImage: homepageContent.comingSoonImage,
              comingSoonImageMobile: homepageContent.comingSoonImageMobile,
              companyTagline: PAGE_FALLBACKS.homepage.companyTagline
            }
          }
        } catch (error) {
          console.error('Error fetching homepage content:', error)
        }
        break
        
      case 'about':
        try {
          const companyInfo = await prisma.companyInfo.findFirst()
          if (companyInfo) {
            pageData = {
              companyName: companyInfo.companyName,
              companyDescription: companyInfo.companyDescription,
              companyDescription2: companyInfo.companyDescription2,
              foundedYear: companyInfo.foundedYear,
              totalVehiclesSold: companyInfo.totalVehiclesSold,
              totalHappyCustomers: companyInfo.totalHappyCustomers,
              totalYearsExp: companyInfo.totalYearsExp,
              satisfactionRate: companyInfo.satisfactionRate,
              storyTitle: companyInfo.storyTitle,
              storyParagraph1: companyInfo.storyParagraph1,
              storyParagraph2: companyInfo.storyParagraph2,
              storyParagraph3: companyInfo.storyParagraph3,
              missionTitle: companyInfo.missionTitle,
              missionText: companyInfo.missionText,
              visionTitle: companyInfo.visionTitle,
              visionText: companyInfo.visionText
            }
          }
        } catch (error) {
          console.error('Error fetching company info:', error)
        }
        break
        
      case 'contact':
        try {
          const contactInfo = await prisma.contactInfo.findFirst()
          if (contactInfo) {
            pageData = {
              salesPhone: contactInfo.salesPhone,
              servicePhone: contactInfo.servicePhone,
              financePhone: contactInfo.financePhone,
              salesEmail: contactInfo.salesEmail,
              serviceEmail: contactInfo.serviceEmail,
              supportEmail: contactInfo.supportEmail,
              address: contactInfo.address,
              city: contactInfo.city,
              state: contactInfo.state,
              postcode: contactInfo.postcode,
              country: contactInfo.country,
              directions: contactInfo.directions,
              mondayToFriday: contactInfo.mondayToFriday,
              saturday: contactInfo.saturday,
              sunday: contactInfo.sunday,
              companyDescription: contactInfo.companyDescription,
              facebookUrl: contactInfo.facebookUrl,
              twitterUrl: contactInfo.twitterUrl,
              instagramUrl: contactInfo.instagramUrl,
              linkedinUrl: contactInfo.linkedinUrl,
              privacyPolicyUrl: contactInfo.privacyPolicyUrl,
              termsOfServiceUrl: contactInfo.termsOfServiceUrl
            }
          }
        } catch (error) {
          console.error('Error fetching contact info:', error)
        }
        break
        
      case 'technology':
        try {
          const technologyContent = await prisma.technologyContent.findFirst()
          if (technologyContent) {
            pageData = {
              heroTitle: technologyContent.heroTitle,
              heroSubtitle: technologyContent.heroSubtitle,
              heroBackgroundImage: technologyContent.heroBackgroundImage,
              heroBackgroundImageAlt: technologyContent.heroBackgroundImageAlt,
              section1Title: technologyContent.section1Title,
              section1Description: technologyContent.section1Description,
              section2Title: technologyContent.section2Title,
              section2Description: technologyContent.section2Description,
              section3Title: technologyContent.section3Title,
              section3Description: technologyContent.section3Description,
              section4Title: technologyContent.section4Title,
              section4Description: technologyContent.section4Description
            }
          }
        } catch (error) {
          console.error('Error fetching technology content:', error)
        }
        break
    }

    // Merge with fallback data
    const fallbackData = PAGE_FALLBACKS[page as keyof typeof PAGE_FALLBACKS]
    const finalData = { ...fallbackData, ...pageData }

    return apiResponse({
      pageName: page,
      fallbackData: finalData,
      enabled: true,
      lastUpdated: new Date().toISOString()
    })
    
  } catch (error) {
    console.error(`Error fetching page fallbacks:`, error)
    return apiResponse({ error: 'Failed to fetch page fallbacks' }, { status: 500 })
  }
})