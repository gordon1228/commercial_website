import { prisma } from '@/lib/prisma'
import { createApiHandler, apiResponse } from '@/lib/api-handler'
import { loadApiFallbackData } from '@/lib/api-data-loader'
import type { CompanyValueFallback } from '@/types/data-config'

// In-memory cache for fallback data
let cachedFallbackValues: CompanyValueFallback[] | null = null

async function getFallbackValues(): Promise<CompanyValueFallback[]> {
  if (!cachedFallbackValues) {
    cachedFallbackValues = await loadApiFallbackData<CompanyValueFallback[]>('company-values-fallback.json')
  }
  
  // Default fallback if JSON file fails to load
  return cachedFallbackValues || [
    { id: '1', title: 'Sustainability', description: 'Leading Malaysia\'s transition to zero-carbon logistics through innovative electric truck technology and smart mobility solutions.', iconName: 'Shield', order: 1, active: true },
    { id: '2', title: 'Innovation', description: 'Partnering with local and international technology leaders to deliver next-generation electric vehicle solutions for the future.', iconName: 'Handshake', order: 2, active: true },
    { id: '3', title: 'Smart Solutions', description: 'Integrating advanced technology and data-driven insights to optimize logistics and transport efficiency for our partners.', iconName: 'Clock', order: 3, active: true },
    { id: '4', title: 'Green Future', description: 'Committed to creating a sustainable tomorrow through clean energy transport solutions that benefit businesses and communities.', iconName: 'Heart', order: 4, active: true }
  ]
}

export const GET = createApiHandler(async () => {
  try {
    let values = await prisma.companyValue.findMany({
      where: { active: true },
      orderBy: { order: 'asc' }
    })

    if (!values || values.length === 0) {
      const fallbackData = await getFallbackValues()
      values = fallbackData.map(item => ({
        ...item,
        createdAt: new Date(),
        updatedAt: new Date()
      }))
    }

    return apiResponse(values)
  } catch (error) {
    console.error('Error fetching company values, using fallback:', error instanceof Error ? error.message : String(error))
    const fallbackData = await getFallbackValues()
    const values = fallbackData.map(item => ({
      ...item,
      createdAt: new Date(),
      updatedAt: new Date()
    }))
    return apiResponse(values)
  }
})