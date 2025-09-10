// Optimized database queries to prevent N+1 problems and improve performance
import { prisma } from '@/lib/prisma'
import type { 
  VehicleFilters, 
  VehicleListItem, 
  PaginationInfo,
  VehicleWithCategory,
  VehicleWithInquiryCount 
} from '@/types/vehicle'

// Optimized vehicle queries with proper includes to prevent N+1 problems
export class VehicleQueries {
  /**
   * Get vehicles with optimized includes and filtering
   * Prevents N+1 queries by properly including related data
   */
  static async getVehicles(filters: VehicleFilters & { 
    isAdmin?: boolean 
  }): Promise<{ vehicles: VehicleListItem[]; pagination: PaginationInfo }> {
    const {
      page = 1,
      limit = 10,
      category,
      status,
      search,
      priceMin,
      priceMax,
      fuelType,
      transmission,
      yearMin,
      yearMax,
      make,
      featured,
      sortBy = 'name',
      isAdmin = false
    } = filters

    const skip = (page - 1) * limit
    
    // Build optimized where clause
    const where: any = {}
    
    // Admin vs public filtering
    if (!isAdmin) {
      where.active = true
      where.category = { active: true }
    }
    
    // Category filtering
    if (category) {
      const categories = category.split(',')
      const categoryFilter = { slug: { in: categories } }
      
      if (where.category) {
        where.category = { ...where.category, ...categoryFilter }
      } else {
        where.category = categoryFilter
      }
    }
    
    // Status filtering
    if (status) {
      const statuses = Array.isArray(status) ? status : status.split(',')
      where.status = { in: statuses }
    }
    
    // Featured filtering
    if (featured !== undefined) {
      where.featured = featured
    }
    
    // Search filtering (optimized with index)
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    // Price range filtering
    if (priceMin !== undefined || priceMax !== undefined) {
      const priceFilter: any = {}
      if (priceMin !== undefined) priceFilter.gte = priceMin
      if (priceMax !== undefined) priceFilter.lte = priceMax
      where.price = priceFilter
    }
    
    // Vehicle specification filters
    if (fuelType) {
      const fuelTypes = Array.isArray(fuelType) ? fuelType : fuelType.split(',')
      where.fuelType = { in: fuelTypes }
    }
    
    if (transmission) {
      const transmissions = Array.isArray(transmission) ? transmission : transmission.split(',')
      where.transmission = { in: transmissions }
    }
    
    if (yearMin !== undefined || yearMax !== undefined) {
      const yearFilter: any = {}
      if (yearMin !== undefined) yearFilter.gte = yearMin
      if (yearMax !== undefined) yearFilter.lte = yearMax
      where.year = yearFilter
    }
    
    if (make) {
      const makes = Array.isArray(make) ? make : make.split(',')
      where.make = { in: makes }
    }
    
    // Build optimized orderBy clause
    let orderBy: any = { name: 'asc' }
    switch (sortBy) {
      case 'price-low':
        orderBy = { price: 'asc' }
        break
      case 'price-high':
        orderBy = { price: 'desc' }
        break
      case 'newest':
      case 'recent':
        orderBy = { createdAt: 'desc' }
        break
      case 'oldest':
        orderBy = { createdAt: 'asc' }
        break
    }

    // Execute optimized query with single database roundtrip
    const [vehicles, totalCount] = await Promise.all([
      prisma.vehicle.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          price: true,
          images: true,
          mobileImages: true,
          specs: true,
          status: true,
          featured: true,
          active: true,
          categoryId: true,
          year: true,
          make: true,
          fuelType: true,
          transmission: true,
          createdAt: true,
          updatedAt: true,
          category: {
            select: { id: true, name: true }
          },
          _count: {
            select: { inquiries: true }
          }
        }
      }),
      prisma.vehicle.count({ where })
    ])

    return {
      vehicles: vehicles as VehicleListItem[],
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    }
  }

  /**
   * Get featured vehicles with optimized query
   */
  static async getFeaturedVehicles(limit: number = 10): Promise<VehicleListItem[]> {
    return prisma.vehicle.findMany({
      where: {
        active: true,
        featured: true,
        category: { active: true }
      },
      orderBy: [
        { createdAt: 'desc' }
      ],
      take: limit,
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        price: true,
        images: true,
        mobileImages: true,
        specs: true,
        status: true,
        featured: true,
        active: true,
        categoryId: true,
        year: true,
        make: true,
        fuelType: true,
        transmission: true,
        createdAt: true,
        updatedAt: true,
        category: {
          select: { id: true, name: true }
        },
        _count: {
          select: { inquiries: true }
        }
      }
    }) as Promise<VehicleListItem[]>
  }

  /**
   * Get single vehicle with all related data
   */
  static async getVehicleBySlug(slug: string): Promise<VehicleWithInquiryCount | null> {
    return prisma.vehicle.findUnique({
      where: {
        slug,
        active: true
      },
      include: {
        category: {
          select: { id: true, name: true, slug: true }
        },
        inquiries: {
          where: { status: { not: 'CLOSED' } },
          select: { id: true, status: true, createdAt: true }
        },
        _count: {
          select: { inquiries: true }
        }
      }
    }) as Promise<VehicleWithInquiryCount | null>
  }

  /**
   * Get related vehicles (optimized to prevent N+1)
   */
  static async getRelatedVehicles(
    vehicleId: string, 
    categoryId: string, 
    limit: number = 4
  ): Promise<VehicleListItem[]> {
    // First try to get vehicles from the same category
    let relatedVehicles = await prisma.vehicle.findMany({
      where: {
        AND: [
          { id: { not: vehicleId } },
          { categoryId },
          { active: true },
          { category: { active: true } }
        ]
      },
      orderBy: [
        { featured: 'desc' },
        { createdAt: 'desc' }
      ],
      take: limit,
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        price: true,
        images: true,
        mobileImages: true,
        specs: true,
        status: true,
        featured: true,
        active: true,
        categoryId: true,
        year: true,
        make: true,
        fuelType: true,
        transmission: true,
        createdAt: true,
        updatedAt: true,
        category: {
          select: { id: true, name: true }
        }
      }
    })

    // If not enough vehicles from same category, fill with others
    if (relatedVehicles.length < limit) {
      const remaining = limit - relatedVehicles.length
      const otherVehicles = await prisma.vehicle.findMany({
        where: {
          AND: [
            { id: { not: vehicleId } },
            { categoryId: { not: categoryId } },
            { active: true },
            { category: { active: true } }
          ]
        },
        orderBy: [
          { featured: 'desc' },
          { createdAt: 'desc' }
        ],
        take: remaining,
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          price: true,
          images: true,
          mobileImages: true,
          specs: true,
          status: true,
          featured: true,
          active: true,
          categoryId: true,
          year: true,
          make: true,
          fuelType: true,
          transmission: true,
          createdAt: true,
          updatedAt: true,
          category: {
            select: { id: true, name: true }
          }
        }
      })

      relatedVehicles = [...relatedVehicles, ...otherVehicles]
    }

    return relatedVehicles as VehicleListItem[]
  }
}

