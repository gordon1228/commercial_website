'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { 
  Heart, Eye, Fuel, Users, Weight, Phone, Mail, 
  MapPin, Calendar, Zap, ChevronRight 
} from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { ErrorDisplay } from '@/components/ui/error-display'
import ResponsiveImage from '@/components/ui/responsive-image'
import { ResponsiveGrid, ResponsiveContainer, ResponsiveStack } from '@/components/ui/responsive-container'
import { TouchButton } from '@/components/navigation/mobile-nav'

import type { VehicleCardData, VehicleListResponse } from '@/types/vehicle'

interface MobileVehicleCardProps {
  vehicle: VehicleCardData
}

function MobileVehicleCard({ vehicle }: MobileVehicleCardProps) {
  const [isSaved, setIsSaved] = useState(false)
  const [imageError, setImageError] = useState(false)

  useEffect(() => {
    // Check if vehicle is in favorites
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]')
    setIsSaved(favorites.includes(vehicle.id))
  }, [vehicle.id])

  const toggleSave = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]')
    let newFavorites
    
    if (isSaved) {
      newFavorites = favorites.filter((id: string) => id !== vehicle.id)
    } else {
      newFavorites = [...favorites, vehicle.id]
    }
    
    localStorage.setItem('favorites', JSON.stringify(newFavorites))
    setIsSaved(!isSaved)
  }

  const handleImageError = () => {
    setImageError(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-green-100 text-green-800'
      case 'SOLD':
        return 'bg-red-100 text-red-800'
      case 'RESERVED':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const hasValidImage = vehicle.images?.[0] && !imageError

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 active:scale-[0.98] touch-manipulation">
      <Link href={`/vehicles/${vehicle.slug}`} className="block">
        {/* Image Container */}
        <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
          {hasValidImage ? (
            <ResponsiveImage
              src={vehicle.images[0]}
              alt={vehicle.name}
              size="VEHICLE_CARD"
              className="w-full h-full object-cover"
              onError={handleImageError}
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <div className="text-center text-gray-400">
                <Eye className="h-12 w-12 mx-auto mb-2" />
                <p className="text-sm">No image available</p>
              </div>
            </div>
          )}
          
          {/* Overlay Actions */}
          <div className="absolute top-3 right-3 flex gap-2">
            <button
              onClick={toggleSave}
              className={`p-2 rounded-full backdrop-blur-sm transition-all duration-200 touch-manipulation min-w-[44px] min-h-[44px] ${
                isSaved 
                  ? 'bg-red-500 text-white' 
                  : 'bg-white/80 text-gray-600 hover:bg-white'
              }`}
              aria-label={isSaved ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart className={`h-5 w-5 ${isSaved ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Status Badge */}
          <div className="absolute top-3 left-3">
            <Badge className={getStatusColor(vehicle.status)}>
              {vehicle.status}
            </Badge>
          </div>

          {/* Featured Badge */}
          {vehicle.featured && (
            <div className="absolute bottom-3 left-3">
              <Badge className="bg-blue-100 text-blue-800">
                <Zap className="h-3 w-3 mr-1" />
                Featured
              </Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <CardContent className="p-4">
          {/* Header */}
          <div className="mb-3">
            <h3 className="font-semibold text-lg text-gray-900 line-clamp-2 mb-1">
              {vehicle.name}
            </h3>
            {vehicle.year && (
              <p className="text-sm text-gray-600 flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {vehicle.year}
              </p>
            )}
          </div>

          {/* Price */}
          <div className="mb-4">
            <p className="text-2xl font-bold text-green-600">
              ${formatPrice(vehicle.price)}
            </p>
          </div>

          {/* Key Specs - Mobile Optimized */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            {vehicle.fuelType && (
              <div className="flex items-center text-sm text-gray-600">
                <Fuel className="h-4 w-4 mr-2 text-gray-400" />
                <span className="truncate">{vehicle.fuelType}</span>
              </div>
            )}
            {vehicle.category?.name && (
              <div className="flex items-center text-sm text-gray-600">
                <Weight className="h-4 w-4 mr-2 text-gray-400" />
                <span className="truncate">{vehicle.category.name}</span>
              </div>
            )}
          </div>

          {/* Description */}
          {vehicle.description && (
            <p className="text-sm text-gray-600 line-clamp-2 mb-4">
              {vehicle.description}
            </p>
          )}

          {/* Mobile CTA */}
          <div className="flex gap-2">
            <TouchButton 
              href={`/vehicles/${vehicle.slug}`}
              variant="primary"
              size="md"
              className="flex-1"
            >
              View Details
              <ChevronRight className="h-4 w-4 ml-1" />
            </TouchButton>
            <TouchButton 
              href={`/contact?vehicle=${vehicle.slug}`}
              variant="secondary"
              size="md"
              className="px-3"
            >
              <Phone className="h-4 w-4" />
            </TouchButton>
          </div>
        </CardContent>
      </Link>
    </Card>
  )
}

// Desktop/Tablet optimized card
function DesktopVehicleCard({ vehicle }: MobileVehicleCardProps) {
  const [isSaved, setIsSaved] = useState(false)
  const [imageError, setImageError] = useState(false)

  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]')
    setIsSaved(favorites.includes(vehicle.id))
  }, [vehicle.id])

  const toggleSave = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]')
    let newFavorites
    
    if (isSaved) {
      newFavorites = favorites.filter((id: string) => id !== vehicle.id)
    } else {
      newFavorites = [...favorites, vehicle.id]
    }
    
    localStorage.setItem('favorites', JSON.stringify(newFavorites))
    setIsSaved(!isSaved)
  }

  return (
    <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <Link href={`/vehicles/${vehicle.slug}`} className="block">
        {/* Image Container */}
        <div className="relative aspect-[4/3] overflow-hidden">
          {vehicle.images?.[0] && !imageError ? (
            <ResponsiveImage
              src={vehicle.images[0]}
              alt={vehicle.name}
              size="VEHICLE_CARD"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <div className="text-center text-gray-400">
                <Eye className="h-16 w-16 mx-auto mb-3" />
                <p className="text-sm">No image available</p>
              </div>
            </div>
          )}
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300" />
          
          {/* Actions */}
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={toggleSave}
              className={`p-2 rounded-full backdrop-blur-sm transition-all duration-200 ${
                isSaved 
                  ? 'bg-red-500 text-white' 
                  : 'bg-white/80 text-gray-600 hover:bg-white'
              }`}
            >
              <Heart className={`h-5 w-5 ${isSaved ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Status & Featured Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            <Badge className={`${
              vehicle.status === 'AVAILABLE' 
                ? 'bg-green-100 text-green-800' 
                : vehicle.status === 'SOLD'
                ? 'bg-red-100 text-red-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {vehicle.status}
            </Badge>
            {vehicle.featured && (
              <Badge className="bg-blue-100 text-blue-800">
                <Zap className="h-3 w-3 mr-1" />
                Featured
              </Badge>
            )}
          </div>
        </div>

        {/* Content */}
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              <h3 className="font-semibold text-xl text-gray-900 mb-2 line-clamp-2">
                {vehicle.name}
              </h3>
              {vehicle.year && (
                <p className="text-gray-600 flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {vehicle.year}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-green-600">
                ${formatPrice(vehicle.price)}
              </p>
            </div>
          </div>

          {/* Specs */}
          <div className="flex flex-wrap gap-4 mb-4">
            {vehicle.fuelType && (
              <div className="flex items-center text-sm text-gray-600">
                <Fuel className="h-4 w-4 mr-2 text-gray-400" />
                {vehicle.fuelType}
              </div>
            )}
            {vehicle.category?.name && (
              <div className="flex items-center text-sm text-gray-600">
                <Weight className="h-4 w-4 mr-2 text-gray-400" />
                {vehicle.category.name}
              </div>
            )}
          </div>

          {vehicle.description && (
            <p className="text-gray-600 line-clamp-3 mb-4">
              {vehicle.description}
            </p>
          )}

          <div className="flex gap-3">
            <Button asChild className="flex-1">
              <Link href={`/vehicles/${vehicle.slug}`}>
                View Details
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/contact?vehicle=${vehicle.slug}`}>
                <Phone className="h-4 w-4 mr-2" />
                Contact
              </Link>
            </Button>
          </div>
        </CardContent>
      </Link>
    </Card>
  )
}

interface ResponsiveVehicleGridProps {
  vehicles: VehicleCardData[]
  loading?: boolean
  error?: string | null
  className?: string
  showFilters?: boolean
  onFilterChange?: (filters: any) => void
}

export function ResponsiveVehicleGrid({ 
  vehicles, 
  loading = false, 
  error = null,
  className,
  showFilters = false,
  onFilterChange 
}: ResponsiveVehicleGridProps) {
  const searchParams = useSearchParams()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  if (loading) {
    return (
      <ResponsiveContainer maxWidth="7xl" padding="md">
        <ResponsiveGrid 
          cols={{ default: 1, sm: 2, md: 2, lg: 3, xl: 4 }} 
          gap="lg"
          className="animate-pulse"
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="aspect-[4/3] bg-gray-200" />
              <CardContent className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
                <div className="h-6 bg-gray-200 rounded w-1/3" />
                <div className="h-4 bg-gray-200 rounded" />
                <div className="h-10 bg-gray-200 rounded" />
              </CardContent>
            </Card>
          ))}
        </ResponsiveGrid>
      </ResponsiveContainer>
    )
  }

  if (error) {
    return (
      <ResponsiveContainer maxWidth="7xl" padding="md">
        <ErrorDisplay 
          message={error} 
          actionText="Try Again"
          onAction={() => window.location.reload()}
        />
      </ResponsiveContainer>
    )
  }

  if (!vehicles.length) {
    return (
      <ResponsiveContainer maxWidth="7xl" padding="md">
        <div className="text-center py-16">
          <Eye className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">No vehicles found</h3>
          <p className="text-gray-600 mb-6">
            Try adjusting your search criteria or browse all vehicles.
          </p>
          <Button asChild>
            <Link href="/vehicles">View All Vehicles</Link>
          </Button>
        </div>
      </ResponsiveContainer>
    )
  }

  return (
    <ResponsiveContainer maxWidth="7xl" padding="md" className={className}>
      {/* Results Header - Mobile Optimized */}
      <div className="mb-6">
        <ResponsiveStack 
          direction={{ default: 'column', md: 'row' }}
          justify="between"
          align="center"
          className="mb-4"
        >
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              Commercial Vehicles
            </h2>
            <p className="text-gray-600">
              {vehicles.length} vehicle{vehicles.length !== 1 ? 's' : ''} available
            </p>
          </div>
          
          {/* Mobile Filters Toggle */}
          {showFilters && isMobile && (
            <TouchButton variant="secondary" size="md">
              Filters & Sort
            </TouchButton>
          )}
        </ResponsiveStack>
      </div>

      {/* Vehicle Grid */}
      <ResponsiveGrid 
        cols={{ 
          default: 1, 
          sm: 2, 
          md: 2, 
          lg: 3, 
          xl: 4 
        }} 
        gap={isMobile ? 'md' : 'lg'}
      >
        {vehicles.map((vehicle) => (
          isMobile ? (
            <MobileVehicleCard key={vehicle.id} vehicle={vehicle} />
          ) : (
            <DesktopVehicleCard key={vehicle.id} vehicle={vehicle} />
          )
        ))}
      </ResponsiveGrid>

      {/* Load More Button - Mobile Optimized */}
      {vehicles.length > 0 && vehicles.length % 12 === 0 && (
        <div className="text-center mt-12">
          <TouchButton variant="secondary" size="lg">
            Load More Vehicles
          </TouchButton>
        </div>
      )}
    </ResponsiveContainer>
  )
}

export default ResponsiveVehicleGrid