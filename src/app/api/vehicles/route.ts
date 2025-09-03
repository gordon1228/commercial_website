// src/app/api/vehicles/route.ts
// Vehicle management API routes
import { PrismaClient } from '@prisma/client'
import { createApiHandler, apiResponse, apiError } from '@/lib/api-handler'

const prisma = new PrismaClient()

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
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const skip = (page - 1) * limit

    // Build where clause for filtering
    const where: Record<string, unknown> = {}
    
    // For non-admin users, only show active vehicles
    // For admin users, show all vehicles (they can manage inactive ones)
    const isAdmin = session?.user?.role === 'ADMIN'
    
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

    // Build orderBy clause
    let orderBy: Record<string, 'asc' | 'desc'> = { name: 'asc' }
    switch (sortBy) {
      case 'price-low':
        orderBy = { price: 'asc' }
        break
      case 'price-high':
        orderBy = { price: 'desc' }
        break
      case 'newest':
      case 'recent':
        orderBy = { createdAt: 'desc' }
        break
      case 'oldest':
        orderBy = { createdAt: 'asc' }
        break
    }

    const [vehicles, totalCount] = await Promise.all([
      prisma.vehicle.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          category: {
            select: { id: true, name: true }
          },
          _count: {
            select: { inquiries: true }
          }
        }
      }),
      prisma.vehicle.count({ where })
    ])

    const response = apiResponse({
      vehicles,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    })
    
    // Add cache-control headers for admin endpoints
    if (process.env.NODE_ENV === 'development') {
      response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
      response.headers.set('Pragma', 'no-cache')
      response.headers.set('Expires', '0')
    }
    
    return response
}, {
  rateLimit: 'api'
})

interface VehicleCreateBody {
  name: string;
  description: string;
  price: number;
  year?: number;
  make?: string;
  model?: string;
  mileage?: number;
  fuelType?: string;
  transmission?: string;
  categoryId: string;
  specifications?: Record<string, unknown>;
  images?: string[];
  features?: string[];
  status?: 'AVAILABLE' | 'SOLD' | 'RESERVED';
  featured?: boolean;
}

// POST /api/vehicles - Create a new vehicle  
export const POST = createApiHandler(async (req, { body }) => {
    const {
      name,
      description,
      price,
      year,
      make,
      model,
      mileage,
      fuelType,
      transmission,
      categoryId,
      specifications, // This comes as specifications from frontend
      images,
      features,
      status = 'AVAILABLE',
      featured = false
    } = body as VehicleCreateBody

    // Validate required fields
    if (!name || !price || !categoryId) {
      return apiError('Missing required fields: name, price, categoryId', 400)
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    // Check if slug already exists
    const existingVehicle = await prisma.vehicle.findUnique({
      where: { slug }
    })

    if (existingVehicle) {
      return apiError('A vehicle with this name already exists', 409)
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        name,
        slug,
        description,
        price,
        year,
        make,
        model,
        mileage,
        fuelType,
        transmission,
        categoryId,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        specs: specifications as any, // Map specifications to specs field
        images: images || [],
        features: features || [],
        status,
        featured
      },
      include: {
        category: {
          select: { id: true, name: true }
        }
      }
    })

    return apiResponse(vehicle, { status: 201 })
}, {
  requireAuth: true,
  requireAdmin: true,
  rateLimit: 'api'
})