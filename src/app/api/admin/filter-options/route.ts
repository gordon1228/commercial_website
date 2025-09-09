import { createApiHandler, apiResponse, apiError } from '@/lib/api-handler'
import { prisma } from '@/lib/prisma'

// GET /api/admin/filter-options - Get all filter options (admin)
export const GET = createApiHandler(async (req) => {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type') // optional filter by type
  
  const where = type ? { type } : {}
  
  const filterOptions = await prisma.filterOption.findMany({
    where,
    orderBy: [
      { type: 'asc' },
      { order: 'asc' },
      { label: 'asc' }
    ]
  })
  
  return apiResponse(filterOptions)
}, {
  requireAuth: true,
  requireAdmin: true,
  rateLimit: 'api'
})

// POST /api/admin/filter-options - Create new filter option
export const POST = createApiHandler(async (req, { body }) => {
  const { type, value, label, order } = body as {
    type: string
    value: string
    label: string
    order?: number
  }
  
  if (!type || !value || !label) {
    return apiError('Type, value, and label are required', 400)
  }
  
  if (!['make', 'fuelType'].includes(type)) {
    return apiError('Type must be either "make" or "fuelType"', 400)
  }
  
  // Check if combination already exists
  const existing = await prisma.filterOption.findUnique({
    where: {
      type_value: { type, value }
    }
  })
  
  if (existing) {
    return apiError(`Filter option "${label}" already exists for type "${type}"`, 409)
  }
  
  // Get next order if not provided
  let finalOrder = order
  if (!finalOrder) {
    const lastOption = await prisma.filterOption.findFirst({
      where: { type },
      orderBy: { order: 'desc' }
    })
    finalOrder = (lastOption?.order || 0) + 1
  }
  
  const filterOption = await prisma.filterOption.create({
    data: {
      type,
      value: value.trim(),
      label: label.trim(),
      order: finalOrder,
      active: true
    }
  })
  
  return apiResponse(filterOption, { status: 201 })
}, {
  requireAuth: true,
  requireAdmin: true,
  rateLimit: 'api'
})