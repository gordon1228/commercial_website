import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/vehicles - Get all vehicles with optional filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const priceMin = searchParams.get('priceMin')
    const priceMax = searchParams.get('priceMax')
    const sortBy = searchParams.get('sortBy') || 'name'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const skip = (page - 1) * limit

    // Build where clause for filtering
    const where: Record<string, unknown> = {}
    
    if (category) {
      const categories = category.split(',')
      where.category = { 
        slug: { in: categories } 
      }
    }
    
    if (status) {
      const statuses = status.split(',')
      where.status = { in: statuses }
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    if (priceMin || priceMax) {
      where.price = {}
      if (priceMin) where.price.gte = parseFloat(priceMin)
      if (priceMax) where.price.lte = parseFloat(priceMax)
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
          }
        }
      }),
      prisma.vehicle.count({ where })
    ])

    return NextResponse.json({
      vehicles,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching vehicles:', error)
    return NextResponse.json(
      { error: 'Failed to fetch vehicles' },
      { status: 500 }
    )
  }
}

// POST /api/vehicles - Create a new vehicle
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
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
      specifications,
      images,
      features,
      status = 'AVAILABLE'
    } = body

    // Validate required fields
    if (!name || !price || !categoryId) {
      return NextResponse.json(
        { error: 'Missing required fields: name, price, categoryId' },
        { status: 400 }
      )
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
      return NextResponse.json(
        { error: 'A vehicle with this name already exists' },
        { status: 409 }
      )
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
        specifications,
        images,
        features,
        status
      },
      include: {
        category: {
          select: { id: true, name: true }
        }
      }
    })

    return NextResponse.json(vehicle, { status: 201 })
  } catch (error) {
    console.error('Error creating vehicle:', error)
    return NextResponse.json(
      { error: 'Failed to create vehicle' },
      { status: 500 }
    )
  }
}