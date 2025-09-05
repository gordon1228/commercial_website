'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Heart, Eye, Fuel, Users, Weight } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { Button } from '@/components/ui/button'
// import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { ErrorDisplay } from '@/components/ui/error-display'
import { useToast } from '@/components/ui/toast'

interface Vehicle {
  id: string
  name: string
  slug: string
  description?: string
  price: number
  images: string[]
  specs: {
    fuel: string
    capacity: string
    weight: string
    engine?: string
    horsepower?: string
  }
  status: string
  category: {
    id: string
    name: string
  }
}

interface ApiResponse {
  vehicles: Vehicle[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}


function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  const [isSaved, setIsSaved] = useState(false)
  const [imageError, setImageError] = useState(false)
  const hasImage = vehicle.images?.[0] && vehicle.images[0].trim() !== ''
  const [imageSrc, setImageSrc] = useState(hasImage ? vehicle.images[0] : '')

  useEffect(() => {
    // Check if vehicle is in favorites on component mount
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]')
    setIsSaved(favorites.includes(vehicle.id))
  }, [vehicle.id])

  useEffect(() => {
    // Reset image state when vehicle changes
    setImageError(false)
    const hasValidImage = vehicle.images?.[0] && vehicle.images[0].trim() !== ''
    if (hasValidImage) {
      // Add timestamp to bust cache for updated images
      const cacheBustedSrc = `${vehicle.images[0]}?t=${new Date().getTime()}`
      setImageSrc(cacheBustedSrc)
    } else {
      setImageSrc('')
    }
  }, [vehicle.images, vehicle.id])

  const toggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]')
    let updatedFavorites

    if (favorites.includes(vehicle.id)) {
      // Remove from favorites
      updatedFavorites = favorites.filter((id: string) => id !== vehicle.id)
      setIsSaved(false)
    } else {
      // Add to favorites
      updatedFavorites = [...favorites, vehicle.id]
      setIsSaved(true)
    }

    localStorage.setItem('favorites', JSON.stringify(updatedFavorites))
  }

  return (
    <div className="group card-hover bg-white border-gray-200 overflow-hidden">
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        {imageSrc && !imageError ? (
          <Image
            src={imageSrc}
            alt={vehicle.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            onError={() => setImageError(true)}
            onLoad={() => setImageError(false)}
            priority={false}
            unoptimized={true}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500 bg-gray-100">
            <div className="text-center">
              <div className="text-4xl mb-2">📷</div>
              <div className="text-sm font-medium">No Image</div>
            </div>
          </div>
        )}
        
        {/* Status badge */}
        <div className="absolute top-3 left-3">
          <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide shadow-lg ${
            vehicle.status === 'AVAILABLE' 
              ? 'bg-green-500 text-white' 
              : vehicle.status === 'RESERVED'
              ? 'bg-yellow-500 text-white'
              : 'bg-red-500 text-white'
          }`}>
            {vehicle.status === 'AVAILABLE' ? 'Available' : vehicle.status === 'RESERVED' ? 'Reserved' : vehicle.status}
          </span>
        </div>

        {/* Action buttons */}
        <div className="absolute top-3 right-3 flex space-x-2">
          <button
            onClick={toggleFavorite}
            className="w-8 h-8 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
          >
            <Heart className={`h-4 w-4 ${isSaved ? 'fill-red-500 text-red-500' : 'text-white'}`} />
          </button>
          <Link
            href={`/vehicles/${vehicle.slug}`}
            className="w-8 h-8 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
          >
            <Eye className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="mb-4">
          <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-gray-700 transition-colors line-clamp-1">
            <Link href={`/vehicles/${vehicle.slug}`}>
              {vehicle.name}
            </Link>
          </h3>
          <p className="text-3xl font-bold text-gray-800">
            {formatPrice(vehicle.price)}
          </p>
        </div>

        {/* Specs */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center">
            <Fuel className="h-4 w-4 text-gray-500 mx-auto mb-1" />
            <div className="text-xs text-gray-400">{vehicle.specs.fuel}</div>
          </div>
          <div className="text-center">
            <Users className="h-4 w-4 text-gray-500 mx-auto mb-1" />
            <div className="text-xs text-gray-400">{vehicle.specs.capacity}</div>
          </div>
          <div className="text-center">
            <Weight className="h-4 w-4 text-gray-500 mx-auto mb-1" />
            <div className="text-xs text-gray-400">{vehicle.specs.weight}</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-2">
          <Button size="sm" className="flex-1">
            <Link href={`/vehicles/${vehicle.slug}`}>View Details</Link>
          </Button>
          <Button variant="secondary" size="sm" className="flex-1">
            <Link href={`/contact?vehicle=${vehicle.slug}`}>Quote</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function VehicleGrid() {
  const searchParams = useSearchParams()
  const { showError } = useToast()
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [sortBy, setSortBy] = useState('name')
  const [viewCount, setViewCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchVehicles = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Build query parameters
        const params = new URLSearchParams()
        
        const category = searchParams.get('category')
        const status = searchParams.get('status')
        const search = searchParams.get('search')
        const priceMin = searchParams.get('priceMin')
        const priceMax = searchParams.get('priceMax')
        // New truck specification filters
        const fuelType = searchParams.get('fuelType')
        const transmission = searchParams.get('transmission')
        const yearMin = searchParams.get('yearMin')
        const yearMax = searchParams.get('yearMax')
        const make = searchParams.get('make')

        if (category) params.set('category', category)
        if (status) params.set('status', status)
        if (search) params.set('search', search)
        if (priceMin) params.set('priceMin', priceMin)
        if (priceMax) params.set('priceMax', priceMax)
        if (fuelType) params.set('fuelType', fuelType)
        if (transmission) params.set('transmission', transmission)
        if (yearMin) params.set('yearMin', yearMin)
        if (yearMax) params.set('yearMax', yearMax)
        if (make) params.set('make', make)
        if (sortBy) params.set('sortBy', sortBy)
        params.set('limit', '100') // Show up to 100 vehicles on public page
        
        // Add cache-busting timestamp to ensure fresh data
        params.set('_t', Date.now().toString())

        const response = await fetch(`/api/vehicles?${params.toString()}`, {
          cache: 'no-store' // Disable Next.js caching for this request
        })
        
        if (!response.ok) {
          throw new Error('Failed to fetch vehicles')
        }

        const data: ApiResponse = await response.json()
        setVehicles(data.vehicles)
        setViewCount(data.pagination.total)
      } catch (err) {
        console.error('Error fetching vehicles:', err)
        const errorMessage = err instanceof Error ? err.message : 'Failed to load vehicles'
        setError(errorMessage)
        showError('Failed to load vehicles', errorMessage)
        setVehicles([])
        setViewCount(0)
      } finally {
        setIsLoading(false)
      }
    }

    fetchVehicles()
  }, [searchParams, sortBy])

  return (
    <div>
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <div className="text-gray-900">
          <span className="text-lg font-medium">
            {viewCount} {viewCount === 1 ? 'vehicle' : 'vehicles'} found
          </span>
        </div>
        
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">Sort by:</span>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-white border border-gray-300 rounded px-3 py-1 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            <option value="name">Name A-Z</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 aspect-[4/3] rounded-lg mb-4" />
              <div className="space-y-2">
                <div className="h-6 bg-gray-200 rounded w-3/4" />
                <div className="h-8 bg-gray-200 rounded w-1/2" />
                <div className="h-4 bg-gray-200 rounded w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <ErrorDisplay
          title="Error loading vehicles"
          message={error}
          onRetry={() => {
            setError(null)
            const fetchVehicles = async () => {
              setIsLoading(true)
              setError(null)

              try {
                // Build query parameters
                const params = new URLSearchParams()
                
                const category = searchParams.get('category')
                const status = searchParams.get('status')
                const search = searchParams.get('search')
                const priceMin = searchParams.get('priceMin')
                const priceMax = searchParams.get('priceMax')
                // New truck specification filters
                const fuelType = searchParams.get('fuelType')
                const transmission = searchParams.get('transmission')
                const yearMin = searchParams.get('yearMin')
                const yearMax = searchParams.get('yearMax')
                const make = searchParams.get('make')

                if (category) params.set('category', category)
                if (status) params.set('status', status)
                if (search) params.set('search', search)
                if (priceMin) params.set('priceMin', priceMin)
                if (priceMax) params.set('priceMax', priceMax)
                if (fuelType) params.set('fuelType', fuelType)
                if (transmission) params.set('transmission', transmission)
                if (yearMin) params.set('yearMin', yearMin)
                if (yearMax) params.set('yearMax', yearMax)
                if (make) params.set('make', make)
                if (sortBy) params.set('sortBy', sortBy)
                params.set('limit', '100') // Show up to 100 vehicles on public page

                const response = await fetch(`/api/vehicles?${params.toString()}`)
                
                if (!response.ok) {
                  throw new Error('Failed to fetch vehicles')
                }

                const data: ApiResponse = await response.json()
                setVehicles(data.vehicles)
                setViewCount(data.pagination.total)
              } catch (err) {
                console.error('Error fetching vehicles:', err)
                const errorMessage = err instanceof Error ? err.message : 'Failed to load vehicles'
                setError(errorMessage)
                setVehicles([])
                setViewCount(0)
              } finally {
                setIsLoading(false)
              }
            }
            fetchVehicles()
          }}
        />
      ) : vehicles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {vehicles.map((vehicle) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No vehicles found</h3>
          <p className="text-gray-600">Try adjusting your filters to see more results.</p>
        </div>
      )}
    </div>
  )
}