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
  city: 'Kajang',
  state: 'Selangor',
  postcode: '43000',
  country: 'Malaysia',
  directions: 'EVTL Trucks Office',
  mondayToFriday: '9:00 AM - 6:00 PM',
  saturday: '9:00 AM - 1:00 PM',
  sunday: 'Closed',
  // Footer Settings
  companyDescription: 'EVTL Sdn. Bhd. is a next-generation mobility startup focusing on Electric Trucks (EV Trucks) and future smart transport solutions.',
  facebookUrl: '',
  twitterUrl: '',
  instagramUrl: '',
  linkedinUrl: '',
  privacyPolicyUrl: '/privacy',
  termsOfServiceUrl: '/terms',
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

    // Prepare update data - only include fields that exist in the request
    const updateData: any = {}
    
    // Contact information fields
    if (data.salesPhone !== undefined) updateData.salesPhone = data.salesPhone
    if (data.servicePhone !== undefined) updateData.servicePhone = data.servicePhone
    if (data.financePhone !== undefined) updateData.financePhone = data.financePhone
    if (data.salesEmail !== undefined) updateData.salesEmail = data.salesEmail
    if (data.serviceEmail !== undefined) updateData.serviceEmail = data.serviceEmail
    if (data.supportEmail !== undefined) updateData.supportEmail = data.supportEmail
    if (data.address !== undefined) updateData.address = data.address
    if (data.city !== undefined) updateData.city = data.city
    if (data.state !== undefined) updateData.state = data.state
    if (data.postcode !== undefined) updateData.postcode = data.postcode
    if (data.country !== undefined) updateData.country = data.country
    if (data.directions !== undefined) updateData.directions = data.directions
    if (data.mondayToFriday !== undefined) updateData.mondayToFriday = data.mondayToFriday
    if (data.saturday !== undefined) updateData.saturday = data.saturday
    if (data.sunday !== undefined) updateData.sunday = data.sunday
    
    // Footer settings fields (handled via raw SQL for now due to Prisma client issues)
    if (data.companyDescription !== undefined || data.facebookUrl !== undefined || 
        data.twitterUrl !== undefined || data.instagramUrl !== undefined || 
        data.linkedinUrl !== undefined || data.privacyPolicyUrl !== undefined || 
        data.termsOfServiceUrl !== undefined) {
      
      // Build individual SQL updates for footer fields that exist
      const updates: string[] = []
      const values: any[] = [existingContactInfo.id]
      let paramIndex = 2
      
      if (data.companyDescription !== undefined) {
        updates.push(`"companyDescription" = $${paramIndex}`)
        values.push(data.companyDescription)
        paramIndex++
      }
      if (data.facebookUrl !== undefined) {
        updates.push(`"facebookUrl" = $${paramIndex}`)
        values.push(data.facebookUrl)
        paramIndex++
      }
      if (data.twitterUrl !== undefined) {
        updates.push(`"twitterUrl" = $${paramIndex}`)
        values.push(data.twitterUrl)
        paramIndex++
      }
      if (data.instagramUrl !== undefined) {
        updates.push(`"instagramUrl" = $${paramIndex}`)
        values.push(data.instagramUrl)
        paramIndex++
      }
      if (data.linkedinUrl !== undefined) {
        updates.push(`"linkedinUrl" = $${paramIndex}`)
        values.push(data.linkedinUrl)
        paramIndex++
      }
      if (data.privacyPolicyUrl !== undefined) {
        updates.push(`"privacyPolicyUrl" = $${paramIndex}`)
        values.push(data.privacyPolicyUrl)
        paramIndex++
      }
      if (data.termsOfServiceUrl !== undefined) {
        updates.push(`"termsOfServiceUrl" = $${paramIndex}`)
        values.push(data.termsOfServiceUrl)
        paramIndex++
      }
      
      if (updates.length > 0) {
        const query = `UPDATE contact_info SET ${updates.join(', ')} WHERE id = $1`
        await prisma.$executeRawUnsafe(query, ...values)
      }
    }

    const updatedContactInfo = await prisma.contactInfo.update({
      where: { id: existingContactInfo.id },
      data: updateData
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