// src/app/api/vehicles/route.ts
// Vehicle management API routes
import { createApiHandler, apiResponse, apiError } from '@/lib/api-handler'
import type { CreateVehicleData } from '@/types/vehicle'
import { vehicleQuerySchema, createVehicleSchema } from '@/types/validation'
import { CacheInvalidator } from '@/lib/cache'

// GET /api/vehicles - Get all vehicles with optional filtering
export const GET = createApiHandler(async (req, { session }) => {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const priceMin = searchParams.get('priceMin')
    const priceMax = searchParams.get('priceMax')
    const sortBy = searchParams.get('sortBy') || searchParams.get('sort') || 'name'
    const featured = searchParams.get('featured')
    // New truck specification filters
    const fuelType = searchParams.get('fuelType')
    const transmission = searchParams.get('transmission')
    const yearMin = searchParams.get('yearMin')
    const yearMax = searchParams.get('yearMax')
    const make = searchParams.get('make')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    // Calculate pagination offset
    const offset = (page - 1) * limit

    // Build where clause for filtering
    const where: Record<string, unknown> = {}
    
    // For non-admin users, only show active vehicles
    // For admin users, show all vehicles (they can manage inactive ones)
    const isAdmin = session?.user?.role === 'ADMIN' || session?.user?.role === 'MANAGER'
    
    if (!isAdmin) {
      where.active = true
      // Also filter by active categories for public users
      where.category = { active: true }
    }
    
    if (category) {
      const categories = category.split(',')
      const categoryFilter = { 
        slug: { in: categories }
      }
      
      // If already filtering by category active status, merge the conditions
      if (where.category) {
        where.category = {
          ...where.category,
          ...categoryFilter
        }
      } else {
        where.category = categoryFilter
      }
    }
    
    if (status) {
      const statuses = status.split(',')
      where.status = { in: statuses }
    }
    
    if (featured === 'true') {
      where.featured = true
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    if (priceMin || priceMax) {
      const priceFilter: { gte?: number; lte?: number } = {}
      if (priceMin) priceFilter.gte = parseFloat(priceMin)
      if (priceMax) priceFilter.lte = parseFloat(priceMax)
      where.price = priceFilter
    }

    // Truck specification filters
    if (fuelType) {
      const fuelTypes = fuelType.split(',')
      where.fuelType = { in: fuelTypes }
    }
    
    if (transmission) {
      const transmissions = transmission.split(',')
      where.transmission = { in: transmissions }
    }
    
    if (yearMin || yearMax) {
      const yearFilter: { gte?: number; lte?: number } = {}
      if (yearMin) yearFilter.gte = parseInt(yearMin)
      if (yearMax) yearFilter.lte = parseInt(yearMax)
      where.year = yearFilter
    }
    
    if (make) {
      const makes = make.split(',')
      where.make = { in: makes }
    }

    // Note: OrderBy is handled in VehicleQueries.getVehicles method

    // Use optimized query from database-queries module
    const { VehicleQueries } = await import('@/lib/database-queries')
    const result = await VehicleQueries.getVehicles({
      page,
      limit,
      category,
      status,
      search,
      priceMin: priceMin ? parseFloat(priceMin) : undefined,
      priceMax: priceMax ? parseFloat(priceMax) : undefined,
      fuelType,
      transmission,
      yearMin: yearMin ? parseInt(yearMin) : undefined,
      yearMax: yearMax ? parseInt(yearMax) : undefined,
      make,
      featured: featured === 'true',
      sortBy,
      isAdmin
    })

    const response = apiResponse(result)
    
    // Add cache-control headers for admin endpoints
    if (process.env.NODE_ENV === 'development') {
      response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
      response.headers.set('Pragma', 'no-cache')
      response.headers.set('Expires', '0')
    }
    
    return response
}, {
  rateLimit: 'api',
  validateQuery: vehicleQuerySchema
})


// POST /api/vehicles - Create a new vehicle  
export const POST = createApiHandler<CreateVehicleData>(async (req, { body }) => {
    if (!body) {
        return apiError('Request body is required', 400)
    }
    
    const {
      name,
      description,
      price,
      categoryId,
      year,
      make,
      fuelType,
      transmission,
      specs, // Updated to match frontend field name
      images,
      status = 'AVAILABLE',
      featured = false
    } = body
    
    // Extract features from body if provided (backward compatibility)
    const features = 'features' in body ? (body as CreateVehicleData & { features?: string[] }).features : undefined

    // Validate required fields
    if (!name || !price || !categoryId || !year || !make || !fuelType || !transmission) {
      return apiError('Missing required fields: name, price, categoryId, year, make, fuelType, transmission', 400)
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    // Direct Prisma call to avoid hanging with withRetry
    const { prisma } = await import('@/lib/prisma')
    const existingVehicle = await prisma.vehicle.findUnique({
      where: { slug }
    })

    if (existingVehicle) {
      return apiError('A vehicle with this name already exists', 400)
    }

    // Merge features into specs if they exist
    const mergedSpecs = specs ? { ...specs } : {}
    if (features && Array.isArray(features)) {
      mergedSpecs.features = features
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        name,
        slug,
        description,
        price: Number(price),
        categoryId,
        year: Number(year),
        make,
        fuelType,
        transmission,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        specs: mergedSpecs as any,
        images: images || [],
        status,
        featured: Boolean(featured)
      },
      include: {
        category: {
          select: { id: true, name: true }
        }
      }
    })

    // Invalidate related caches
    CacheInvalidator.onVehicleChange(vehicle.id)
    
    return apiResponse(vehicle, { status: 201 })
}, {
  requireAuth: true,
  requireAdmin: true,
  rateLimit: 'api',
  validateBody: createVehicleSchema
})