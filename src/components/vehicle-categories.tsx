'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Truck, Bus, Car } from 'lucide-react'

const categories = [
  {
    id: 'trucks',
    name: 'Commercial Trucks',
    count: 45,
    description: 'Heavy-duty trucks for serious hauling',
    icon: Truck,
    image: '/images/truck2.jpg',
    href: '/vehicles?category=trucks'
  },
  {
    id: 'vans',
    name: 'Delivery Vans',
    count: 32,
    description: 'Efficient vans for last-mile delivery',
    icon: Car,
    image: '/images/truck1.jpg',
    href: '/vehicles?category=vans'
  },
  {
    id: 'buses',
    name: 'Passenger Buses',
    count: 18,
    description: 'Comfortable transportation solutions',
    icon: Bus,
    image: '/images/truck4.jpg',
    href: '/vehicles?category=buses'
  }
]

export default function VehicleCategories() {
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.map((category) => {
            const IconComponent = category.icon
            return (
              <Link
                key={category.id}
                href={category.href}
                className="group card-hover bg-gray-900/50 border-gray-800 overflow-hidden"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={category.image}
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
                      {category.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">
                        {category.count} vehicles available
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
      </div>
    </section>
  )
}