import { createApiHandler, apiResponse, apiError } from '@/lib/api-handler'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// PATCH /api/vehicles/[id]/toggle-active - Toggle active status for a vehicle
export const PATCH = createApiHandler(
  async (req, { params }) => {
    const { id } = params as { id: string }

    if (!id) {
      return apiError('Vehicle ID is required', 400)
    }

    // Get current vehicle
    const vehicle = await prisma.vehicle.findUnique({
      where: { id }
    })

    if (!vehicle) {
      return apiError('Vehicle not found', 404)
    }

    // Toggle active status
    const updatedVehicle = await prisma.vehicle.update({
      where: { id },
      data: {
        active: !vehicle.active
      },
      include: {
        category: {
          select: { id: true, name: true }
        }
      }
    })

    return apiResponse({
      message: `Vehicle ${updatedVehicle.active ? 'activated' : 'deactivated'} successfully`,
      vehicle: updatedVehicle
    })
  },
  {
    requireAuth: true,
    requireAdmin: true,
    rateLimit: 'api'
  }
)