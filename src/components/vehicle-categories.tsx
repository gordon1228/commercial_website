'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Truck, Bus, Car } from 'lucide-react'

interface Category {
  id: string
  name: string
  slug: string
  description?: string
  _count?: {
    vehicles: number
  }
}

const getIconForCategory = (categorySlug: string) => {
  switch (categorySlug.toLowerCase()) {
    case 'trucks':
    case 'commercial-trucks':
      return Truck
    case 'buses':
    case 'passenger-buses':
      return Bus
    case 'vans':
    case 'delivery-vans':
    default:
      return Car
  }
}


// Fallback images for categories without database images
const getFallbackImageForCategory = (categorySlug: string) => {
  switch (categorySlug.toLowerCase()) {
    case 'trucks':
    case 'commercial-trucks':
      return '/images/truck2.jpg'
    case 'buses':
    case 'passenger-buses':
      return '/images/truck4.jpg'
    case 'vans':
    case 'delivery-vans':
    default:
      return '/images/truck1.jpg'
  }
}


export default function VehicleCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories?includeCount=true')
        if (response.ok) {
          const data = await response.json()
          setCategories(data)
        } else {
          throw new Error('Failed to fetch categories')
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
        setCategories([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchCategories()
  }, [])

  return (
    <section id="categories" className="py-24 bg-background">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-display font-bold text-black mb-6">
            Vehicle Categories
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Choose from our comprehensive fleet of commercial vehicles, each designed to meet specific business needs with exceptional performance.
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[16/10] bg-gray-200 rounded-lg mb-4" />
                <div className="space-y-2">
                  <div className="h-6 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">No vehicle categories available.</p>
            <p className="text-gray-500 mt-2">Categories will appear here once vehicles are added.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {categories.map((category) => {
              const IconComponent = getIconForCategory(category.slug)
              const vehicleCount = category._count?.vehicles || 0
              
              return (
                <Link
                  key={category.id}
                  href={`/vehicles?category=${category.slug}`}
                  className="group card-hover bg-gray-900/50 border-gray-800 overflow-hidden"
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <Image
                      src={getFallbackImageForCategory(category.slug)}
                      alt={category.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    
                    <div className="absolute top-4 left-4">
                      <div className="w-12 h-12 bg-accent/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                        <IconComponent className="h-6 w-6 text-accent" />
                      </div>
                    </div>
                    
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-2xl font-semibold text-white mb-2 group-hover:text-gray-200 transition-colors">
                        {category.name}
                      </h3>
                      <p className="text-gray-300 text-sm mb-3">
                        {category.description || `Explore our ${category.name.toLowerCase()}`}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 text-sm">
                          {vehicleCount} {vehicleCount === 1 ? 'vehicle' : 'vehicles'} available
                        </span>
                        <span className="text-gray-200 text-sm font-medium group-hover:underline">
                          View All →
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}