import { prisma } from '@/lib/prisma'
import { createApiHandler, apiResponse } from '@/lib/api-handler'
import { loadApiFallbackData } from '@/lib/api-data-loader'
import type { CompanyInfoFallback } from '@/types/data-config'

// In-memory cache for fallback data
let cachedFallbackCompanyInfo: CompanyInfoFallback | null = null

async function getFallbackCompanyInfo(): Promise<CompanyInfoFallback> {
  if (!cachedFallbackCompanyInfo) {
    cachedFallbackCompanyInfo = await loadApiFallbackData<CompanyInfoFallback>('company-info-fallback.json')
  }
  
  // Default fallback if JSON file fails to load
  return cachedFallbackCompanyInfo || {
    id: 'default',
    companyName: 'EVTL',
    companyDescription: 'EVTL Sdn. Bhd. is a next-generation mobility startup focusing on Electric Trucks (EV Trucks) and future smart transport solutions.',
    foundedYear: 2025,
    totalVehiclesSold: 150,
    totalHappyCustomers: 50,
    totalYearsExp: 1,
    satisfactionRate: 98,
    storyTitle: 'Who We Are',
    storyParagraph1: 'EVTL Sdn. Bhd. is a next-generation mobility startup focusing on Electric Trucks (EV Trucks) and future smart transport solutions.',
    storyParagraph2: 'Founded in 2025, EVTL collaborates with local and international partners (including Superlux and EVpower) to accelerate Malaysia\'s green logistics transformation.',
    storyParagraph3: 'We are committed to creating a sustainable future through innovative electric vehicle technology and smart mobility solutions that serve businesses and communities across Malaysia.',
    missionTitle: 'Our Mission',
    missionText: 'To accelerate Malaysia\'s green logistics transformation through innovative electric truck solutions and smart transport technologies, partnering with local and international stakeholders.',
    visionTitle: 'Our Vision',
    visionText: 'Zero Carbon, Smart Mobility for All'
  }
}

export const GET = createApiHandler(async () => {
  try {
    let companyInfo = await prisma.companyInfo.findFirst()
    
    if (!companyInfo) {
      // Return fallback data if not found in database
      const fallbackData = await getFallbackCompanyInfo()
      companyInfo = {
        ...fallbackData,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }

    return apiResponse(companyInfo)
  } catch (error) {
    console.error('Error fetching company info, using fallback:', error instanceof Error ? error.message : String(error))
    // Return fallback data on any database error
    const fallbackData = await getFallbackCompanyInfo()
    const companyInfo = {
      ...fallbackData,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    return apiResponse(companyInfo)
  }
})