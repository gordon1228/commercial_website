'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Heart, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

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

export default function FavoritesPage() {
  const [favoriteVehicles, setFavoriteVehicles] = useState<Vehicle[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadFavorites = async () => {
      const favoriteIds = JSON.parse(localStorage.getItem('favorites') || '[]')
      
      if (favoriteIds.length === 0) {
        setIsLoading(false)
        return
      }

      try {
        // Fetch vehicles by IDs
        const promises = favoriteIds.map((id: string) =>
          fetch(`/api/vehicles/${id}`).then(res => res.json())
        )
        
        const vehicles = await Promise.all(promises)
        setFavoriteVehicles(vehicles.filter(v => v && !v.error))
      } catch (error) {
        console.error('Error loading favorite vehicles:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadFavorites()
  }, [])

  const removeFavorite = (vehicleId: string) => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]')
    const updatedFavorites = favorites.filter((id: string) => id !== vehicleId)
    localStorage.setItem('favorites', JSON.stringify(updatedFavorites))
    
    setFavoriteVehicles(prev => prev.filter(v => v.id !== vehicleId))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen pt-20 bg-background">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-gray-200 aspect-[4/3] rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-20 bg-background">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/vehicles">
            <Button variant="ghost" size="sm" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Vehicles
            </Button>
          </Link>
          <div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-900">
              My Favorites
            </h1>
            <p className="text-xl text-gray-600 mt-2">
              {favoriteVehicles.length} {favoriteVehicles.length === 1 ? 'vehicle' : 'vehicles'} saved
            </p>
          </div>
        </div>

        {favoriteVehicles.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No favorites yet</h3>
            <p className="text-gray-600 mb-8">Start browsing vehicles and save your favorites here</p>
            <Link href="/vehicles">
              <Button>Browse Vehicles</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favoriteVehicles.map((vehicle) => (
              <div key={vehicle.id} className="group card-hover bg-white border-gray-200 overflow-hidden">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={vehicle.images?.[0] || '/images/truck1.jpg'}
                    alt={vehicle.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  
                  <div className="absolute top-3 right-3">
                    <button
                      onClick={() => removeFavorite(vehicle.id)}
                      className="w-8 h-8 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                    >
                      <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  <div className="mb-4">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-gray-700 transition-colors">
                      <Link href={`/vehicles/${vehicle.slug}`}>
                        {vehicle.name}
                      </Link>
                    </h3>
                    <p className="text-3xl font-bold text-gray-800">
                      ${vehicle.price.toLocaleString()}
                    </p>
                  </div>

                  <div className="flex space-x-2">
                    <Button size="sm" className="flex-1">
                      <Link href={`/vehicles/${vehicle.slug}`}>View Details</Link>
                    </Button>
                    <Button variant="secondary" size="sm" className="flex-1">
                      <Link href={`/contact?vehicle=${vehicle.slug}`}>Get Quote</Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}