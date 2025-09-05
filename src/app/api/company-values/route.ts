import { prisma } from '@/lib/prisma'
import { createApiHandler, apiResponse, apiError } from '@/lib/api-handler'

const fallbackValues = [
  { id: '1', title: 'Sustainability', description: 'Leading Malaysia\'s transition to zero-carbon logistics through innovative electric truck technology and smart mobility solutions.', iconName: 'Shield', order: 1, active: true, createdAt: new Date(), updatedAt: new Date() },
  { id: '2', title: 'Innovation', description: 'Partnering with local and international technology leaders to deliver next-generation electric vehicle solutions for the future.', iconName: 'Handshake', order: 2, active: true, createdAt: new Date(), updatedAt: new Date() },
  { id: '3', title: 'Smart Solutions', description: 'Integrating advanced technology and data-driven insights to optimize logistics and transport efficiency for our partners.', iconName: 'Clock', order: 3, active: true, createdAt: new Date(), updatedAt: new Date() },
  { id: '4', title: 'Green Future', description: 'Committed to creating a sustainable tomorrow through clean energy transport solutions that benefit businesses and communities.', iconName: 'Heart', order: 4, active: true, createdAt: new Date(), updatedAt: new Date() }
]

export const GET = createApiHandler(async (req) => {
  try {
    let values = await prisma.companyValue.findMany({
      where: { active: true },
      orderBy: { order: 'asc' }
    })

    if (!values || values.length === 0) {
      values = fallbackValues
    }

    return apiResponse(values)
  } catch (error) {
    console.error('Error fetching company values, using fallback:', error.message)
    return apiResponse(fallbackValues)
  }
})