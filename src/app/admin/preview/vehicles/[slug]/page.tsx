'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  Heart,
  Fuel, 
  Users, 
  Weight,
  Shield,
  Phone,
  Mail,
  Edit,
  ExternalLink,
  Settings
  // AlertTriangle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { formatPrice } from '@/lib/utils'
import VehicleSpecsTable from '@/components/vehicle-specs-table'

interface Vehicle {
  id: string
  name: string
  slug: string
  description?: string
  price: number
  images: string[]
  status: string
  specs?: Record<string, string>
  features?: string[]
  active: boolean
  category: {
    id: string
    name: string
    slug: string
  }
  isViewAll?: boolean
  categorySlug?: string
}

interface VehicleResponse {
  vehicle: Vehicle
  relatedVehicles: Vehicle[]
}

export default function AdminPreviewVehicleDetailPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const slug = params.slug as string
  
  const [showAdminOverlay, setShowAdminOverlay] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [activeTab, setActiveTab] = useState('description')
  const [isSaved, setIsSaved] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [relatedVehicles, setRelatedVehicles] = useState<Vehicle[]>([])
  const [inquiryForm, setInquiryForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  })

  const fetchVehicle = useCallback(async () => {
    try {
      const response = await fetch(`/api/vehicles/slug/${slug}`)
      if (!response.ok) {
        if (response.status === 404) {
          notFound()
        }
        throw new Error('Failed to fetch vehicle')
      }
      
      const data: VehicleResponse = await response.json()
      setVehicle(data.vehicle)
      setRelatedVehicles(data.relatedVehicles)
    } catch (error) {
      console.error('Error fetching vehicle:', error)
      notFound()
    } finally {
      setIsLoading(false)
    }
  }, [slug])

  useEffect(() => {
    if (status === 'loading') return
    if (!session || !['ADMIN', 'MANAGER'].includes(session.user?.role || '')) {
      router.push('/admin/login')
      return
    }

    fetchVehicle()
  }, [session, status, router, slug, fetchVehicle])

  const nextImage = () => {
    if (!vehicle) return
    setCurrentImageIndex((prev) => (prev + 1) % vehicle.images.length)
  }

  const prevImage = () => {
    if (!vehicle) return
    setCurrentImageIndex((prev) => (prev - 1 + vehicle.images.length) % vehicle.images.length)
  }

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!vehicle) return

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/inquiries/vehicle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...inquiryForm,
          vehicleId: vehicle.id,
          vehicleSlug: vehicle.slug,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit inquiry')
      }

      alert('Inquiry submitted successfully! We will contact you soon.')
      setInquiryForm({ name: '', email: '', phone: '', message: '' })
    } catch (error) {
      console.error('Error submitting inquiry:', error)
      alert('Failed to submit inquiry. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen pt-20 bg-background">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2">
                <div className="aspect-[4/3] bg-gray-200 rounded-lg mb-6" />
                <div className="grid grid-cols-4 gap-3 mb-8">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="aspect-square bg-gray-200 rounded-md" />
                  ))}
                </div>
                <div className="space-y-4">
                  <div className="h-8 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded" />
                  <div className="h-4 bg-gray-200 rounded w-5/6" />
                </div>
              </div>
              <div className="space-y-8">
                <div className="space-y-4">
                  <div className="h-8 bg-gray-200 rounded w-1/2" />
                  <div className="h-12 bg-gray-200 rounded w-3/4" />
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
          </div>
        </div>
      </div>
    )
  }

  if (!vehicle) {
    notFound()
  }

  const specifications = vehicle.specs || {}
  const features = vehicle.features || []

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      {showAdminOverlay && (
        <div className="bg-blue-600 text-white">
          <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Settings className="h-5 w-5" />
                <div>
                  <h1 className="text-lg font-semibold">Admin Preview: {vehicle.name}</h1>
                  <span className="text-blue-200 text-sm">Preview Mode</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAdminOverlay(false)}
                  className="text-black border-white hover:bg-white hover:text-blue-600"
                >
                  Hide Admin Bar
                </Button>
                <Link href={`/vehicles/${vehicle.slug}`} target="_blank">
                  <Button variant="outline" size="sm" className="text-black border-white hover:bg-white hover:text-blue-600">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Live
                  </Button>
                </Link>
                <Link href={`/admin/vehicles/edit/${vehicle.id}`}>
                  <Button variant="outline" size="sm" className="text-black border-white hover:bg-white hover:text-blue-600">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Vehicle
                  </Button>
                </Link>
                <Link href="/admin/vehicles">
                  <Button variant="outline" size="sm" className="text-black border-white hover:bg-white hover:text-blue-600">
                    Back to Admin
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Show Admin Bar Toggle when hidden */}
      {!showAdminOverlay && (
        <div className="fixed top-4 right-4 z-50">
          <Button
            onClick={() => setShowAdminOverlay(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
            size="sm"
          >
            <Settings className="h-4 w-4 mr-2" />
            Admin Tools
          </Button>
        </div>
      )}

      <div className={`${showAdminOverlay ? 'pt-4' : 'pt-20'}`}>
        {/* Breadcrumb */}
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center space-x-2 text-sm text-black">
            <Link href="/" className="hover:text-black transition-colors">Home</Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/vehicles" className="hover:text-black transition-colors">Vehicles</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="hover:text-black transition-colors">{vehicle.name}</span>
          </nav>
        </div>

        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Left Column - Images */}
            <div className="lg:col-span-2">
              {/* Main Image */}
              <div className="relative aspect-[4/3] mb-6 rounded-lg overflow-hidden bg-gray-100">
                {vehicle.images.length > 0 && vehicle.images[0] && vehicle.images[0].trim() !== '' ? (
                  <Image
                    src={vehicle.images[currentImageIndex]}
                    alt={vehicle.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <div className="text-8xl mb-4">📷</div>
                      <div className="text-xl font-medium">No Image Available</div>
                    </div>
                  </div>
                )}
                
                {vehicle.images.length > 1 && vehicle.images[0] && vehicle.images[0].trim() !== '' && (
                  <>
                    {/* Navigation arrows */}
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>

                    {/* Image counter */}
                    <div className="absolute top-4 right-4 px-3 py-1 bg-black/50 backdrop-blur-sm rounded-full text-white text-sm">
                      {currentImageIndex + 1} / {vehicle.images.length}
                    </div>
                  </>
                )}

                {/* Save button */}
                <button
                  onClick={() => setIsSaved(!isSaved)}
                  className="absolute top-4 left-4 w-10 h-10 bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center text-white"
                >
                  <Heart className={`h-5 w-5 ${isSaved ? 'fill-red-600 text-red-600' : ''}`} />
                </button>
              </div>

              {/* Thumbnail Images */}
              {vehicle.images.length > 1 && vehicle.images[0] && vehicle.images[0].trim() !== '' && (
                <div className="grid grid-cols-4 gap-3 mb-8">
                  {vehicle.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`aspect-square rounded-md overflow-hidden border-2 transition-colors ${
                        currentImageIndex === index ? 'border-gray-900' : 'border-gray-300 hover:border-gray-600'
                      }`}
                    >
                      <Image
                        src={image}
                        alt={`${vehicle.name} ${index + 1}`}
                        width={120}
                        height={120}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Tabs */}
              <div className="border-b border-gray-200 mb-6">
                <nav className="flex space-x-8 overflow-x-auto">
                  {[
                    { id: 'description', label: 'Description' },
                    { id: 'performance', label: 'Performance' },
                    { id: 'features', label: 'Useful Features' },
                    { id: 'interior', label: 'Interior' },
                    { id: 'safety', label: 'Safety' },
                    { id: 'specs', label: 'Specifications' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-4 px-2 border-b-2 transition-colors ${
                        activeTab === tab.id
                          ? 'border-gray-900 text-gray-900'
                          : 'border-transparent text-black hover:text-black hover:border-gray-600'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="space-y-6">
                {activeTab === 'description' && (
                  <div>
                    <h3 className="text-xl font-semibold text-black mb-4">Vehicle Description</h3>
                    <p className="text-black leading-relaxed">
                      {vehicle.description || 'No description available.'}
                    </p>
                  </div>
                )}

                {activeTab === 'performance' && (
                  <div className="space-y-8">
                    {/* Engine & Power Section */}
                    <div>
                      <h4 className="text-lg font-semibold text-black mb-4 flex items-center">
                        <Fuel className="h-5 w-5 mr-2 text-blue-400" />
                        Engine & Power
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {specifications.engine && (
                          <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                            <div className="text-sm text-blue-600 font-medium">Engine Type</div>
                            <div className="text-gray-900 font-semibold mt-1">{specifications.engine}</div>
                          </div>
                        )}
                        {specifications.horsepower && (
                          <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                            <div className="text-sm text-blue-600 font-medium">Horsepower</div>
                            <div className="text-gray-900 font-semibold mt-1">{specifications.horsepower} HP</div>
                          </div>
                        )}
                        {specifications.torque && (
                          <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                            <div className="text-sm text-blue-600 font-medium">Torque</div>
                            <div className="text-gray-900 font-semibold mt-1">{specifications.torque}</div>
                          </div>
                        )}
                        {specifications.displacement && (
                          <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                            <div className="text-sm text-blue-600 font-medium">Engine Displacement</div>
                            <div className="text-gray-900 font-semibold mt-1">{specifications.displacement}</div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Transmission & Drivetrain */}
                    <div>
                      <h4 className="text-lg font-semibold text-black mb-4">Transmission & Drivetrain</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {specifications.transmission && (
                          <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                            <div className="text-sm text-blue-600 font-medium">Transmission</div>
                            <div className="text-gray-900 font-semibold mt-1">{specifications.transmission}</div>
                          </div>
                        )}
                        {specifications.drivetrain && (
                          <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                            <div className="text-sm text-blue-600 font-medium">Drivetrain</div>
                            <div className="text-gray-900 font-semibold mt-1">{specifications.drivetrain}</div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Fuel Economy */}
                    <div>
                      <h4 className="text-lg font-semibold text-black mb-4">Fuel Economy</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {specifications.fuel && (
                          <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                            <div className="text-sm text-blue-600 font-medium">Fuel Economy</div>
                            <div className="text-gray-900 font-semibold mt-1">{specifications.fuel} MPG</div>
                          </div>
                        )}
                        {specifications.fuelCapacity && (
                          <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                            <div className="text-sm text-blue-600 font-medium">Fuel Tank Capacity</div>
                            <div className="text-gray-900 font-semibold mt-1">{specifications.fuelCapacity}</div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Show message if no performance data */}
                    {(!specifications.engine && !specifications.horsepower && !specifications.fuel) && (
                      <div className="text-center py-12">
                        <Fuel className="h-16 w-16 text-black mx-auto mb-4" />
                        <p className="text-black">No performance data available for this vehicle.</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'features' && (
                  <div className="space-y-8">
                    {/* Convenience Features */}
                    <div>
                      <h4 className="text-lg font-semibold text-black mb-4 flex items-center">
                        <Shield className="h-5 w-5 mr-2 text-green-400" />
                        Convenience & Comfort Features
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {features.length > 0 ? (
                          features.slice(0, Math.ceil(features.length / 2)).map((feature, index) => (
                            <div key={index} className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm flex items-center">
                              <Shield className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
                              <span className="text-gray-900 font-medium">{feature}</span>
                            </div>
                          ))
                        ) : (
                          <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                            <span className="text-black">Standard comfort features available</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Technology Features */}
                    {features.length > 2 && (
                      <div>
                        <h4 className="text-lg font-semibold text-black mb-4 flex items-center">
                          <Users className="h-5 w-5 mr-2 text-purple-400" />
                          Technology & Connectivity
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {features.slice(Math.ceil(features.length / 2)).map((feature, index) => (
                            <div key={index} className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm flex items-center">
                              <Users className="h-5 w-5 text-purple-600 mr-3 flex-shrink-0" />
                              <span className="text-gray-900 font-medium">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Additional Features from Specs */}
                    {(specifications.features || specifications.technology || specifications.comfort) && (
                      <div>
                        <h4 className="text-lg font-semibold text-black mb-4">Additional Features</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {specifications.features && (
                            <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                              <div className="text-sm text-green-600 font-medium">Special Features</div>
                              <div className="text-gray-900 font-semibold mt-1">{specifications.features}</div>
                            </div>
                          )}
                          {specifications.technology && (
                            <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                              <div className="text-sm text-green-600 font-medium">Technology</div>
                              <div className="text-gray-900 font-semibold mt-1">{specifications.technology}</div>
                            </div>
                          )}
                          {specifications.comfort && (
                            <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                              <div className="text-sm text-green-600 font-medium">Comfort</div>
                              <div className="text-gray-900 font-semibold mt-1">{specifications.comfort}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Show message if no features */}
                    {features.length === 0 && !specifications.features && !specifications.technology && (
                      <div className="text-center py-12">
                        <Shield className="h-16 w-16 text-black mx-auto mb-4" />
                        <p className="text-black">No feature information available for this vehicle.</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'interior' && (
                  <div className="space-y-8">
                    {/* Seating & Space */}
                    <div>
                      <h4 className="text-lg font-semibold text-black mb-4 flex items-center">
                        <Users className="h-5 w-5 mr-2 text-orange-600" />
                        Seating & Space
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {specifications.capacity && (
                          <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                            <div className="text-sm text-orange-600 font-medium">Seating Capacity</div>
                            <div className="text-gray-900 font-semibold mt-1">{specifications.capacity}</div>
                          </div>
                        )}
                        {specifications.seatingCapacity && (
                          <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                            <div className="text-sm text-orange-600 font-medium">Total Seats</div>
                            <div className="text-gray-900 font-semibold mt-1">{specifications.seatingCapacity}</div>
                          </div>
                        )}
                        {specifications.cabinSpace && (
                          <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                            <div className="text-sm text-orange-600 font-medium">Cabin Space</div>
                            <div className="text-gray-900 font-semibold mt-1">{specifications.cabinSpace}</div>
                          </div>
                        )}
                        {specifications.legRoom && (
                          <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                            <div className="text-sm text-orange-600 font-medium">Leg Room</div>
                            <div className="text-gray-900 font-semibold mt-1">{specifications.legRoom}</div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Interior Comfort */}
                    <div>
                      <h4 className="text-lg font-semibold text-black mb-4">Interior Comfort</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {specifications.interior && (
                          <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                            <div className="text-sm text-orange-600 font-medium">Interior Features</div>
                            <div className="text-gray-900 font-semibold mt-1">{specifications.interior}</div>
                          </div>
                        )}
                        {specifications.comfort && (
                          <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                            <div className="text-sm text-orange-600 font-medium">Comfort Features</div>
                            <div className="text-gray-900 font-semibold mt-1">{specifications.comfort}</div>
                          </div>
                        )}
                        {specifications.airConditioning && (
                          <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                            <div className="text-sm text-orange-600 font-medium">Climate Control</div>
                            <div className="text-gray-900 font-semibold mt-1">{specifications.airConditioning}</div>
                          </div>
                        )}
                        {specifications.upholstery && (
                          <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                            <div className="text-sm text-orange-600 font-medium">Upholstery</div>
                            <div className="text-gray-900 font-semibold mt-1">{specifications.upholstery}</div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Dashboard & Controls */}
                    <div>
                      <h4 className="text-lg font-semibold text-black mb-4">Dashboard & Controls</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {specifications.dashboard && (
                          <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                            <div className="text-sm text-orange-600 font-medium">Dashboard Features</div>
                            <div className="text-gray-900 font-semibold mt-1">{specifications.dashboard}</div>
                          </div>
                        )}
                        {specifications.infotainment && (
                          <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                            <div className="text-sm text-orange-600 font-medium">Infotainment System</div>
                            <div className="text-gray-900 font-semibold mt-1">{specifications.infotainment}</div>
                          </div>
                        )}
                        {specifications.storage && (
                          <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                            <div className="text-sm text-orange-600 font-medium">Storage</div>
                            <div className="text-gray-900 font-semibold mt-1">{specifications.storage}</div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Show message if no interior data */}
                    {(!specifications.capacity && !specifications.seatingCapacity && !specifications.interior && !specifications.comfort) && (
                      <div className="text-center py-12">
                        <Users className="h-16 w-16 text-black mx-auto mb-4" />
                        <p className="text-black">No interior information available for this vehicle.</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'safety' && (
                  <div className="space-y-8">
                    {/* Active Safety Systems */}
                    <div>
                      <h4 className="text-lg font-semibold text-black mb-4 flex items-center">
                        <Shield className="h-5 w-5 mr-2 text-red-600" />
                        Active Safety Systems
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {specifications.abs && (
                          <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                            <div className="text-sm text-red-600 font-medium">Anti-lock Braking System</div>
                            <div className="text-gray-900 font-semibold mt-1">{specifications.abs}</div>
                          </div>
                        )}
                        {specifications.esc && (
                          <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                            <div className="text-sm text-red-600 font-medium">Electronic Stability Control</div>
                            <div className="text-gray-900 font-semibold mt-1">{specifications.esc}</div>
                          </div>
                        )}
                        {specifications.tcs && (
                          <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                            <div className="text-sm text-red-600 font-medium">Traction Control System</div>
                            <div className="text-gray-900 font-semibold mt-1">{specifications.tcs}</div>
                          </div>
                        )}
                        {specifications.brakes && (
                          <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                            <div className="text-sm text-red-600 font-medium">Braking System</div>
                            <div className="text-gray-900 font-semibold mt-1">{specifications.brakes}</div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Passive Safety Features */}
                    <div>
                      <h4 className="text-lg font-semibold text-black mb-4">Passive Safety Features</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {specifications.airbags && (
                          <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                            <div className="text-sm text-red-600 font-medium">Airbag System</div>
                            <div className="text-gray-900 font-semibold mt-1">{specifications.airbags}</div>
                          </div>
                        )}
                        {specifications.seatbelts && (
                          <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                            <div className="text-sm text-red-600 font-medium">Seatbelt System</div>
                            <div className="text-gray-900 font-semibold mt-1">{specifications.seatbelts}</div>
                          </div>
                        )}
                        {specifications.crumpleZones && (
                          <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                            <div className="text-sm text-red-600 font-medium">Crumple Zones</div>
                            <div className="text-gray-900 font-semibold mt-1">{specifications.crumpleZones}</div>
                          </div>
                        )}
                        {specifications.reinforcement && (
                          <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                            <div className="text-sm text-red-600 font-medium">Chassis Reinforcement</div>
                            <div className="text-gray-900 font-semibold mt-1">{specifications.reinforcement}</div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Safety Ratings & Compliance */}
                    <div>
                      <h4 className="text-lg font-semibold text-black mb-4">Safety Ratings & Compliance</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {specifications.safetyRating && (
                          <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                            <div className="text-sm text-red-600 font-medium">Safety Rating</div>
                            <div className="text-gray-900 font-semibold mt-1">{specifications.safetyRating}</div>
                          </div>
                        )}
                        {specifications.rating && (
                          <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                            <div className="text-sm text-red-600 font-medium">Overall Rating</div>
                            <div className="text-gray-900 font-semibold mt-1">{specifications.rating}</div>
                          </div>
                        )}
                        {specifications.safety && (
                          <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                            <div className="text-sm text-red-600 font-medium">Safety Features</div>
                            <div className="text-gray-900 font-semibold mt-1">{specifications.safety}</div>
                          </div>
                        )}
                        {specifications.compliance && (
                          <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                            <div className="text-sm text-red-600 font-medium">Compliance Standards</div>
                            <div className="text-gray-900 font-semibold mt-1">{specifications.compliance}</div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Show message if no safety data */}
                    {(!specifications.safety && !specifications.airbags && !specifications.brakes && !specifications.abs && !specifications.rating) && (
                      <div className="text-center py-12">
                        <Shield className="h-16 w-16 text-black mx-auto mb-4" />
                        <p className="text-black">No safety information available for this vehicle.</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'specs' && (
                  <div className="space-y-8">
                    <VehicleSpecsTable specs={specifications} vehicleName={vehicle.name} />
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Info & Form */}
            <div className="space-y-8">
              {/* Vehicle Info */}
              <div>
                <div className="mb-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    vehicle.status === 'AVAILABLE' 
                      ? 'bg-green-600/20 text-green-600' 
                      : vehicle.status === 'RESERVED'
                      ? 'bg-yellow-600/20 text-yellow-600'
                      : 'bg-red-600/20 text-red-600'
                  }`}>
                    {vehicle.status === 'AVAILABLE' ? 'Available' : 
                     vehicle.status === 'RESERVED' ? 'Reserved' : 'Sold'}
                  </span>
                  {!vehicle.active && (
                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      Inactive
                    </span>
                  )}
                </div>
                <h1 className="text-3xl font-bold text-black mb-2">{vehicle.name}</h1>
                <p className="text-black mb-4">{vehicle.category.name}</p>
                <p className="text-4xl font-bold text-gray-900 mb-6">{formatPrice(vehicle.price)}</p>

                {/* Key Specs */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <Fuel className="h-6 w-6 text-black mx-auto mb-2" />
                    <div className="text-sm text-black mb-1">Fuel Economy</div>
                    <div className="text-black font-semibold">
                      {specifications.fuel || specifications.fuelEconomy || 'N/A'}
                    </div>
                  </div>
                  <div className="text-center">
                    <Users className="h-6 w-6 text-black mx-auto mb-2" />
                    <div className="text-sm text-black mb-1">Capacity</div>
                    <div className="text-black font-semibold">
                      {specifications.capacity || specifications.seatingCapacity || 'N/A'}
                    </div>
                  </div>
                  <div className="text-center">
                    <Weight className="h-6 w-6 text-black mx-auto mb-2" />
                    <div className="text-sm text-black mb-1">Weight</div>
                    <div className="text-black font-semibold">
                      {specifications.weight || specifications.payload || 'N/A'}
                    </div>
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="space-y-3">
                  <Button className="w-full" size="lg">
                    <Phone className="h-4 w-4 mr-2" />
                    Call for Quote
                  </Button>
                  <Button variant="secondary" className="w-full" size="lg">
                    <Eye className="h-4 w-4 mr-2" />
                    Schedule Test Drive
                  </Button>
                </div>
              </div>

              {/* Inquiry Form */}
              <Card className="bg-gray-300/50 border-gray-400">
                <CardHeader>
                  <CardTitle className="text-black">Get Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleInquirySubmit} className="space-y-4">
                    <Input
                      placeholder="Your Name"
                      value={inquiryForm.name}
                      onChange={(e) => setInquiryForm({ ...inquiryForm, name: e.target.value })}
                      required
                      disabled={isSubmitting}
                    />
                    <Input
                      type="email"
                      placeholder="Email Address"
                      value={inquiryForm.email}
                      onChange={(e) => setInquiryForm({ ...inquiryForm, email: e.target.value })}
                      required
                      disabled={isSubmitting}
                    />
                    <Input
                      type="tel"
                      placeholder="Phone Number"
                      value={inquiryForm.phone}
                      onChange={(e) => setInquiryForm({ ...inquiryForm, phone: e.target.value })}
                      disabled={isSubmitting}
                    />
                    <textarea
                      className="input min-h-[100px] resize-none"
                      placeholder="Message or questions..."
                      value={inquiryForm.message}
                      onChange={(e) => setInquiryForm({ ...inquiryForm, message: e.target.value })}
                      rows={4}
                      required
                      disabled={isSubmitting}
                    />
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      <Mail className="h-4 w-4 mr-2" />
                      {isSubmitting ? 'Sending...' : 'Send Inquiry'}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Contact Info */}
              <Card className="bg-gray-300/50 border-gray-400">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <Phone className="h-5 w-5 text-black mr-3" />
                      <div>
                        <div className="text-sm text-black">Sales</div>
                        <div className="text-black font-medium">+1 (555) 123-4567</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Mail className="h-5 w-5 text-black mr-3" />
                      <div>
                        <div className="text-sm text-black">Email</div>
                        <div className="text-black font-medium">sales@elitefleet.com</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Related Vehicles */}
          {relatedVehicles.length > 0 && (
            <div className="mt-16">
              <h2 className="text-3xl font-bold text-black mb-8">Related Vehicles</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedVehicles.map((relatedVehicle) => {
                  // Handle "View All" special item
                  if (relatedVehicle.isViewAll) {
                    return (
                      <Link key={relatedVehicle.id} href={`/vehicles?category=${relatedVehicle.categorySlug}`} className="group">
                        <div className="card-hover bg-gray-300/50 border-gray-800 overflow-hidden">
                          <div className="relative aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                            <div className="text-center text-black">
                              <div className="text-6xl mb-4">🔍</div>
                              <div className="text-lg font-semibold">View All</div>
                              <div className="text-sm opacity-75">{relatedVehicle.category.name}</div>
                            </div>
                          </div>
                          <div className="p-6">
                            <h3 className="text-lg font-semibold text-black mb-2 group-hover:text-black transition-colors line-clamp-1">
                              Browse All {relatedVehicle.category.name}
                            </h3>
                            <p className="text-2xl font-bold text-gray-900">View All</p>
                          </div>
                        </div>
                      </Link>
                    )
                  }

                  // Handle regular vehicle items
                  return (
                    <Link key={relatedVehicle.id} href={`/admin/preview/vehicles/${relatedVehicle.slug}`} className="group">
                      <div className="card-hover bg-gray-300/50 border-gray-800 overflow-hidden">
                        <div className="relative aspect-[4/3] bg-gray-100">
                          {relatedVehicle.images[0] && relatedVehicle.images[0].trim() !== '' ? (
                            <Image
                              src={relatedVehicle.images[0]}
                              alt={relatedVehicle.name}
                              fill
                              className="object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-500">
                              <div className="text-center">
                                <div className="text-4xl mb-2">📷</div>
                                <div className="text-sm font-medium">No Image</div>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="p-6">
                          <h3 className="text-lg font-semibold text-black mb-2 group-hover:text-black transition-colors">
                            {relatedVehicle.name}
                          </h3>
                          <p className="text-2xl font-bold text-gray-900">{formatPrice(relatedVehicle.price)}</p>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}