import { prisma } from '@/lib/prisma'
import { createApiHandler, apiResponse } from '@/lib/api-handler'
import { loadApiFallbackData } from '@/lib/api-data-loader'
import type { CertificationFallback } from '@/types/data-config'

// In-memory cache for fallback data
let cachedFallbackCertifications: CertificationFallback[] | null = null

async function getFallbackCertifications(): Promise<CertificationFallback[]> {
  if (!cachedFallbackCertifications) {
    cachedFallbackCertifications = await loadApiFallbackData<CertificationFallback[]>('certifications-fallback.json')
  }
  
  // Default fallback if JSON file fails to load
  return cachedFallbackCertifications || [
    { id: '1', name: 'Malaysia Green Technology Corporation (GreenTech) Certified', order: 1, active: true },
    { id: '2', name: 'Electric Vehicle Technology License', order: 2, active: true },
    { id: '3', name: 'ISO 14001:2015 Environmental Management', order: 3, active: true },
    { id: '4', name: 'Partnership with Superlux Technology', order: 4, active: true },
    { id: '5', name: 'EVpower Strategic Alliance', order: 5, active: true },
    { id: '6', name: 'Malaysia Digital Economy Corporation (MDEC) Registered', order: 6, active: true }
  ]
}

export const GET = createApiHandler(async () => {
  try {
    let certifications = await prisma.certification.findMany({
      where: { active: true },
      orderBy: { order: 'asc' }
    })

    if (!certifications || certifications.length === 0) {
      const fallbackData = await getFallbackCertifications()
      certifications = fallbackData.map(item => ({
        ...item,
        createdAt: new Date(),
        updatedAt: new Date()
      }))
    }

    return apiResponse(certifications)
  } catch (error) {
    console.error('Error fetching certifications, using fallback:', error instanceof Error ? error.message : String(error))
    const fallbackData = await getFallbackCertifications()
    const certifications = fallbackData.map(item => ({
      ...item,
      createdAt: new Date(),
      updatedAt: new Date()
    }))
    return apiResponse(certifications)
  }
})