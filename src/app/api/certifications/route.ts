import { prisma } from '@/lib/prisma'
import { createApiHandler, apiResponse, apiError } from '@/lib/api-handler'

const fallbackCertifications = [
  { id: '1', name: 'Malaysia Green Technology Corporation (GreenTech) Certified', order: 1, active: true, createdAt: new Date(), updatedAt: new Date() },
  { id: '2', name: 'Electric Vehicle Technology License', order: 2, active: true, createdAt: new Date(), updatedAt: new Date() },
  { id: '3', name: 'ISO 14001:2015 Environmental Management', order: 3, active: true, createdAt: new Date(), updatedAt: new Date() },
  { id: '4', name: 'Partnership with Superlux Technology', order: 4, active: true, createdAt: new Date(), updatedAt: new Date() },
  { id: '5', name: 'EVpower Strategic Alliance', order: 5, active: true, createdAt: new Date(), updatedAt: new Date() },
  { id: '6', name: 'Malaysia Digital Economy Corporation (MDEC) Registered', order: 6, active: true, createdAt: new Date(), updatedAt: new Date() }
]

export const GET = createApiHandler(async (req) => {
  try {
    let certifications = await prisma.certification.findMany({
      where: { active: true },
      orderBy: { order: 'asc' }
    })

    if (!certifications || certifications.length === 0) {
      certifications = fallbackCertifications
    }

    return apiResponse(certifications)
  } catch (error) {
    console.error('Error fetching certifications, using fallback:', error.message)
    return apiResponse(fallbackCertifications)
  }
})