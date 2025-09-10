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
  console.log('Creating filter option with data:', body)
  
  const { type, value, label, order } = body as {
    type: string
    value: string
    label: string
    order?: number
  }
  
  if (!type || !value || !label) {
    console.error('Missing required fields:', { type, value, label })
    return apiError('Type, value, and label are required', 400)
  }
  
  if (!['make', 'fuelType'].includes(type)) {
    console.error('Invalid type:', type)
    return apiError('Type must be either "make" or "fuelType"', 400)
  }
  
  try {
    // Check if combination already exists
    const existing = await prisma.filterOption.findFirst({
      where: {
        type: type,
        value: value.trim()
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
    
    console.log('Creating filter option:', {
      type,
      value: value.trim(),
      label: label.trim(),
      order: finalOrder
    })
    
    const filterOption = await prisma.filterOption.create({
      data: {
        type,
        value: value.trim(),
        label: label.trim(),
        order: finalOrder,
        active: true
      }
    })
    
    console.log('Filter option created successfully:', filterOption.id)
    return apiResponse(filterOption, { status: 201 })
  } catch (error) {
    console.error('Database error creating filter option:', error)
    return apiError('Failed to create filter option - database error', 500)
  }
}, {
  requireAuth: true,
  requireAdmin: true,
  rateLimit: 'api'
})