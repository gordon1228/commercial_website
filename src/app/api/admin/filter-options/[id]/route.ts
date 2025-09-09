import { NextRequest } from 'next/server'
import { createApiHandler, apiResponse, apiError } from '@/lib/api-handler'
import { prisma } from '@/lib/prisma'

interface UpdateFilterOptionBody {
  type?: string
  value?: string
  label?: string
  order?: number
  active?: boolean
}

// PUT /api/admin/filter-options/[id] - Update filter option
export const PUT = createApiHandler(async (req: NextRequest, context: { 
  params?: Record<string, string | string[]>
  body?: UpdateFilterOptionBody 
}) => {
  const { body, params } = context
  if (!params?.id) {
    return apiError('Missing filter option ID', 400)
  }
  
  const { type, value, label, order, active } = body || {}
  
  const filterOption = await prisma.filterOption.findUnique({
    where: { id: params.id as string }
  })
  
  if (!filterOption) {
    return apiError('Filter option not found', 404)
  }
  
  // Validate type if provided
  if (type && !['make', 'fuelType'].includes(type)) {
    return apiError('Type must be either "make" or "fuelType"', 400)
  }
  
  // Check for duplicate type-value combination if changing
  const finalType = type || filterOption.type
  const finalValue = value || filterOption.value
  
  if (type !== filterOption.type || value !== filterOption.value) {
    const existing = await prisma.filterOption.findFirst({
      where: {
        type: finalType,
        value: finalValue,
        id: { not: params.id as string }
      }
    })
    
    if (existing) {
      return apiError(`Filter option "${finalValue}" already exists for type "${finalType}"`, 409)
    }
  }
  
  const updatedFilterOption = await prisma.filterOption.update({
    where: { id: params.id as string },
    data: {
      ...(type && { type }),
      ...(value && { value: value.trim() }),
      ...(label && { label: label.trim() }),
      ...(order !== undefined && { order }),
      ...(active !== undefined && { active })
    }
  })
  
  return apiResponse(updatedFilterOption)
}, {
  requireAuth: true,
  requireAdmin: true,
  rateLimit: 'api'
})

// DELETE /api/admin/filter-options/[id] - Delete filter option
export const DELETE = createApiHandler(async (req: NextRequest, context: { 
  params?: Record<string, string | string[]> 
}) => {
  const { params } = context
  if (!params?.id) {
    return apiError('Missing filter option ID', 400)
  }
  const filterOption = await prisma.filterOption.findUnique({
    where: { id: params.id as string }
  })
  
  if (!filterOption) {
    return apiError('Filter option not found', 404)
  }
  
  await prisma.filterOption.delete({
    where: { id: params.id as string }
  })
  
  return apiResponse({ message: 'Filter option deleted successfully' })
}, {
  requireAuth: true,
  requireAdmin: true,
  rateLimit: 'api'
})

// PATCH /api/admin/filter-options/[id]/toggle - Toggle active status
export const PATCH = createApiHandler(async (req: NextRequest, context: { 
  params?: Record<string, string | string[]> 
}) => {
  const { params } = context
  if (!params?.id) {
    return apiError('Missing filter option ID', 400)
  }
  const filterOption = await prisma.filterOption.findUnique({
    where: { id: params.id as string }
  })
  
  if (!filterOption) {
    return apiError('Filter option not found', 404)
  }
  
  const updatedFilterOption = await prisma.filterOption.update({
    where: { id: params.id as string },
    data: { active: !filterOption.active }
  })
  
  const action = updatedFilterOption.active ? 'activated' : 'deactivated'
  return apiResponse({
    filterOption: updatedFilterOption,
    message: `Filter option "${filterOption.label}" ${action} successfully`
  })
}, {
  requireAuth: true,
  requireAdmin: true,
  rateLimit: 'api'
})