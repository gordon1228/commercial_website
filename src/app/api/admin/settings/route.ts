import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get or create contact info (which now includes settings)
    let contactInfo = await prisma.contactInfo.findFirst()
    
    if (!contactInfo) {
      contactInfo = await prisma.contactInfo.create({
        data: {}
      })
    }

    // Return in settings format for backward compatibility
    const settingsFormat = {
      id: contactInfo.id,
      siteName: contactInfo.siteName,
      contactEmail: contactInfo.salesEmail, // Map to primary sales email
      supportPhone: contactInfo.salesPhone, // Map to primary sales phone
      address: `${contactInfo.address}, ${contactInfo.city}`,
      emailNotifications: contactInfo.emailNotifications,
      systemNotifications: contactInfo.systemNotifications,
      maintenanceMode: contactInfo.maintenanceMode,
      createdAt: contactInfo.createdAt,
      updatedAt: contactInfo.updatedAt
    }

    return NextResponse.json(settingsFormat)
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    
    // Get or create contact info
    let contactInfo = await prisma.contactInfo.findFirst()
    
    if (!contactInfo) {
      contactInfo = await prisma.contactInfo.create({
        data: {
          siteName: data.siteName,
          salesEmail: data.contactEmail, // Map contact email to sales email
          salesPhone: data.supportPhone, // Map support phone to sales phone
          address: data.address.split(',')[0] || data.address, // Extract address part
          city: data.address.split(',')[1]?.trim() || 'Commercial District, NY 10001',
          emailNotifications: data.emailNotifications,
          systemNotifications: data.systemNotifications,
          maintenanceMode: data.maintenanceMode
        }
      })
    } else {
      contactInfo = await prisma.contactInfo.update({
        where: { id: contactInfo.id },
        data: {
          siteName: data.siteName,
          salesEmail: data.contactEmail, // Map contact email to sales email
          salesPhone: data.supportPhone, // Map support phone to sales phone
          address: data.address.split(',')[0] || contactInfo.address,
          city: data.address.split(',')[1]?.trim() || contactInfo.city,
          emailNotifications: data.emailNotifications,
          systemNotifications: data.systemNotifications,
          maintenanceMode: data.maintenanceMode
        }
      })
    }

    // Return in settings format for backward compatibility
    const settingsFormat = {
      id: contactInfo.id,
      siteName: contactInfo.siteName,
      contactEmail: contactInfo.salesEmail,
      supportPhone: contactInfo.salesPhone,
      address: `${contactInfo.address}, ${contactInfo.city}`,
      emailNotifications: contactInfo.emailNotifications,
      systemNotifications: contactInfo.systemNotifications,
      maintenanceMode: contactInfo.maintenanceMode,
      createdAt: contactInfo.createdAt,
      updatedAt: contactInfo.updatedAt
    }

    return NextResponse.json(settingsFormat)
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}