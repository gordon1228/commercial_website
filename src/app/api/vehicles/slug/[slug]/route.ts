import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const vehicle = await prisma.vehicle.findUnique({
      where: { slug: params.slug },
      include: {
        category: {
          select: { id: true, name: true, slug: true, active: true }
        }
      }
    })

    if (!vehicle) {
      return NextResponse.json(
        { error: 'Vehicle not found' },
        { status: 404 }
      )
    }

    // Get related vehicles with category prioritized over price
    const currentPrice = vehicle.price
    const priceRange = {
      min: currentPrice * 0.7,  // 30% below current price
      max: currentPrice * 1.3   // 30% above current price
    }

    // First priority: Same category with similar price range
    let relatedVehicles = await prisma.vehicle.findMany({
      where: {
        categoryId: vehicle.categoryId,
        id: { not: vehicle.id },
        status: 'AVAILABLE',
        price: {
          gte: priceRange.min,
          lte: priceRange.max
        }
      },
      include: {
        category: {
          select: { id: true, name: true, slug: true, active: true }
        }
      },
      orderBy: [
        { createdAt: 'desc' }
      ],
      take: 5
    })

    // Second priority: Same category with any price (if not enough vehicles)
    if (relatedVehicles.length < 5) {
      const excludedIds = [vehicle.id, ...relatedVehicles.map(v => v.id)]
      
      const sameCategoryVehicles = await prisma.vehicle.findMany({
        where: {
          categoryId: vehicle.categoryId,
          id: { notIn: excludedIds },
          status: 'AVAILABLE'
        },
        include: {
          category: {
            select: { id: true, name: true, slug: true, active: true }
          }
        },
        orderBy: [
          // Order by price similarity first, then by creation date
          { createdAt: 'desc' }
        ],
        take: 5 - relatedVehicles.length
      })
      
      relatedVehicles = [...relatedVehicles, ...sameCategoryVehicles]
    }

    // Third priority: Other categories (only if same category still insufficient)
    if (relatedVehicles.length < 5) {
      const excludedIds = [vehicle.id, ...relatedVehicles.map(v => v.id)]
      
      const otherCategoryVehicles = await prisma.vehicle.findMany({
        where: {
          categoryId: { not: vehicle.categoryId },
          id: { notIn: excludedIds },
          status: 'AVAILABLE'
        },
        include: {
          category: {
            select: { id: true, name: true, slug: true, active: true }
          }
        },
        orderBy: [
          { createdAt: 'desc' }
        ],
        take: 5 - relatedVehicles.length
      })
      
      relatedVehicles = [...relatedVehicles, ...otherCategoryVehicles]
    }

    // Add "View All" option as the last item
    const viewAllItem = {
      id: 'view-all',
      name: `View All ${vehicle.category.name}`,
      slug: 'view-all',
      price: 0,
      status: 'VIEW_ALL',
      images: [],
      category: vehicle.category,
      isViewAll: true,
      categorySlug: vehicle.category.slug
    }

    return NextResponse.json({
      vehicle,
      relatedVehicles: [...relatedVehicles, viewAllItem]
    })
  } catch (error) {
    console.error('Error fetching vehicle by slug:', error)
    return NextResponse.json(
      { error: 'Failed to fetch vehicle' },
      { status: 500 }
    )
  }
}