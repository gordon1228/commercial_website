'use client'

import { useState, useEffect } from 'react'
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
  Mail
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { formatPrice } from '@/lib/utils'

interface Vehicle {
  id: string
  name: string
  slug: string
  description?: string
  price: number
  images: string[]
  status: string
  specifications?: Record<string, string>
  features?: string[]
  category: {
    id: string
    name: string
    slug: string
  }
}

interface VehicleResponse {
  vehicle: Vehicle
  relatedVehicles: Vehicle[]
}

export default function VehicleDetailPage({ params }: { params: { slug: string } }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [activeTab, setActiveTab] = useState('overview')
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

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        const response = await fetch(`/api/vehicles/slug/${params.slug}`)
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
    }

    fetchVehicle()
  }, [params.slug])

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

  const specifications = vehicle.specifications || {}
  const features = vehicle.features || []

  return (
    <div className="min-h-screen pt-20 bg-background">
      {/* Breadcrumb */}
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-gray-600 transition-colors">Home</Link>
          <ChevronRight className="h-4 w-4" />
          <Link href="/vehicles" className="hover:text-gray-600 transition-colors">Vehicles</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="hover:text-gray-600 transition-colors">{vehicle.name}</span>
        </nav>
      </div>

      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column - Images */}
          <div className="lg:col-span-2">
            {/* Main Image */}
            {vehicle.images.length > 0 && (
              <div className="relative aspect-[4/3] mb-6 rounded-lg overflow-hidden">
                <Image
                  src={vehicle.images[currentImageIndex]}
                  alt={vehicle.name}
                  fill
                  className="object-cover"
                />
                
                {vehicle.images.length > 1 && (
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
            )}

            {/* Thumbnail Images */}
            {vehicle.images.length > 1 && (
              <div className="grid grid-cols-4 gap-3 mb-8">
                {vehicle.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`aspect-square rounded-md overflow-hidden border-2 transition-colors ${
                      currentImageIndex === index ? 'border-gray-900' : 'border-gray-700 hover:border-gray-600'
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
            <div className="border-b border-gray-700 mb-6">
              <nav className="flex space-x-8">
                {[
                  { id: 'overview', label: 'Overview' },
                  { id: 'specs', label: 'Specifications' },
                  { id: 'features', label: 'Features' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-2 border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-gray-900 text-gray-900'
                        : 'border-transparent text-muted-foreground hover:text-white hover:border-gray-600'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="space-y-6">
              {activeTab === 'overview' && (
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Description</h3>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    {vehicle.description || 'No description available.'}
                  </p>
                </div>
              )}

              {activeTab === 'specs' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.keys(specifications).length > 0 ? (
                    Object.entries(specifications).map(([key, value]) => (
                      <div key={key} className="flex justify-between py-3 border-b border-gray-700">
                        <span className="text-muted-foreground capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}:
                        </span>
                        <span className="text-white font-medium">{value as string}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground col-span-2">No specifications available.</p>
                  )}
                </div>
              )}

              {activeTab === 'features' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {features.length > 0 ? (
                    features.map((feature, index) => (
                      <div key={index} className="flex items-center text-muted-foreground">
                        <Shield className="h-4 w-4 text-gray-600 mr-3" />
                        {feature}
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground col-span-2">No features listed.</p>
                  )}
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
              </div>
              <h1 className="text-3xl font-bold text-black mb-2">{vehicle.name}</h1>
              <p className="text-muted-foreground mb-4">{vehicle.category.name}</p>
              <p className="text-4xl font-bold text-gray-900 mb-6">{formatPrice(vehicle.price)}</p>

              {/* Key Specs */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <Fuel className="h-6 w-6 text-gray-600 mx-auto mb-2" />
                  <div className="text-sm text-muted-foreground mb-1">Fuel Economy</div>
                  <div className="text-white font-semibold">
                    {specifications.fuel || specifications.fuelEconomy || 'N/A'}
                  </div>
                </div>
                <div className="text-center">
                  <Users className="h-6 w-6 text-gray-600 mx-auto mb-2" />
                  <div className="text-sm text-muted-foreground mb-1">Capacity</div>
                  <div className="text-white font-semibold">
                    {specifications.capacity || specifications.seatingCapacity || 'N/A'}
                  </div>
                </div>
                <div className="text-center">
                  <Weight className="h-6 w-6 text-gray-600 mx-auto mb-2" />
                  <div className="text-sm text-muted-foreground mb-1">Weight</div>
                  <div className="text-white font-semibold">
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
                    <Phone className="h-5 w-5 text-gray-600 mr-3" />
                    <div>
                      <div className="text-sm text-gray-600">Sales</div>
                      <div className="text-black font-medium">+1 (555) 123-4567</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 text-gray-600 mr-3" />
                    <div>
                      <div className="text-sm text-gray-600">Email</div>
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
              {relatedVehicles.map((relatedVehicle) => (
                <Link key={relatedVehicle.id} href={`/vehicles/${relatedVehicle.slug}`} className="group">
                  <div className="card-hover bg-gray-300/50 border-gray-800 overflow-hidden">
                    <div className="relative aspect-[4/3]">
                      <Image
                        src={relatedVehicle.images[0] || '/images/truck1.jpg'}
                        alt={relatedVehicle.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-black mb-2 group-hover:text-gray-600 transition-colors">
                        {relatedVehicle.name}
                      </h3>
                      <p className="text-2xl font-bold text-gray-900">{formatPrice(relatedVehicle.price)}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}