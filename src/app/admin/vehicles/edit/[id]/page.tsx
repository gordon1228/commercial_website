'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ImageUpload } from '@/components/ui/image-upload'
import Link from 'next/link'

const fuelTypeOptions = [
  { id: 'Electric', label: 'Electric' },
  { id: 'Diesel', label: 'Diesel' },
  { id: 'Gasoline', label: 'Gasoline' },
  { id: 'Hybrid', label: 'Hybrid' },
  { id: 'CNG', label: 'CNG' }
]

const makeOptions = [
  { id: 'Ford', label: 'Ford' },
  { id: 'Chevrolet', label: 'Chevrolet' },
  { id: 'RAM', label: 'RAM' },
  { id: 'GMC', label: 'GMC' },
  { id: 'Isuzu', label: 'Isuzu' },
  { id: 'Freightliner', label: 'Freightliner' },
  { id: 'Volvo', label: 'Volvo' },
  { id: 'Peterbilt', label: 'Peterbilt' },
  { id: 'Kenworth', label: 'Kenworth' },
  { id: 'Mack', label: 'Mack' }
]

const transmissionOptions = [
  { id: 'Manual', label: 'Manual' },
  { id: 'Automatic', label: 'Automatic' },
  { id: 'Semi-Automatic', label: 'Semi-Automatic' }
]

interface Category {
  id: string
  name: string
  slug: string
}

interface Vehicle {
  id: string
  name: string
  slug: string
  description?: string
  price: number
  categoryId: string
  status: string
  featured: boolean
  year: number
  make: string
  fuelType: string
  transmission?: string
  images: string[]
  specs: {
    // Performance
    fuel: string
    engine: string
    horsepower: string
    torque: string
    displacement: string
    transmission: string
    drivetrain: string
    fuelCapacity: string
    
    // Interior
    capacity: string
    seatingCapacity: string
    cabinSpace: string
    legRoom: string
    interior: string
    comfort: string
    airConditioning: string
    upholstery: string
    dashboard: string
    infotainment: string
    storage: string
    
    // Safety
    abs: string
    esc: string
    tcs: string
    brakes: string
    airbags: string
    seatbelts: string
    crumpleZones: string
    reinforcement: string
    safetyRating: string
    rating: string
    safety: string
    compliance: string
    
    // Additional specs
    weight: string
    features: string
    technology: string
  }
  features: string[]
  category: {
    id: string
    name: string
  }
}

