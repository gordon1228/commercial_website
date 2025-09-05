import { prisma } from '@/lib/prisma'
import { createApiHandler, apiResponse } from '@/lib/api-handler'

const fallbackCompanyInfo = {
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
  visionText: 'Zero Carbon, Smart Mobility for All',
  createdAt: new Date(),
  updatedAt: new Date()
}

export const GET = createApiHandler(async () => {
  try {
    let companyInfo = await prisma.companyInfo.findFirst()
    
    if (!companyInfo) {
      // Return fallback data if not found in database
      companyInfo = fallbackCompanyInfo
    }

    return apiResponse(companyInfo)
  } catch (error) {
    console.error('Error fetching company info, using fallback:', error instanceof Error ? error.message : String(error))
    // Return fallback data on any database error
    return apiResponse(fallbackCompanyInfo)
  }
})