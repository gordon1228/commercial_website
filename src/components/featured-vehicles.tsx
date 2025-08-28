'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Fuel, Users, Weight } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
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
  }
  status: string
  category: {
    id: string
    name: string
  }
}

// Mock data as fallback
const mockFeaturedVehicles = [
  {
    id: '1',
    name: 'Mercedes Sprinter 3500',
    slug: 'mercedes-sprinter-3500',
    price: 75000,
    image: '/images/truck1.jpg',
    specs: [
      { icon: Fuel, label: 'MPG', value: '21' },
      { icon: Users, label: 'Capacity', value: '15 seats' },
      { icon: Weight, label: 'GVWR', value: '11,030 lbs' }
    ]
  },
  {
    id: '2',
    name: 'Ford F-650 Box Truck',
    slug: 'ford-f650-box-truck',
    price: 89000,
    image: '/images/truck2.jpg',
    specs: [
      { icon: Fuel, label: 'MPG', value: '12' },
      { icon: Users, label: 'Cab', value: '2 seats' },
      { icon: Weight, label: 'GVWR', value: '25,950 lbs' }
    ]
  },
  {
    id: '3',
    name: 'Freightliner Cascadia',
    slug: 'freightliner-cascadia',
    price: 165000,
    image: '/images/truck3.jpg',
    specs: [
      { icon: Fuel, label: 'MPG', value: '7.5' },
      { icon: Users, label: 'Cab', value: '2 seats' },
      { icon: Weight, label: 'GVWR', value: '80,000 lbs' }
    ]
  },
  {
    id: '4',
    name: 'Blue Bird School Bus',
    slug: 'blue-bird-school-bus',
    price: 125000,
    image: '/images/truck4.jpg',
    specs: [
      { icon: Fuel, label: 'MPG', value: '8' },
      { icon: Users, label: 'Capacity', value: '72 seats' },
      { icon: Weight, label: 'GVWR', value: '34,000 lbs' }
    ]
  }
]

export default function FeaturedVehicles() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchFeaturedVehicles = async () => {
      try {
        const response = await fetch('/api/vehicles?limit=4&sortBy=price-high')
        if (response.ok) {
          const data = await response.json()
          setVehicles(data.vehicles)
        } else {
          throw new Error('Failed to fetch')
        }
      } catch (error) {
        console.error('Error fetching featured vehicles:', error)
        // Fallback to mock data
        setVehicles(mockFeaturedVehicles as any)
      } finally {
        setIsLoading(false)
      }
    }

    fetchFeaturedVehicles()
  }, [])

  useEffect(() => {
    if (!isAutoPlaying || vehicles.length === 0) return
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % vehicles.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [isAutoPlaying, vehicles.length])

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % vehicles.length)
    setIsAutoPlaying(false)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + vehicles.length) % vehicles.length)
    setIsAutoPlaying(false)
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
    setIsAutoPlaying(false)
  }

  return (
    <section className="py-24 bg-gray-200/50">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-display font-bold text-black mb-6">
            Featured Vehicles
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Handpicked premium vehicles that represent the best in their class for commercial operations.
          </p>
        </div>

        <div className="relative max-w-6xl mx-auto">
          {/* Loading state */}
          {isLoading ? (
            <div className="animate-pulse">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div className="aspect-[4/3] bg-gray-200 rounded-lg" />
                <div className="space-y-4">
                  <div className="h-8 bg-gray-200 rounded w-3/4" />
                  <div className="h-12 bg-gray-200 rounded w-1/2" />
                  <div className="grid grid-cols-3 gap-4">
                    {[1,2,3].map(i => (
                      <div key={i} className="text-center">
                        <div className="w-12 h-12 bg-gray-200 rounded-full mx-auto mb-2" />
                        <div className="h-4 bg-gray-200 rounded" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Carousel container */}
              <div className="relative overflow-hidden rounded-lg">
                <div 
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                  onMouseEnter={() => setIsAutoPlaying(false)}
                  onMouseLeave={() => setIsAutoPlaying(true)}
                >
                  {vehicles.map((vehicle) => (
                <div key={vehicle.id} className="w-full flex-shrink-0">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                    {/* Image */}
                    <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
                      <Image
                        src={vehicle.images?.[0] || '/images/truck1.jpg'}
                        alt={vehicle.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Content */}
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-3xl font-bold text-black mb-2">
                          {vehicle.name}
                        </h3>
                        <p className="text-4xl font-bold text-gray-800 mb-4">
                          {formatPrice(vehicle.price)}
                        </p>
                      </div>

                      {/* Specs */}
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                            <Fuel className="h-5 w-5 text-gray-600" />
                          </div>
                          <div className="text-sm text-gray-900 mb-1">MPG</div>
                          <div className="text-gray-600 font-semibold">{vehicle.specs?.fuel || 'N/A'}</div>
                        </div>
                        <div className="text-center">
                          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                            <Users className="h-5 w-5 text-gray-600" />
                          </div>
                          <div className="text-sm text-gray-900 mb-1">Capacity</div>
                          <div className="text-gray-600 font-semibold">{vehicle.specs?.capacity || 'N/A'}</div>
                        </div>
                        <div className="text-center">
                          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                            <Weight className="h-5 w-5 text-gray-600" />
                          </div>
                          <div className="text-sm text-gray-900 mb-1">Weight</div>
                          <div className="text-gray-600 font-semibold">{vehicle.specs?.weight || 'N/A'}</div>
                        </div>
                      </div>

                      {/* CTA Buttons */}
                      <div className="flex flex-col sm:flex-row gap-4">
                        <Button asChild className="flex-1">
                          <Link href={`/vehicles/${vehicle.slug}`}>View Details</Link>
                        </Button>
                        <Button variant="secondary" asChild className="flex-1">
                          <Link href={`/contact?vehicle=${vehicle.slug}`}>Get Quote</Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors z-10"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors z-10"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

              {/* Dots navigation */}
              <div className="flex justify-center space-x-2 mt-8">
                {vehicles.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      currentIndex === index 
                        ? 'bg-gray-900' 
                        : 'bg-gray-600 hover:bg-gray-500'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  )
}