export default function EditVehiclePage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [activeSpecTab, setActiveSpecTab] = useState('performance')

  const fetchData = useCallback(async () => {
    try {
      const [vehicleRes, categoriesRes] = await Promise.all([
        fetch(`/api/vehicles/${params.id}`),
        fetch('/api/categories')
      ])

      if (!vehicleRes.ok) throw new Error('Vehicle not found')
      if (!categoriesRes.ok) throw new Error('Failed to fetch categories')

      const [vehicleData, categoriesData] = await Promise.all([
        vehicleRes.json(),
        categoriesRes.json()
      ])

      // Ensure specs object exists with all required fields
      const specs = vehicleData.specs || {}
      const normalizedVehicle = {
        ...vehicleData,
        specs: {
          // Performance
          fuel: specs.fuel || '',
          engine: specs.engine || '',
          horsepower: specs.horsepower || '',
          torque: specs.torque || '',
          displacement: specs.displacement || '',
          transmission: specs.transmission || '',
          drivetrain: specs.drivetrain || '',
          fuelCapacity: specs.fuelCapacity || '',
          
          // Interior
          capacity: specs.capacity || '',
          seatingCapacity: specs.seatingCapacity || '',
          cabinSpace: specs.cabinSpace || '',
          legRoom: specs.legRoom || '',
          interior: specs.interior || '',
          comfort: specs.comfort || '',
          airConditioning: specs.airConditioning || '',
          upholstery: specs.upholstery || '',
          dashboard: specs.dashboard || '',
          infotainment: specs.infotainment || '',
          storage: specs.storage || '',
          
          // Safety
          abs: specs.abs || '',
          esc: specs.esc || '',
          tcs: specs.tcs || '',
          brakes: specs.brakes || '',
          airbags: specs.airbags || '',
          seatbelts: specs.seatbelts || '',
          crumpleZones: specs.crumpleZones || '',
          reinforcement: specs.reinforcement || '',
          safetyRating: specs.safetyRating || '',
          rating: specs.rating || '',
          safety: specs.safety || '',
          compliance: specs.compliance || '',
          
          // Additional specs
          weight: specs.weight || '',
          features: specs.features || '',
          technology: specs.technology || ''
        },
        features: vehicleData.features || []
      }

      setVehicle(normalizedVehicle)
      setCategories(categoriesData)
    } catch (error) {
      console.error('Error fetching data:', error)
      router.push('/admin/vehicles')
    } finally {
      setIsLoadingData(false)
    }
  }, [params.id, router])

  useEffect(() => {
    if (status === 'loading') return
    if (!session || session.user?.role !== 'ADMIN') {
      router.push('/admin/login')
      return
    }

    fetchData()
  }, [session, status, router, params.id, fetchData])

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setVehicle(prev => prev ? ({
      ...prev,
      [field]: value
    }) : null)
  }

  const handleSpecChange = (field: string, value: string) => {
    setVehicle(prev => prev ? ({
      ...prev,
      specs: {
        ...prev.specs,
        [field]: value
      }
    }) : null)
  }

  const handleImagesChange = (newImages: string[]) => {
    setVehicle(prev => prev ? ({
      ...prev,
      images: newImages.length > 0 ? newImages : ['']
    }) : null)
  }

  const handleFeaturesChange = (newFeatures: string[]) => {
    setVehicle(prev => prev ? ({
      ...prev,
      features: newFeatures
    }) : null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!vehicle) return
    
    setIsLoading(true)

    try {
      const submitData = {
        name: vehicle.name,
        description: vehicle.description,
        price: Number(vehicle.price),
        categoryId: vehicle.categoryId,
        year: Number(vehicle.year),
        make: vehicle.make,
        fuelType: vehicle.fuelType,
        transmission: vehicle.transmission,
        status: vehicle.status,
        featured: vehicle.featured,
        images: vehicle.images.filter(img => img.trim() !== ''),
        specs: vehicle.specs,
        features: vehicle.features
      }
      
      console.log('Sending update request with data:', submitData)

      const response = await fetch(`/api/vehicles/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submitData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('API Error Response:', errorData)
        throw new Error(errorData.error || 'Failed to update vehicle')
      }
      
      const result = await response.json()
      console.log('Vehicle updated successfully:', result)
      router.push('/admin/vehicles')
    } catch (error: unknown) {
      console.error('Error updating vehicle:', error)
      const errorMessage = (error instanceof Error ? error.message : String(error)) || 'Failed to update vehicle'
      alert(`Failed to update vehicle: ${errorMessage}`)
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'loading' || isLoadingData) {
    return (
      <div className="px-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
          <div className="space-y-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!vehicle) {
    return (
      <div className="px-6">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Vehicle Not Found</h1>
          <Link href="/admin/vehicles">
            <Button>Back to Vehicles</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="px-6">
      {/* Page Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/vehicles">
          <Button variant="ghost" size="sm" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Vehicles
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Vehicle</h1>
          <p className="text-gray-600 mt-2">
            Update vehicle information and specifications.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vehicle Name *
                </label>
                <Input
                  value={vehicle.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., Ford F-650 Box Truck"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={vehicle.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe the vehicle features and condition..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price *
                </label>
                <Input
                  type="number"
                  value={vehicle.price || ''}
                  onChange={(e) => handleInputChange('price', Number(e.target.value))}
                  placeholder="0"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  value={vehicle.categoryId}
                  onChange={(e) => handleInputChange('categoryId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Year *
                  </label>
                  <input
                    type="number"
                    value={vehicle.year || new Date().getFullYear()}
                    onChange={(e) => handleInputChange('year', parseInt(e.target.value) || new Date().getFullYear())}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1990"
                    max="2030"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Make *
                  </label>
                  <select
                    value={vehicle.make || ''}
                    onChange={(e) => handleInputChange('make', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Make</option>
                    {makeOptions.map((make) => (
                      <option key={make.id} value={make.id}>
                        {make.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fuel Type *
                  </label>
                  <select
                    value={vehicle.fuelType || ''}
                    onChange={(e) => handleInputChange('fuelType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Fuel Type</option>
                    {fuelTypeOptions.map((fuel) => (
                      <option key={fuel.id} value={fuel.id}>
                        {fuel.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Transmission *
                  </label>
                  <select
                    value={vehicle.transmission || ''}
                    onChange={(e) => handleInputChange('transmission', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Transmission</option>
                    {transmissionOptions.map((transmission) => (
                      <option key={transmission.id} value={transmission.id}>
                        {transmission.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={vehicle.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="AVAILABLE">Available</option>
                  <option value="RESERVED">Reserved</option>
                  <option value="SOLD">Sold</option>
                </select>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="featured"
                  checked={vehicle.featured}
                  onChange={(e) => handleInputChange('featured', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="featured" className="text-sm font-medium text-gray-700">
                  Featured Vehicle
                </label>
                <div className="text-xs text-gray-500">
                  Mark this vehicle to appear in the featured vehicles section on the homepage
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Specifications */}
          <Card>
            <CardHeader>
              <CardTitle>Specifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fuel Economy
                </label>
                <Input
                  value={vehicle.specs.fuel}
                  onChange={(e) => handleSpecChange('fuel', e.target.value)}
                  placeholder="e.g., 12 MPG"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Capacity
                </label>
                <Input
                  value={vehicle.specs.capacity}
                  onChange={(e) => handleSpecChange('capacity', e.target.value)}
                  placeholder="e.g., 2 seats, 15 passengers"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Weight
                </label>
                <Input
                  value={vehicle.specs.weight}
                  onChange={(e) => handleSpecChange('weight', e.target.value)}
                  placeholder="e.g., 25,950 lbs"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Engine
                </label>
                <Input
                  value={vehicle.specs.engine}
                  onChange={(e) => handleSpecChange('engine', e.target.value)}
                  placeholder="e.g., 6.7L V8 Power Stroke Diesel"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Horsepower
                </label>
                <Input
                  value={vehicle.specs.horsepower}
                  onChange={(e) => handleSpecChange('horsepower', e.target.value)}
                  placeholder="e.g., 270 HP"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Specifications & Features */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Vehicle Specifications</CardTitle>
              <div className="flex space-x-4 border-b">
                {[
                  { id: 'performance', label: 'Performance' },
                  { id: 'interior', label: 'Interior' },
                  { id: 'safety', label: 'Safety' },
                  { id: 'features', label: 'Features' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveSpecTab(tab.id)}
                    className={`py-2 px-4 border-b-2 transition-colors ${
                      activeSpecTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Performance Tab */}
              {activeSpecTab === 'performance' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Engine</label>
                    <Input
                      value={vehicle.specs.engine}
                      onChange={(e) => handleSpecChange('engine', e.target.value)}
                      placeholder="e.g., 6.7L Power Stroke V8 Turbo Diesel"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Horsepower</label>
                    <Input
                      value={vehicle.specs.horsepower}
                      onChange={(e) => handleSpecChange('horsepower', e.target.value)}
                      placeholder="e.g., 475"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Torque</label>
                    <Input
                      value={vehicle.specs.torque}
                      onChange={(e) => handleSpecChange('torque', e.target.value)}
                      placeholder="e.g., 1050 lb-ft"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Displacement</label>
                    <Input
                      value={vehicle.specs.displacement}
                      onChange={(e) => handleSpecChange('displacement', e.target.value)}
                      placeholder="e.g., 6.7L"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Transmission</label>
                    <Input
                      value={vehicle.specs.transmission}
                      onChange={(e) => handleSpecChange('transmission', e.target.value)}
                      placeholder="e.g., 10-Speed Automatic"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Drivetrain</label>
                    <Input
                      value={vehicle.specs.drivetrain}
                      onChange={(e) => handleSpecChange('drivetrain', e.target.value)}
                      placeholder="e.g., 4WD, RWD"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fuel Economy</label>
                    <Input
                      value={vehicle.specs.fuel}
                      onChange={(e) => handleSpecChange('fuel', e.target.value)}
                      placeholder="e.g., 15 MPG"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fuel Capacity</label>
                    <Input
                      value={vehicle.specs.fuelCapacity}
                      onChange={(e) => handleSpecChange('fuelCapacity', e.target.value)}
                      placeholder="e.g., 40 gallons"
                    />
                  </div>
                </div>
              )}

              {/* Interior Tab */}
              {activeSpecTab === 'interior' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Seating Capacity</label>
                    <Input
                      value={vehicle.specs.capacity}
                      onChange={(e) => handleSpecChange('capacity', e.target.value)}
                      placeholder="e.g., 5 seats"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Total Seats</label>
                    <Input
                      value={vehicle.specs.seatingCapacity}
                      onChange={(e) => handleSpecChange('seatingCapacity', e.target.value)}
                      placeholder="e.g., 5"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cabin Space</label>
                    <Input
                      value={vehicle.specs.cabinSpace}
                      onChange={(e) => handleSpecChange('cabinSpace', e.target.value)}
                      placeholder="e.g., Spacious crew cab"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Leg Room</label>
                    <Input
                      value={vehicle.specs.legRoom}
                      onChange={(e) => handleSpecChange('legRoom', e.target.value)}
                      placeholder="e.g., 40.8 inches"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Interior Features</label>
                    <Input
                      value={vehicle.specs.interior}
                      onChange={(e) => handleSpecChange('interior', e.target.value)}
                      placeholder="e.g., Premium materials"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Comfort Features</label>
                    <Input
                      value={vehicle.specs.comfort}
                      onChange={(e) => handleSpecChange('comfort', e.target.value)}
                      placeholder="e.g., Heated seats"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Air Conditioning</label>
                    <Input
                      value={vehicle.specs.airConditioning}
                      onChange={(e) => handleSpecChange('airConditioning', e.target.value)}
                      placeholder="e.g., Dual-zone automatic"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Upholstery</label>
                    <Input
                      value={vehicle.specs.upholstery}
                      onChange={(e) => handleSpecChange('upholstery', e.target.value)}
                      placeholder="e.g., Leather-appointed seats"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Dashboard</label>
                    <Input
                      value={vehicle.specs.dashboard}
                      onChange={(e) => handleSpecChange('dashboard', e.target.value)}
                      placeholder="e.g., Digital instrument cluster"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Infotainment</label>
                    <Input
                      value={vehicle.specs.infotainment}
                      onChange={(e) => handleSpecChange('infotainment', e.target.value)}
                      placeholder="e.g., 12-inch touchscreen"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Storage</label>
                    <Input
                      value={vehicle.specs.storage}
                      onChange={(e) => handleSpecChange('storage', e.target.value)}
                      placeholder="e.g., Multiple compartments"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Weight</label>
                    <Input
                      value={vehicle.specs.weight}
                      onChange={(e) => handleSpecChange('weight', e.target.value)}
                      placeholder="e.g., 7,494 lbs"
                    />
                  </div>
                </div>
              )}

              {/* Safety Tab */}
              {activeSpecTab === 'safety' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Anti-lock Braking (ABS)</label>
                    <Input
                      value={vehicle.specs.abs}
                      onChange={(e) => handleSpecChange('abs', e.target.value)}
                      placeholder="e.g., Standard"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Electronic Stability Control</label>
                    <Input
                      value={vehicle.specs.esc}
                      onChange={(e) => handleSpecChange('esc', e.target.value)}
                      placeholder="e.g., AdvanceTrac ESC"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Traction Control</label>
                    <Input
                      value={vehicle.specs.tcs}
                      onChange={(e) => handleSpecChange('tcs', e.target.value)}
                      placeholder="e.g., TCS Standard"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Braking System</label>
                    <Input
                      value={vehicle.specs.brakes}
                      onChange={(e) => handleSpecChange('brakes', e.target.value)}
                      placeholder="e.g., Vented disc brakes"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Airbag System</label>
                    <Input
                      value={vehicle.specs.airbags}
                      onChange={(e) => handleSpecChange('airbags', e.target.value)}
                      placeholder="e.g., Dual-stage frontal airbags"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Seatbelt System</label>
                    <Input
                      value={vehicle.specs.seatbelts}
                      onChange={(e) => handleSpecChange('seatbelts', e.target.value)}
                      placeholder="e.g., 3-point safety belts"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Crumple Zones</label>
                    <Input
                      value={vehicle.specs.crumpleZones}
                      onChange={(e) => handleSpecChange('crumpleZones', e.target.value)}
                      placeholder="e.g., Advanced crumple zones"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Chassis Reinforcement</label>
                    <Input
                      value={vehicle.specs.reinforcement}
                      onChange={(e) => handleSpecChange('reinforcement', e.target.value)}
                      placeholder="e.g., High-strength steel frame"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Safety Rating</label>
                    <Input
                      value={vehicle.specs.safetyRating}
                      onChange={(e) => handleSpecChange('safetyRating', e.target.value)}
                      placeholder="e.g., 5-Star NHTSA"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Overall Rating</label>
                    <Input
                      value={vehicle.specs.rating}
                      onChange={(e) => handleSpecChange('rating', e.target.value)}
                      placeholder="e.g., 5 Stars"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Safety Features</label>
                    <Input
                      value={vehicle.specs.safety}
                      onChange={(e) => handleSpecChange('safety', e.target.value)}
                      placeholder="e.g., Blind spot monitoring"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Compliance Standards</label>
                    <Input
                      value={vehicle.specs.compliance}
                      onChange={(e) => handleSpecChange('compliance', e.target.value)}
                      placeholder="e.g., FMVSS compliant"
                    />
                  </div>
                </div>
              )}

              {/* Features Tab */}
              {activeSpecTab === 'features' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Special Features</label>
                      <Input
                        value={vehicle.specs.features}
                        onChange={(e) => handleSpecChange('features', e.target.value)}
                        placeholder="e.g., Power tailgate"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Technology</label>
                      <Input
                        value={vehicle.specs.technology}
                        onChange={(e) => handleSpecChange('technology', e.target.value)}
                        placeholder="e.g., FordPass Connect"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Features (One per line)</label>
                    <textarea
                      value={vehicle.features?.join('\n') || ''}
                      onChange={(e) => handleFeaturesChange(e.target.value.split('\n').filter(f => f.trim()))}
                      placeholder={`Air conditioning\nPower steering\nBluetooth connectivity\nBackup camera\nCruise control`}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px]"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Images */}
        <Card>
          <CardHeader>
            <CardTitle>Vehicle Images</CardTitle>
          </CardHeader>
          <CardContent>
            <ImageUpload
              images={vehicle.images}
              onImagesChange={handleImagesChange}
              maxImages={10}
            />
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <Link href="/admin/vehicles">
            <Button variant="outline">Cancel</Button>
          </Link>
          <Button 
            type="submit" 
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {isLoading ? 'Updating...' : 'Update Vehicle'}
          </Button>
        </div>
      </form>
    </div>
  )
}