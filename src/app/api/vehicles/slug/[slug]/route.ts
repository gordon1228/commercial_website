import { NextRequest, NextResponse } from 'next/server'
import { CachedQueries } from '@/lib/cache'
import { VehicleQueries } from '@/lib/database-queries'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    // Use cached query for better performance
    const vehicle = await CachedQueries.getVehicleBySlug(params.slug)

    if (!vehicle) {
      return NextResponse.json(
        { error: 'Vehicle not found' },
        { status: 404 }
      )
    }

    // Get related vehicles using optimized query
    const relatedVehicles = await VehicleQueries.getRelatedVehicles(
      vehicle.id,
      vehicle.categoryId,
      5
    )

    // Add "View All" option as the last item
    const viewAllItem = {
      id: 'view-all',
      name: `View All ${vehicle.category.name}`,
      slug: 'view-all',
      price: 0,
      status: 'VIEW_ALL' as const,
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