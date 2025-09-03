import { createApiHandler, apiResponse } from '@/lib/api-handler'
import { PrismaClient } from '@prisma/client'

export const dynamic = 'force-dynamic'

const prisma = new PrismaClient()

export const GET = createApiHandler(
  async () => {
    // Calculate public-facing stats
    const [totalVehicles, totalInquiries, resolvedInquiriesCount] = await Promise.all([
      prisma.vehicle.count({ where: { status: { in: ['AVAILABLE', 'RESERVED'] } } }),
      prisma.inquiry.count(),
      prisma.inquiry.count({ where: { status: 'RESOLVED' } })
    ])

    // Calculate satisfaction rate based on resolved inquiries
    const satisfactionRate = totalInquiries > 0 ? Math.round((resolvedInquiriesCount / totalInquiries) * 100) : 95

    // These values could be stored in settings or calculated differently
    const stats = {
      vehiclesSold: totalVehicles, // Current available vehicles
      happyClients: Math.max(totalInquiries, 25), // Use inquiries as client metric with minimum
      yearsExperience: 10, // This could come from settings
      satisfactionRate: Math.min(satisfactionRate, 98) // Cap at 98%
    }

    return apiResponse(stats)
  },
  {
    rateLimit: 'api'
  }
)