import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/inquiries - Get all inquiries with optional filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const vehicleId = searchParams.get('vehicleId')
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

    const [inquiries, totalCount] = await Promise.all([
      prisma.inquiry.findMany({
        where,
        orderBy: { createdAt: 'desc' },
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

    return NextResponse.json({
      inquiries,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching inquiries:', error)
    return NextResponse.json(
      { error: 'Failed to fetch inquiries' },
      { status: 500 }
    )
  }
}

// POST /api/inquiries - Create a new inquiry
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      customerName,
      email,
      phone,
      message,
      vehicleId
    } = body

    // Validate required fields
    if (!customerName || !email || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: customerName, email, message' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // If vehicleId is provided, verify it exists
    if (vehicleId) {
      const vehicle = await prisma.vehicle.findUnique({
        where: { id: vehicleId }
      })

      if (!vehicle) {
        return NextResponse.json(
          { error: 'Vehicle not found' },
          { status: 404 }
        )
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

    // TODO: Send email notification to admin
    // TODO: Send confirmation email to customer

    return NextResponse.json(inquiry, { status: 201 })
  } catch (error) {
    console.error('Error creating inquiry:', error)
    return NextResponse.json(
      { error: 'Failed to create inquiry' },
      { status: 500 }
    )
  }
}