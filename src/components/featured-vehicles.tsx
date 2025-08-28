'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Fuel, Users, Weight } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const featuredVehicles = [
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

  useEffect(() => {
    if (!isAutoPlaying) return
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredVehicles.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [isAutoPlaying])

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % featuredVehicles.length)
    setIsAutoPlaying(false)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + featuredVehicles.length) % featuredVehicles.length)
    setIsAutoPlaying(false)
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
    setIsAutoPlaying(false)
  }

  return (
    <section className="py-24 bg-gray-900/30">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">
            Featured Vehicles
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Handpicked premium vehicles that represent the best in their class for commercial operations.
          </p>
        </div>

        <div className="relative max-w-6xl mx-auto">
          {/* Carousel container */}
          <div className="relative overflow-hidden rounded-lg">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
              onMouseEnter={() => setIsAutoPlaying(false)}
              onMouseLeave={() => setIsAutoPlaying(true)}
            >
              {featuredVehicles.map((vehicle) => (
                <div key={vehicle.id} className="w-full flex-shrink-0">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                    {/* Image */}
                    <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
                      <Image
                        src={vehicle.image}
                        alt={vehicle.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Content */}
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-3xl font-bold text-white mb-2">
                          {vehicle.name}
                        </h3>
                        <p className="text-4xl font-bold text-gray-800 mb-4">
                          {formatPrice(vehicle.price)}
                        </p>
                      </div>

                      {/* Specs */}
                      <div className="grid grid-cols-3 gap-4">
                        {vehicle.specs.map((spec, index) => {
                          const IconComponent = spec.icon
                          return (
                            <div key={index} className="text-center">
                              <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-2">
                                <IconComponent className="h-5 w-5 text-accent" />
                              </div>
                              <div className="text-sm text-gray-400 mb-1">{spec.label}</div>
                              <div className="text-white font-semibold">{spec.value}</div>
                            </div>
                          )
                        })}
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
            {featuredVehicles.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  currentIndex === index 
                    ? 'bg-accent' 
                    : 'bg-gray-600 hover:bg-gray-500'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}