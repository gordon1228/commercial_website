import { createApiHandler, apiResponse } from '@/lib/api-handler'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const GET = createApiHandler(
  async () => {
    // Get counts for all entities
    const [vehiclesCount, usersCount, inquiriesCount, pendingInquiriesCount] = await Promise.all([
      prisma.vehicle.count(),
      prisma.user.count({ where: { role: { not: 'ADMIN' } } }), // Exclude admin users
      prisma.inquiry.count(),
      prisma.inquiry.count({ where: { status: 'NEW' } })
    ])

    const response = apiResponse({
      vehiclesCount,
      usersCount,
      inquiriesCount,
      pendingInquiriesCount
    })
    
    // Add cache-control headers to prevent caching
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    
    return response
  },
  {
    requireAuth: true,
    requireAdmin: true,
    rateLimit: 'api'
  }
)