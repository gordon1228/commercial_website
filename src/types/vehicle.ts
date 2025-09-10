// Core Vehicle types matching Prisma schema
export type VehicleStatus = 'AVAILABLE' | 'SOLD' | 'RESERVED'

export interface VehicleSpecs {
  fuel?: string
  capacity?: string
  weight?: string
  engine?: string
  horsepower?: string
  features?: string[]
  // Additional specs can be stored in the specs JSON field
  [key: string]: unknown
}

export interface BaseVehicle {
  id: string
  name: string
  slug: string
  description?: string
  price: number
  images: string[]
  mobileImages?: string[]
  specs: VehicleSpecs
  status: VehicleStatus
  featured: boolean
  active: boolean
  categoryId: string
  year: number
  make: string
  fuelType: string
  transmission?: string
  createdAt: Date
  updatedAt: Date
}

export interface VehicleWithCategory extends BaseVehicle {
  category: {
    id: string
    name: string
    slug: string
  }
}

export interface VehicleWithInquiryCount extends VehicleWithCategory {
  _count: {
    inquiries: number
  }
}

// For API responses
export interface VehicleListItem extends Omit<BaseVehicle, 'createdAt' | 'updatedAt'> {
  category: {
    id: string
    name: string
  }
  _count?: {
    inquiries: number
  }
}

// For creating new vehicles
export interface CreateVehicleData {
  name: string
  description?: string
  price: number
  categoryId: string
  year: number
  make: string
  fuelType: string
  transmission?: string
  specs?: VehicleSpecs
  images?: string[]
  mobileImages?: string[]
  status?: VehicleStatus
  featured?: boolean
}

// For updating vehicles
export interface UpdateVehicleData extends Partial<CreateVehicleData> {
  active?: boolean
}

// Vehicle filters for API queries
export interface VehicleFilters {
  category?: string
  status?: string | string[]
  search?: string
  priceMin?: number
  priceMax?: number
  fuelType?: string | string[]
  transmission?: string | string[]
  yearMin?: number
  yearMax?: number
  make?: string | string[]
  featured?: boolean
  active?: boolean
  page?: number
  limit?: number
  sortBy?: 'name' | 'price-low' | 'price-high' | 'newest' | 'oldest' | 'recent'
}

// Pagination response structure
export interface PaginationInfo {
  page: number
  limit: number
  total: number
  pages: number
}

export interface VehicleListResponse {
  vehicles: VehicleListItem[]
  pagination: PaginationInfo
}

// For vehicle cards/grid display
export interface VehicleCardData {
  id: string
  name: string
  slug: string
  description?: string
  price: number
  images: string[]
  mobileImages?: string[]
  specs: {
    fuel?: string
    capacity?: string
    weight?: string
    engine?: string
    horsepower?: string
    features?: string[]
    [key: string]: unknown
  }
  status: string
  category: {
    id: string
    name: string
  }
}