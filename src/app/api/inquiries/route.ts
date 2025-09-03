import { createApiHandler, apiResponse } from '@/lib/api-handler'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/inquiries - Get all inquiries with optional filtering
export const GET = createApiHandler(
  async (req) => {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const vehicleId = searchParams.get('vehicleId')
    const sort = searchParams.get('sort')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const skip = (page - 1) * limit

    // Build where clause for filtering
    const where: Record<string, unknown> = {}
    
    if (status) {
      const statuses = status.split(',')
      where.status = { in: statuses }
    }
    
    if (type) {
      const types = type.split(',')
      where.inquiryType = { in: types }
    }
    
    if (vehicleId) {
      where.vehicleId = vehicleId
    }

    // Build orderBy clause
    let orderBy: Record<string, string> = { createdAt: 'desc' }
    if (sort === 'recent') {
      orderBy = { createdAt: 'desc' }
    } else if (sort === 'oldest') {
      orderBy = { createdAt: 'asc' }
    } else if (sort === 'status') {
      orderBy = { status: 'asc' }
    }

    const [inquiries, totalCount] = await Promise.all([
      prisma.inquiry.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          vehicle: {
            select: { id: true, name: true, slug: true }
          }
        }
      }),
      prisma.inquiry.count({ where })
    ])

    const response = apiResponse({
      inquiries,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    })
    
    // Add cache-control headers for admin endpoints
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    
    return response
  },
  {
    requireAuth: true,
    requireAdmin: true,
    rateLimit: 'api'
  }
)

// POST /api/inquiries - Create a new inquiry  
export const POST = createApiHandler(
  async (req, { body }) => {
    const {
      customerName,
      email,
      phone,
      message,
      vehicleId
    } = body as {
      customerName: string;
      email: string;
      phone?: string;
      message: string;
      vehicleId?: string;
    }

    // If vehicleId is provided, verify it exists
    if (vehicleId) {
      const vehicle = await prisma.vehicle.findUnique({
        where: { id: vehicleId }
      })

      if (!vehicle) {
        return apiResponse({ error: 'Vehicle not found' }, { status: 404 })
      }
    }

    const inquiry = await prisma.inquiry.create({
      data: {
        customerName,
        email,
        phone: phone || null,
        message,
        vehicleId: vehicleId || null,
        status: 'NEW'
      },
      include: {
        vehicle: {
          select: { id: true, name: true, slug: true }
        }
      }
    })

    return apiResponse(inquiry, { status: 201 })
  },
  {
    rateLimit: 'api'
  }
)