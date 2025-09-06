// User management API routes
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { createApiHandler, apiResponse, apiError } from '@/lib/api-handler'
import { validationSchemas } from '@/lib/security'

// GET /api/users - Get all users (admin only)
export const GET = createApiHandler(
  async () => {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { inquiries: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return apiResponse(users)
  },
  {
    requireAuth: true,
    requireAdmin: true, // This allows both ADMIN and MANAGER per api-handler.ts line 66
    rateLimit: 'api'
  }
)

// POST /api/users - Create a new user (admin only)
export const POST = createApiHandler(
  async (req, { body }) => {
    const { email, password, role = 'USER' } = body as { email: string; password: string; role?: 'ADMIN' | 'MANAGER' | 'USER' }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return apiError('User with this email already exists', 409)
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role
      },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return apiResponse(user, { status: 201 })
  },
  {
    requireAuth: true,
    requireAdmin: true,
    rateLimit: 'api',
    validateBody: validationSchemas.createUser
  }
)