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

export const PUT = createApiHandler(async (req: Request) => {
  try {
    const body = await req.json()
    
    // Validate required fields
    const {
      companyName,
      companyDescription,
      foundedYear,
      totalVehiclesSold,
      totalHappyCustomers,
      totalYearsExp,
      satisfactionRate,
      storyTitle,
      storyParagraph1,
      storyParagraph2,
      storyParagraph3,
      missionTitle,
      missionText,
      visionTitle,
      visionText
    } = body

    if (!companyName || !companyDescription) {
      return apiResponse({ error: 'Company name and description are required' }, { status: 400 })
    }

    // Check if company info already exists
    const existingCompanyInfo = await prisma.companyInfo.findFirst()

    let companyInfo
    if (existingCompanyInfo) {
      // Update existing company info
      companyInfo = await prisma.companyInfo.update({
        where: { id: existingCompanyInfo.id },
        data: {
          companyName,
          companyDescription,
          foundedYear: foundedYear ? parseInt(foundedYear) : existingCompanyInfo.foundedYear,
          totalVehiclesSold: totalVehiclesSold ? parseInt(totalVehiclesSold) : existingCompanyInfo.totalVehiclesSold,
          totalHappyCustomers: totalHappyCustomers ? parseInt(totalHappyCustomers) : existingCompanyInfo.totalHappyCustomers,
          totalYearsExp: totalYearsExp ? parseInt(totalYearsExp) : existingCompanyInfo.totalYearsExp,
          satisfactionRate: satisfactionRate ? parseInt(satisfactionRate) : existingCompanyInfo.satisfactionRate,
          storyTitle: storyTitle || existingCompanyInfo.storyTitle,
          storyParagraph1: storyParagraph1 || existingCompanyInfo.storyParagraph1,
          storyParagraph2: storyParagraph2 || existingCompanyInfo.storyParagraph2,
          storyParagraph3: storyParagraph3 || existingCompanyInfo.storyParagraph3,
          missionTitle: missionTitle || existingCompanyInfo.missionTitle,
          missionText: missionText || existingCompanyInfo.missionText,
          visionTitle: visionTitle || existingCompanyInfo.visionTitle,
          visionText: visionText || existingCompanyInfo.visionText,
          updatedAt: new Date()
        }
      })
    } else {
      // Create new company info
      companyInfo = await prisma.companyInfo.create({
        data: {
          companyName,
          companyDescription,
          foundedYear: foundedYear ? parseInt(foundedYear) : 2025,
          totalVehiclesSold: totalVehiclesSold ? parseInt(totalVehiclesSold) : 150,
          totalHappyCustomers: totalHappyCustomers ? parseInt(totalHappyCustomers) : 50,
          totalYearsExp: totalYearsExp ? parseInt(totalYearsExp) : 1,
          satisfactionRate: satisfactionRate ? parseInt(satisfactionRate) : 98,
          storyTitle: storyTitle || 'Our Story',
          storyParagraph1: storyParagraph1 || companyDescription,
          storyParagraph2: storyParagraph2 || 'Founded with a vision to transform the commercial vehicle industry.',
          storyParagraph3: storyParagraph3 || 'We continue to innovate and serve businesses across the region.',
          missionTitle: missionTitle || 'Our Mission',
          missionText: missionText || 'To provide exceptional commercial vehicle solutions.',
          visionTitle: visionTitle || 'Our Vision',
          visionText: visionText || 'To be the leading provider in sustainable transportation.'
        }
      })
    }

    return apiResponse(companyInfo)
  } catch (error) {
    console.error('Error updating company info:', error instanceof Error ? error.message : String(error))
    return apiResponse({ error: 'Failed to update company info' }, { status: 500 })
  }
})