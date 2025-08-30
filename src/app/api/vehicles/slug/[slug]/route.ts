import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const vehicle = await prisma.vehicle.findUnique({
      where: { slug: params.slug },
      include: {
        category: {
          select: { id: true, name: true, slug: true }
        }
      }
    })

    if (!vehicle) {
      return NextResponse.json(
        { error: 'Vehicle not found' },
        { status: 404 }
      )
    }

    // Also get related vehicles from the same category
    const relatedVehicles = await prisma.vehicle.findMany({
      where: {
        categoryId: vehicle.categoryId,
        id: { not: vehicle.id },
        status: 'AVAILABLE'
      },
      include: {
        category: {
          select: { id: true, name: true, slug: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 3
    })

    return NextResponse.json({
      vehicle,
      relatedVehicles
    })
  } catch (error) {
    console.error('Error fetching vehicle by slug:', error)
    return NextResponse.json(
      { error: 'Failed to fetch vehicle' },
      { status: 500 }
    )
  }
}