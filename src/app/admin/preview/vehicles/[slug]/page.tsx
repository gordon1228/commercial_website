'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { Eye, Edit, ExternalLink, Power, PowerOff, Settings, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'
import Image from 'next/image'

interface Vehicle {
  id: string
  name: string
  slug: string
  description?: string
  price: number
  images: string[]
  status: string
  active: boolean
  year?: number
  make?: string
  model?: string
  mileage?: number
  fuelType?: string
  transmission?: string
  features?: string[]
  specs?: any
  category: {
    id: string
    name: string
    active: boolean
  }
  _count?: {
    inquiries: number
  }
}

export default function AdminPreviewVehicleDetailPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const slug = params.slug as string
  
  const [showAdminOverlay, setShowAdminOverlay] = useState(true)
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'ADMIN' && slug) {
      fetchVehicle()
    }
  }, [status, session, slug])

  const fetchVehicle = async () => {
    try {
      const response = await fetch(`/api/vehicles/slug/${slug}`)
      if (response.ok) {
        const data = await response.json()
        setVehicle(data)
      } else {
        console.error('Vehicle not found')
      }
    } catch (error) {
      console.error('Error fetching vehicle:', error)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return <div className="px-6 py-8">Loading...</div>
  }

  if (!session || session.user?.role !== 'ADMIN') {
    router.push('/admin/login')
    return null
  }

  if (!vehicle) {
    return (
      <div className="px-6 py-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Vehicle Not Found</h1>
        <Link href="/admin/vehicles">
          <Button>Back to Vehicle Management</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Admin Preview Header */}
      <div className="bg-blue-600 text-white p-4 sticky top-0 z-50">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Eye className="h-5 w-5" />
            <h1 className="text-lg font-semibold">Vehicle Preview: {vehicle.name}</h1>
            <span className="text-blue-200 text-sm">Admin View</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowAdminOverlay(!showAdminOverlay)}
            >
              {showAdminOverlay ? 'Hide' : 'Show'} Admin Tools
            </Button>
            <Link href={`/vehicles/${vehicle.slug}`} target="_blank">
              <Button variant="secondary" size="sm">
                <ExternalLink className="h-4 w-4 mr-2" />
                View Live
              </Button>
            </Link>
            <Link href="/admin/vehicles">
              <Button variant="outline" size="sm">
                Back to Vehicles
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Admin Overlay Panel */}
      {showAdminOverlay && (
        <div className="bg-yellow-50 border-b border-yellow-200 p-4">
          <div className="max-w-7xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  Vehicle Management: {vehicle.name}
                  {!vehicle.active && (
                    <span className="px-2 py-1 bg-orange-100 text-orange-800 text-sm rounded-full">
                      Inactive
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-white p-4 rounded-lg border">
                    <h4 className="font-medium text-gray-900">Status</h4>
                    <p className={`text-lg font-semibold ${
                      vehicle.status === 'AVAILABLE' ? 'text-green-600' :
                      vehicle.status === 'SOLD' ? 'text-red-600' : 'text-yellow-600'
                    }`}>
                      {vehicle.status}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border">
                    <h4 className="font-medium text-gray-900">Visibility</h4>
                    <p className={`text-lg font-semibold ${vehicle.active ? 'text-green-600' : 'text-orange-600'}`}>
                      {vehicle.active ? 'Public' : 'Hidden'}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border">
                    <h4 className="font-medium text-gray-900">Inquiries</h4>
                    <p className="text-lg font-semibold text-blue-600">
                      {vehicle._count?.inquiries || 0}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border">
                    <h4 className="font-medium text-gray-900">Category</h4>
                    <p className={`text-sm font-medium ${vehicle.category.active ? 'text-gray-900' : 'text-orange-600'}`}>
                      {vehicle.category.name}
                      {!vehicle.category.active && ' (Inactive)'}
                    </p>
                  </div>
                </div>

                {!vehicle.active && (
                  <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="text-sm text-orange-800 flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      This vehicle is inactive and hidden from public view
                    </p>
                  </div>
                )}

                <div className="flex gap-4">
                  <Link href={`/admin/vehicles/edit/${vehicle.id}`}>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Vehicle
                    </Button>
                  </Link>
                  <Link href={`/admin/inquiries?vehicleId=${vehicle.id}`}>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-2" />
                      View Inquiries ({vehicle._count?.inquiries || 0})
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Public Page Content */}
      <div className="min-h-screen pt-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Vehicle Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{vehicle.name}</h1>
            <p className="text-3xl font-bold text-blue-600 mb-4">{formatPrice(vehicle.price)}</p>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center">
                <span className={`w-3 h-3 rounded-full mr-2 ${
                  vehicle.status === 'AVAILABLE' ? 'bg-green-500' :
                  vehicle.status === 'SOLD' ? 'bg-red-500' : 'bg-yellow-500'
                }`}></span>
                {vehicle.status}
              </span>
              {vehicle.year && <span>Year: {vehicle.year}</span>}
              {vehicle.mileage && <span>Mileage: {vehicle.mileage.toLocaleString()} km</span>}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Image Gallery */}
            <div>
              <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden mb-4">
                {vehicle.images && vehicle.images.length > 0 && vehicle.images[currentImageIndex] ? (
                  <Image
                    src={vehicle.images[currentImageIndex]}
                    alt={vehicle.name}
                    width={600}
                    height={400}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No image available
                  </div>
                )}
              </div>
              
              {vehicle.images && vehicle.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {vehicle.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`aspect-video bg-gray-100 rounded overflow-hidden border-2 ${
                        index === currentImageIndex ? 'border-blue-500' : 'border-transparent'
                      }`}
                    >
                      <Image
                        src={image}
                        alt={`${vehicle.name} ${index + 1}`}
                        width={150}
                        height={100}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Vehicle Details */}
            <div>
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Vehicle Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {vehicle.make && (
                      <div>
                        <span className="text-sm text-gray-500">Make</span>
                        <p className="font-medium">{vehicle.make}</p>
                      </div>
                    )}
                    {vehicle.model && (
                      <div>
                        <span className="text-sm text-gray-500">Model</span>
                        <p className="font-medium">{vehicle.model}</p>
                      </div>
                    )}
                    {vehicle.year && (
                      <div>
                        <span className="text-sm text-gray-500">Year</span>
                        <p className="font-medium">{vehicle.year}</p>
                      </div>
                    )}
                    {vehicle.fuelType && (
                      <div>
                        <span className="text-sm text-gray-500">Fuel Type</span>
                        <p className="font-medium">{vehicle.fuelType}</p>
                      </div>
                    )}
                    {vehicle.transmission && (
                      <div>
                        <span className="text-sm text-gray-500">Transmission</span>
                        <p className="font-medium">{vehicle.transmission}</p>
                      </div>
                    )}
                    {vehicle.mileage && (
                      <div>
                        <span className="text-sm text-gray-500">Mileage</span>
                        <p className="font-medium">{vehicle.mileage.toLocaleString()} km</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {vehicle.description && (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed">{vehicle.description}</p>
                  </CardContent>
                </Card>
              )}

              {vehicle.features && vehicle.features.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Features</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {vehicle.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-sm">
                          <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}