'use client'

import { useState } from 'react'
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
  Calendar,
  Gauge,
  Shield,
  Phone,
  Mail
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { formatPrice } from '@/lib/utils'

// Mock data - in real app this would come from API
const mockVehicle = {
  id: '1',
  name: 'Mercedes Sprinter 3500',
  slug: 'mercedes-sprinter-3500',
  price: 75000,
  category: 'Commercial Vans',
  status: 'AVAILABLE',
  images: [
    '/images/truck1.jpg',
    '/images/truck2.jpg',
    '/images/truck3.jpg',
    '/images/truck4.jpg'
  ],
  description: 'The Mercedes Sprinter 3500 is a versatile commercial van that combines efficiency, reliability, and comfort. Perfect for cargo transport, passenger service, or mobile business operations.',
  keyHighlights: [
    'Advanced safety systems',
    'Fuel-efficient diesel engine',
    'Spacious cargo area',
    'Low maintenance costs',
    'Excellent resale value'
  ],
  specifications: {
    engine: '3.0L V6 Turbo Diesel',
    power: '188 HP',
    torque: '325 lb-ft',
    transmission: '9-Speed Automatic',
    fuelEconomy: '21 MPG Combined',
    payload: '4,354 lbs',
    towingCapacity: '7,500 lbs',
    seatingCapacity: '15 passengers',
    cargoVolume: '488 cubic feet',
    wheelbase: '170 inches',
    length: '273.4 inches',
    width: '79.1 inches',
    height: '109.4 inches'
  },
  features: [
    'Crosswind Assist',
    'Collision Prevention Assist',
    'Blind Spot Assist',
    'Lane Keeping Assist',
    'Attention Assist',
    'Electronic Stability Program',
    'Load-Adaptive ESP',
    'Hill Start Assist',
    'Parktronic with Rear View Camera',
    'MBUX Multimedia System',
    'Bluetooth Connectivity',
    'USB Ports',
    'Climate Control',
    'Power Windows & Locks',
    'Remote Keyless Entry'
  ]
}

const relatedVehicles = [
  {
    id: '2',
    name: 'Ford Transit 350',
    slug: 'ford-transit-350',
    price: 42000,
    image: '/images/truck2.jpg'
  },
  {
    id: '3',
    name: 'Ford F-650 Box Truck',
    slug: 'ford-f650-box-truck',
    price: 89000,
    image: '/images/truck3.jpg'
  },
  {
    id: '4',
    name: 'Freightliner Cascadia',
    slug: 'freightliner-cascadia',
    price: 165000,
    image: '/images/truck4.jpg'
  }
]

