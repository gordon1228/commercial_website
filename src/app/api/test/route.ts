import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    // Test database connection
    const categoriesCount = await prisma.category.count()
    const vehiclesCount = await prisma.vehicle.count()
    const inquiriesCount = await prisma.inquiry.count()
    
    return NextResponse.json({
      message: 'Database connection successful',
      counts: {
        categories: categoriesCount,
        vehicles: vehiclesCount,
        inquiries: inquiriesCount
      }
    })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Database connection failed', details: String(error) },
      { status: 500 }
    )
  }
}