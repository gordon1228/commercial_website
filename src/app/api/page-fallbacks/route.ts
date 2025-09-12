import { prisma } from '@/lib/prisma'
import { createApiHandler, apiResponse } from '@/lib/api-handler'

// Define fallback data structure for each page (updated with current database data)
const DEFAULT_PAGE_FALLBACKS = {
  homepage: {
    heroTitle: 'Premium Commercial',
    heroSubtitle: 'Vehicles',
    heroDescription: 'Discover EVTL fleet solutions built for businesses that demand excellence, reliability, and uncompromising quality.',
    heroButtonPrimary: 'Explore Fleet',
    heroButtonSecondary: 'Get Quote',
    comingSoonImage: '/uploads/729abc2e-aafd-44c6-83cc-23accf8033cc.PNG',
    comingSoonImageMobile: '/uploads/152c3c75-40b7-4a8c-91e8-03a465edf5d7.png',
    companyTagline: 'Mining 24 Hours a Day with Autonomous Trucks Coming Soon'
  },
  about: {
    companyName: 'EVTL',
    companyDescription: 'EVTL 是一家新能源初创企业，聚焦 电动罗里（EV Trucks） 及未来智慧交通解决方案。我们与本地及国际合作伙伴共同推动马来西亚物流行业的绿色转型。',
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

export const GET = createApiHandler(async (req: Request) => {
  try {
    const url = new URL(req.url)
    const pageName = url.searchParams.get('page')

    if (pageName) {
      // Get fallback data for specific page
      let pageFallback = await prisma.pageFallback.findUnique({
        where: { pageName }
      })

      if (!pageFallback) {
        // Create default fallback if not found
        const defaultData = DEFAULT_PAGE_FALLBACKS[pageName as keyof typeof DEFAULT_PAGE_FALLBACKS]
        if (defaultData) {
          pageFallback = await prisma.pageFallback.create({
            data: {
              pageName,
              fallbackData: defaultData,
              enabled: true
            }
          })
        } else {
          return apiResponse({ error: 'Invalid page name' }, { status: 400 })
        }
      }

      return apiResponse(pageFallback)
    } else {
      // Get all page fallbacks
      const allFallbacks = await prisma.pageFallback.findMany({
        orderBy: { pageName: 'asc' }
      })

      return apiResponse(allFallbacks)
    }
  } catch (error) {
    console.error('Error fetching page fallbacks:', error instanceof Error ? error.message : String(error))
    return apiResponse({ error: 'Failed to fetch page fallbacks' }, { status: 500 })
  }
})

export const PUT = createApiHandler(async (req: Request) => {
  try {
    const body = await req.json()
    const { pageName, fallbackData, enabled } = body

    if (!pageName || !fallbackData) {
      return apiResponse({ error: 'Page name and fallback data are required' }, { status: 400 })
    }

    // Validate page name
    const validPages = Object.keys(DEFAULT_PAGE_FALLBACKS)
    if (!validPages.includes(pageName)) {
      return apiResponse({ error: 'Invalid page name' }, { status: 400 })
    }

    // Check if page fallback exists
    const existingFallback = await prisma.pageFallback.findUnique({
      where: { pageName }
    })

    let pageFallback
    if (existingFallback) {
      // Update existing fallback
      pageFallback = await prisma.pageFallback.update({
        where: { pageName },
        data: {
          fallbackData,
          enabled: enabled !== undefined ? enabled : existingFallback.enabled,
          updatedAt: new Date()
        }
      })
    } else {
      // Create new fallback
      pageFallback = await prisma.pageFallback.create({
        data: {
          pageName,
          fallbackData,
          enabled: enabled !== undefined ? enabled : true
        }
      })
    }

    return apiResponse(pageFallback)
  } catch (error) {
    console.error('Error updating page fallback:', error instanceof Error ? error.message : String(error))
    return apiResponse({ error: 'Failed to update page fallback' }, { status: 500 })
  }
})

export const POST = createApiHandler(async (req: Request) => {
  try {
    const { action } = await req.json()

    if (action === 'initialize') {
      // Initialize all page fallbacks with default data
      const results = []
      
      for (const [pageName, fallbackData] of Object.entries(DEFAULT_PAGE_FALLBACKS)) {
        // Check if already exists
        const existing = await prisma.pageFallback.findUnique({
          where: { pageName }
        })

        if (!existing) {
          const created = await prisma.pageFallback.create({
            data: {
              pageName,
              fallbackData,
              enabled: true
            }
          })
          results.push(created)
        }
      }

      return apiResponse({ 
        message: `Initialized ${results.length} page fallbacks`,
        created: results
      })
    }

    return apiResponse({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error initializing page fallbacks:', error instanceof Error ? error.message : String(error))
    return apiResponse({ error: 'Failed to initialize page fallbacks' }, { status: 500 })
  }
})