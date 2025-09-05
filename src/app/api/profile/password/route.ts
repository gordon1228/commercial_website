import { NextRequest } from 'next/server'
import { createApiHandler, apiResponse, apiError } from '@/lib/api-handler'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { validationSchemas } from '@/lib/security'

const prisma = new PrismaClient()

// PUT /api/profile/password - Change user's own password
export const PUT = createApiHandler(
  async (req: NextRequest, { session }) => {
    const { currentPassword, newPassword } = await req.json()

    if (!currentPassword || !newPassword) {
      return apiError('Current password and new password are required', 400)
    }

    // Validate new password using security schema
    try {
      validationSchemas.password.parse(newPassword)
    } catch {
      return apiError('New password must contain uppercase, lowercase, number and special character', 400)
    }

    // Get current user from database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user) {
      return apiError('User not found', 404)
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password)
    if (!isCurrentPasswordValid) {
      return apiError('Current password is incorrect', 400)
    }

    // Check if new password is different from current
    const isSamePassword = await bcrypt.compare(newPassword, user.password)
    if (isSamePassword) {
      return apiError('New password must be different from current password', 400)
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12)

    // Update password in database
    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashedNewPassword }
    })

    return apiResponse({ message: 'Password updated successfully' })
  },
  {
    requireAuth: true,
    rateLimit: 'api'
  }
)