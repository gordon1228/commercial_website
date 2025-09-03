import { createApiHandler, apiResponse, apiError } from '@/lib/api-handler'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// PATCH /api/categories/[id]/toggle-active - Toggle active status for a category
export const PATCH = createApiHandler(
  async (req, { params }) => {
    const { id } = params as { id: string }

    if (!id) {
      return apiError('Category ID is required', 400)
    }

    // Get current category with active vehicle count
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { 
            vehicles: true,
          }
        }
      }
    })

    if (!category) {
      return apiError('Category not found', 404)
    }

    // If trying to deactivate, check for active vehicles
    if (category.active) {
      const activeVehicleCount = await prisma.vehicle.count({
        where: {
          categoryId: id,
          active: true
        }
      })

      if (activeVehicleCount > 0) {
        return apiError(
          `Cannot deactivate category "${category.name}" because it has ${activeVehicleCount} active vehicle(s). Please deactivate all vehicles in this category first.`,
          400
        )
      }
    }

    // Toggle active status
    const updatedCategory = await prisma.category.update({
      where: { id },
      data: {
        active: !category.active
      },
      include: {
        _count: {
          select: { vehicles: true }
        }
      }
    })

    return apiResponse({
      message: `Category ${updatedCategory.active ? 'activated' : 'deactivated'} successfully`,
      category: updatedCategory
    })
  },
  {
    requireAuth: true,
    requireAdmin: true,
    rateLimit: 'api'
  }
)