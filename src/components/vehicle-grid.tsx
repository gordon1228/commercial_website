'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Heart, Eye, Fuel, Users, Weight } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { Button } from '@/components/ui/button'

// Mock data - in real app this would come from API
const mockVehicles = [
  {
    id: '1',
    name: 'Mercedes Sprinter 3500',
    slug: 'mercedes-sprinter-3500',
    price: 75000,
    category: 'vans',
    status: 'AVAILABLE',
    image: '/images/truck1.jpg',
    specs: {
      fuel: '21 MPG',
      capacity: '15 seats',
      weight: '11,030 lbs'
    }
  },
  {
    id: '2',
    name: 'Ford F-650 Box Truck',
    slug: 'ford-f650-box-truck',
    price: 89000,
    category: 'trucks',
    status: 'AVAILABLE',
    image: '/images/truck2.jpg',
    specs: {
      fuel: '12 MPG',
      capacity: '2 seats',
      weight: '25,950 lbs'
    }
  },
  {
    id: '3',
    name: 'Freightliner Cascadia',
    slug: 'freightliner-cascadia',
    price: 165000,
    category: 'trucks',
    status: 'AVAILABLE',
    image: '/images/truck3.jpg',
    specs: {
      fuel: '7.5 MPG',
      capacity: '2 seats',
      weight: '80,000 lbs'
    }
  },
  {
    id: '4',
    name: 'Blue Bird School Bus',
    slug: 'blue-bird-school-bus',
    price: 125000,
    category: 'buses',
    status: 'RESERVED',
    image: '/images/truck4.jpg',
    specs: {
      fuel: '8 MPG',
      capacity: '72 seats',
      weight: '34,000 lbs'
    }
  },
  {
    id: '5',
    name: 'Isuzu NPR HD',
    slug: 'isuzu-npr-hd',
    price: 58000,
    category: 'trucks',
    status: 'AVAILABLE',
    image: '/images/truck1.jpg',
    specs: {
      fuel: '13 MPG',
      capacity: '3 seats',
      weight: '14,500 lbs'
    }
  },
  {
    id: '6',
    name: 'Ford Transit 350',
    slug: 'ford-transit-350',
    price: 42000,
    category: 'vans',
    status: 'AVAILABLE',
    image: '/images/truck2.jpg',
    specs: {
      fuel: '18 MPG',
      capacity: '12 seats',
      weight: '9,070 lbs'
    }
  }
]

function VehicleCard({ vehicle }: { vehicle: typeof mockVehicles[0] }) {
  const [isSaved, setIsSaved] = useState(false)

  return (
    <div className="group card-hover bg-white border-gray-200 overflow-hidden">
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={vehicle.image}
          alt={vehicle.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* Status badge */}
        <div className="absolute top-3 left-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            vehicle.status === 'AVAILABLE' 
              ? 'bg-green-600/20 text-green-400 backdrop-blur-sm' 
              : 'bg-yellow-600/20 text-yellow-400 backdrop-blur-sm'
          }`}>
            {vehicle.status === 'AVAILABLE' ? 'Available' : 'Reserved'}
          </span>
        </div>

        {/* Action buttons */}
        <div className="absolute top-3 right-3 flex space-x-2">
          <button
            onClick={() => setIsSaved(!isSaved)}
            className="w-8 h-8 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
          >
            <Heart className={`h-4 w-4 ${isSaved ? 'fill-gray-600 text-gray-600' : ''}`} />
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
  const [filteredVehicles, setFilteredVehicles] = useState(mockVehicles)
  const [sortBy, setSortBy] = useState('name')
  const [viewCount, setViewCount] = useState(0)

  useEffect(() => {
    let filtered = [...mockVehicles]

    // Apply filters
    const category = searchParams.get('category')?.split(',') || []
    const status = searchParams.get('status')?.split(',') || []
    const search = searchParams.get('search') || ''
    const priceMin = searchParams.get('priceMin')
    const priceMax = searchParams.get('priceMax')

    if (category.length > 0) {
      filtered = filtered.filter(v => category.includes(v.category))
    }

    if (status.length > 0) {
      filtered = filtered.filter(v => status.includes(v.status))
    }

    if (search) {
      filtered = filtered.filter(v => 
        v.name.toLowerCase().includes(search.toLowerCase())
      )
    }

    if (priceMin) {
      filtered = filtered.filter(v => v.price >= parseInt(priceMin))
    }

    if (priceMax) {
      filtered = filtered.filter(v => v.price <= parseInt(priceMax))
    }

    // Apply sorting
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price)
        break
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price)
        break
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name))
        break
      default:
        break
    }

    setFilteredVehicles(filtered)
    setViewCount(filtered.length)
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
      {filteredVehicles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredVehicles.map((vehicle) => (
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