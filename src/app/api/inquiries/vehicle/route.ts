import { PrismaClient } from '@prisma/client'
import { createApiHandler, apiResponse } from '@/lib/api-handler'
import { validationSchemas } from '@/lib/security'
import { z } from 'zod'

const prisma = new PrismaClient()

const inquirySchema = z.object({
  name: z.string().min(1).max(100),
  email: validationSchemas.email,
  phone: validationSchemas.phone,
  message: validationSchemas.message,
  vehicleId: z.string().optional(),
  vehicleSlug: z.string().optional()
})

export const POST = createApiHandler(
  async (req, { body }) => {
    const { name, email, phone, message, vehicleId } = body as z.infer<typeof inquirySchema>

    // Create the inquiry
    const inquiry = await prisma.inquiry.create({
      data: {
        customerName: name,
        email,
        phone: phone || null,
        message,
        vehicleId: vehicleId || null,
        status: 'NEW'
      },
      include: {
        vehicle: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    })

    return apiResponse({ 
      message: 'Inquiry submitted successfully',
      inquiry 
    })
  },
  {
    rateLimit: 'api',
    validateBody: inquirySchema
  }
)