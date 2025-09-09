import { createApiHandler, apiResponse } from '@/lib/api-handler'
import { prisma } from '@/lib/prisma'

// GET /api/filter-options - Get filter options by type
export const GET = createApiHandler(async (req) => {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type') // 'make' or 'fuelType'
  
  const where = type ? { type, active: true } : { active: true }
  
  const filterOptions = await prisma.filterOption.findMany({
    where,
    orderBy: [
      { order: 'asc' },
      { label: 'asc' }
    ]
  })
  
  // Group by type if no specific type requested
  if (!type) {
    const grouped = filterOptions.reduce((acc, option) => {
      if (!acc[option.type]) {
        acc[option.type] = []
      }
      acc[option.type].push({
        id: option.value,
        label: option.label
      })
      return acc
    }, {} as Record<string, Array<{id: string, label: string}>>)
    
    return apiResponse(grouped)
  }
  
  // Return flat array for specific type
  const options = filterOptions.map(option => ({
    id: option.value,
    label: option.label
  }))
  
  return apiResponse(options)
}, {
  rateLimit: 'api'
})