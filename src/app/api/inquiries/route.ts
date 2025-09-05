import { createApiHandler, apiResponse } from '@/lib/api-handler'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/inquiries - Get all inquiries with optional filtering
export const GET = createApiHandler(
  async (req, { session }) => {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const vehicleId = searchParams.get('vehicleId')
    const userId = searchParams.get('userId')
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
    
    if (userId) {
      where.userId = userId
    }
    
    // For USER role, automatically filter to only their inquiries
    if (session?.user?.role === 'USER') {
      where.userId = session.user.id
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
          },
          user: {
            select: { id: true, email: true, role: true }
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
    rateLimit: 'api'
    // Remove requireAdmin to allow USER role access (filtering handled in code)
  }
)

// POST /api/inquiries - Create a new inquiry  
export const POST = createApiHandler(
  async (req, { session }) => {
    // Parse body manually since we don't have validateBody
    let body
    try {
      body = await req.json()
      console.log('Inquiry API - Received body:', body)
    } catch (error) {
      console.error('Inquiry API - Failed to parse JSON body:', error)
      return apiResponse({ error: 'Invalid JSON in request body' }, { status: 400 })
    }
    
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

    // Validate required fields
    if (!customerName || !email || !message) {
      return apiResponse({ error: 'Customer name, email, and message are required' }, { status: 400 })
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return apiResponse({ error: 'Invalid email format' }, { status: 400 })
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

    // Log inquiry creation
    if (session?.user?.id) {
      console.log(`Inquiry API - Public inquiry created (staff user ${session.user.email} was logged in, but inquiry remains unassigned)`)
    } else {
      console.log('Inquiry API - Public customer inquiry created (no staff logged in)')
    }

    const inquiry = await prisma.inquiry.create({
      data: {
        customerName,
        email,
        phone: phone || null,
        message,
        vehicleId: vehicleId || null,
        userId: null, // All inquiries start unassigned (can be assigned later by ADMIN/MANAGER)
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
    requireAuth: false, // Allow both authenticated and unauthenticated users
    rateLimit: 'api'
  }
)