export default function VehicleDetailPage({ params }: { params: { slug: string } }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [activeTab, setActiveTab] = useState('overview')
  const [isSaved, setIsSaved] = useState(false)
  const [inquiryForm, setInquiryForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  })

  // In real app, fetch vehicle by slug
  const vehicle = mockVehicle

  if (!vehicle) {
    notFound()
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % vehicle.images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + vehicle.images.length) % vehicle.images.length)
  }

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Inquiry submitted:', inquiryForm)
    // In real app, submit to API
    alert('Inquiry submitted successfully!')
    setInquiryForm({ name: '', email: '', phone: '', message: '' })
  }

  return (
    <div className="min-h-screen pt-20 bg-background">
      {/* Breadcrumb */}
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-gray-600 transition-colors">Home</Link>
          <ChevronRight className="h-4 w-4" />
          <Link href="/vehicles" className="hover:text-gray-600 transition-colors">Vehicles</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-white">{vehicle.name}</span>
        </nav>
      </div>

      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column - Images */}
          <div className="lg:col-span-2">
            {/* Main Image */}
            <div className="relative aspect-[4/3] mb-6 rounded-lg overflow-hidden">
              <Image
                src={vehicle.images[currentImageIndex]}
                alt={vehicle.name}
                fill
                className="object-cover"
              />
              
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

              {/* Save button */}
              <button
                onClick={() => setIsSaved(!isSaved)}
                className="absolute top-4 left-4 w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
              >
                <Heart className={`h-5 w-5 ${isSaved ? 'fill-gray-600 text-gray-600' : ''}`} />
              </button>
            </div>

            {/* Thumbnail Images */}
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
                    {vehicle.description}
                  </p>
                  
                  <h3 className="text-xl font-semibold text-white mb-4">Key Highlights</h3>
                  <ul className="space-y-2">
                    {vehicle.keyHighlights.map((highlight, index) => (
                      <li key={index} className="flex items-center text-muted-foreground">
                        <div className="w-2 h-2 bg-gray-900 rounded-full mr-3" />
                        {highlight}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {activeTab === 'specs' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(vehicle.specifications).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-3 border-b border-gray-700">
                      <span className="text-muted-foreground capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}:
                      </span>
                      <span className="text-white font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'features' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {vehicle.features.map((feature, index) => (
                    <div key={index} className="flex items-center text-muted-foreground">
                      <Shield className="h-4 w-4 text-gray-600 mr-3" />
                      {feature}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Info & Form */}
          <div className="space-y-8">
            {/* Vehicle Info */}
            <div>
              <div className="mb-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-600/20 text-green-400">
                  {vehicle.status === 'AVAILABLE' ? 'Available' : 'Reserved'}
                </span>
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">{vehicle.name}</h1>
              <p className="text-muted-foreground mb-4">{vehicle.category}</p>
              <p className="text-4xl font-bold text-gray-900 mb-6">{formatPrice(vehicle.price)}</p>

              {/* Key Specs */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <Fuel className="h-6 w-6 text-gray-600 mx-auto mb-2" />
                  <div className="text-sm text-muted-foreground mb-1">Fuel Economy</div>
                  <div className="text-white font-semibold">{vehicle.specifications.fuelEconomy}</div>
                </div>
                <div className="text-center">
                  <Users className="h-6 w-6 text-gray-600 mx-auto mb-2" />
                  <div className="text-sm text-muted-foreground mb-1">Seating</div>
                  <div className="text-white font-semibold">{vehicle.specifications.seatingCapacity}</div>
                </div>
                <div className="text-center">
                  <Weight className="h-6 w-6 text-gray-600 mx-auto mb-2" />
                  <div className="text-sm text-muted-foreground mb-1">Payload</div>
                  <div className="text-white font-semibold">{vehicle.specifications.payload}</div>
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
                  />
                  <Input
                    type="email"
                    placeholder="Email Address"
                    value={inquiryForm.email}
                    onChange={(e) => setInquiryForm({ ...inquiryForm, email: e.target.value })}
                    required
                  />
                  <Input
                    type="tel"
                    placeholder="Phone Number"
                    value={inquiryForm.phone}
                    onChange={(e) => setInquiryForm({ ...inquiryForm, phone: e.target.value })}
                  />
                  <textarea
                    className="input min-h-[100px] resize-none"
                    placeholder="Message or questions..."
                    value={inquiryForm.message}
                    onChange={(e) => setInquiryForm({ ...inquiryForm, message: e.target.value })}
                    rows={4}
                  />
                  <Button type="submit" className="w-full">
                    <Mail className="h-4 w-4 mr-2" />
                    Send Inquiry
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
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-black mb-8">Related Vehicles</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 ">
            {relatedVehicles.map((vehicle) => (
              <Link key={vehicle.id} href={`/vehicles/${vehicle.slug}`} className="group">
                <div className="card-hover bg-gray-300/50 border-gray-800 overflow-hidden">
                  <div className="relative aspect-[4/3]">
                    <Image
                      src={vehicle.image}
                      alt={vehicle.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <div className="p-6 ">
                    <h3 className="text-lg font-semibold text-black  mb-2 group-hover:text-gray-600 transition-colors">
                      {vehicle.name}
                    </h3>
                    <p className="text-2xl font-bold text-gray-900">{formatPrice(vehicle.price)}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}