// Optimized inquiry queries
export class InquiryQueries {
  /**
   * Get inquiries with pagination and filtering
   */
  static async getInquiries(filters: {
    page?: number
    limit?: number
    status?: string
    vehicleId?: string
    userId?: string
  }) {
    const { page = 1, limit = 10, status, vehicleId, userId } = filters
    const skip = (page - 1) * limit

    const where: any = {}
    if (status) where.status = status
    if (vehicleId) where.vehicleId = vehicleId
    if (userId) where.userId = userId

    const [inquiries, totalCount] = await Promise.all([
      prisma.inquiry.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          vehicle: {
            select: { id: true, name: true, slug: true, images: true }
          },
          user: {
            select: { id: true, email: true, role: true }
          }
        }
      }),
      prisma.inquiry.count({ where })
    ])

    return {
      inquiries,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    }
  }
}

// Optimized category queries
export class CategoryQueries {
  /**
   * Get active categories with vehicle counts
   */
  static async getActiveCategories() {
    return prisma.category.findMany({
      where: { active: true },
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { 
            vehicles: { 
              where: { active: true } 
            } 
          }
        }
      }
    })
  }
}

// Optimized filter option queries
export class FilterOptionQueries {
  /**
   * Get all active filter options grouped by type
   */
  static async getFilterOptions() {
    const filterOptions = await prisma.filterOption.findMany({
      where: { active: true },
      orderBy: [
        { type: 'asc' },
        { order: 'asc' },
        { label: 'asc' }
      ]
    })

    // Group by type for easier consumption
    const grouped = filterOptions.reduce((acc, option) => {
      if (!acc[option.type]) acc[option.type] = []
      acc[option.type].push(option)
      return acc
    }, {} as Record<string, typeof filterOptions>)

    return grouped
  }
}