import { createApiHandler, apiResponse, apiError } from '@/lib/api-handler'
import { prisma } from '@/lib/prisma'

// GET /api/categories - Get all categories
export const GET = createApiHandler(async (req, { session }) => {
  // For non-admin users, only show active categories
  const isAdmin = session?.user?.role === 'ADMIN' || session?.user?.role === 'MANAGER'
  const where = isAdmin ? {} : { active: true }

  const categories = await prisma.category.findMany({
    where,
    include: {
      _count: {
        select: { 
          vehicles: isAdmin ? true : { where: { active: true } }
        }
      }
    },
    orderBy: { name: 'asc' }
  })

  // For admin users, add active vehicle count for each category
  const categoriesWithActiveCount = isAdmin ? await Promise.all(
    categories.map(async (category) => {
      const activeVehicleCount = await prisma.vehicle.count({
        where: {
          categoryId: category.id,
          active: true
        }
      })
      return {
        ...category,
        activeVehicleCount
      }
    })
  ) : categories

  return apiResponse(categoriesWithActiveCount)
}, {
  rateLimit: 'api'
})

// POST /api/categories - Create a new category
export const POST = createApiHandler(async (req, { body }) => {
  const { name, description } = body as {
    name: string;
    description?: string;
  }

  if (!name) {
    return apiError('Category name is required', 400)
  }

  // Generate slug from name
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

  // Check if slug already exists
  const existingCategory = await prisma.category.findUnique({
    where: { slug }
  })

  if (existingCategory) {
    return apiError('A category with this name already exists', 409)
  }

  const category = await prisma.category.create({
    data: {
      name,
      slug,
      description,
      active: true // New categories are active by default
    }
  })

  return apiResponse(category, { status: 201 })
}, {
  requireAuth: true,
  requireAdmin: true,
  rateLimit: 'api'
})