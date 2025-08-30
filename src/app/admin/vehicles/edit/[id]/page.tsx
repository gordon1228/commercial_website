'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ImageUpload } from '@/components/ui/image-upload'
import Link from 'next/link'

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
  images: string[]
  specs: {
    fuel: string
    capacity: string
    weight: string
    engine: string
    horsepower: string
  }
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

  useEffect(() => {
    if (status === 'loading') return
    if (!session || session.user?.role !== 'ADMIN') {
      router.push('/admin/login')
      return
    }

    fetchData()
  }, [session, status, router, params.id])

  const fetchData = async () => {
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
          fuel: specs.fuel || '',
          capacity: specs.capacity || '',
          weight: specs.weight || '',
          engine: specs.engine || '',
          horsepower: specs.horsepower || ''
        }
      }

      setVehicle(normalizedVehicle)
      setCategories(categoriesData)
    } catch (error) {
      console.error('Error fetching data:', error)
      router.push('/admin/vehicles')
    } finally {
      setIsLoadingData(false)
    }
  }

  const handleInputChange = (field: string, value: string | number) => {
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
        status: vehicle.status,
        images: vehicle.images.filter(img => img.trim() !== ''),
        specifications: vehicle.specs
      }

      const response = await fetch(`/api/vehicles/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submitData)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update vehicle')
      }

      router.push('/admin/vehicles')
    } catch (error) {
      console.error('Error updating vehicle:', error)
      alert(`Failed to update vehicle: ${error}`)
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