import { prisma } from '@/lib/prisma'
import { createApiHandler, apiResponse, apiError } from '@/lib/api-handler'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { NextRequest } from 'next/server'

const fallbackContactInfo = {
  id: 'default',
  salesPhone: '+010 339 1414',
  servicePhone: '+016 332 2349',
  financePhone: '+016 332 2349',
  salesEmail: 'sales@evtl.com.my',
  serviceEmail: 'service@evtl.com.my',
  supportEmail: 'support@evtl.com.my',
  address: '3-20 Level 3 MKH Boulevard, Jalan Changkat',
  city: '43000 Kajang, Selangor',
  directions: 'EVTL Trucks Office',
  mondayToFriday: '9:00 AM - 6:00 PM',
  saturday: '9:00 AM - 1:00 PM',
  sunday: 'Closed',
  createdAt: new Date(),
  updatedAt: new Date()
}

export const GET = createApiHandler(async (req) => {
  try {
    let contactInfo = await prisma.contactInfo.findFirst()
    
    if (!contactInfo) {
      contactInfo = fallbackContactInfo
    }

    return apiResponse(contactInfo)
  } catch (error) {
    console.error('Error fetching contact info, using fallback:', error.message)
    return apiResponse(fallbackContactInfo)
  }
})

export const PUT = createApiHandler(async (req: NextRequest) => {
  const session = await getServerSession(authOptions)
  if (!session || session.user?.role !== 'ADMIN') {
    return apiError('Admin access required', 403)
  }

  try {
    const data = await req.json()
    
    // Get existing contact info or create if none exists
    let existingContactInfo = await prisma.contactInfo.findFirst()
    
    if (!existingContactInfo) {
      existingContactInfo = await prisma.contactInfo.create({
        data: {}
      })
    }

    const updatedContactInfo = await prisma.contactInfo.update({
      where: { id: existingContactInfo.id },
      data: {
        salesPhone: data.salesPhone,
        servicePhone: data.servicePhone,
        financePhone: data.financePhone,
        salesEmail: data.salesEmail,
        serviceEmail: data.serviceEmail,
        supportEmail: data.supportEmail,
        address: data.address,
        city: data.city,
        directions: data.directions,
        mondayToFriday: data.mondayToFriday,
        saturday: data.saturday,
        sunday: data.sunday,
      }
    })

    return apiResponse(updatedContactInfo)
  } catch (error) {
    console.error('Error updating contact info:', error)
    
    // If the table doesn't exist, return an error message indicating database setup is needed
    if (error.code === 'P2021' || error.message?.includes('does not exist')) {
      return apiError('Database schema not synchronized. Please run: npx prisma db push', 503)
    }
    
    return apiError('Failed to update contact info', 500)
  }
})