'use client'


import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Send,
  MessageCircle,
  Calculator,
  Calendar,
  User
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { useJsonData } from '@/lib/data-loader'
import type { ContactInfoConfig } from '@/types/data-config'

interface ContactInfo {
  salesPhone: string
  servicePhone: string
  financePhone: string
  salesEmail: string
  serviceEmail: string
  supportEmail: string
  address: string
  city: string
  state: string
  postcode: string
  country: string
  directions: string
  mondayToFriday: string
  saturday: string
  sunday: string
}

const services = [
  {
    icon: MessageCircle,
    title: 'General Inquiry',
    description: 'Questions about our vehicles or services',
    color: 'bg-blue-600/20 text-blue-400'
  },
  {
    icon: Calculator,
    title: 'Get Quote',
    description: 'Request pricing for specific vehicles',
    color: 'bg-green-600/20 text-green-400'
  },
  {
    icon: Calendar,
    title: 'Schedule Visit',
    description: 'Book an appointment to view vehicles',
    color: 'bg-purple-600/20 text-purple-400'
  },
  {
    icon: User,
    title: 'Sales Support',
    description: 'Speak with our sales team',
    color: 'bg-orange-600/20 text-orange-400'
  }
]

function WhatsAppContact() {
  const searchParams = useSearchParams()
  const vehicleSlug = searchParams?.get('vehicle')
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  // Load fallback data from JSON
  const { data: fallbackData, loading: fallbackLoading } = useJsonData<ContactInfoConfig>('fallback/contact-info.json')

  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        const response = await fetch('/api/contact-info')
        if (response.ok) {
          const data = await response.json()
          setContactInfo(data)
        }
      } catch (error) {
        console.error('Error fetching contact info:', error)
        // Use fallback data from JSON if available
        if (fallbackData) {
          setContactInfo(fallbackData.contactInfo)
        }
      } finally {
        setIsLoading(false)
      }
    }

    // Only start fetching after fallback data is loaded (or failed to load)
    if (!fallbackLoading) {
      fetchContactInfo()
    }
  }, [fallbackData, fallbackLoading])

  const getWhatsAppNumber = () => {
    if (!contactInfo) return '+60103391414' // Default fallback
    
    // Clean phone number - remove spaces, dashes, parentheses
    const cleanNumber = contactInfo.salesPhone.replace(/[\s\-\(\)]/g, '')
    
    // If it starts with +, use as is
    if (cleanNumber.startsWith('+')) {
      return cleanNumber
    }
    
    // If it starts with 0, replace with +60 (Malaysia)
    if (cleanNumber.startsWith('0')) {
      return '+60' + cleanNumber.substring(1)
    }
    
    // Otherwise assume it's a Malaysian number without country code
    return '+60' + cleanNumber
  }

  const openWhatsApp = (inquiryType: string = 'general') => {
    const phoneNumber = getWhatsAppNumber()
    let message = `Hello! I'm interested in your commercial vehicles.`
    
    if (vehicleSlug) {
      message = `Hello! I'm interested in the ${vehicleSlug.replace(/-/g, ' ')} vehicle.`
    }
    
    // Add inquiry type context
    switch (inquiryType) {
      case 'quote':
        message += ` I would like to request a quote.`
        break
      case 'visit':
        message += ` I would like to schedule a visit to your showroom.`
        break
      case 'financing':
        message += ` I would like to know about financing options.`
        break
      case 'service':
        message += ` I need service support.`
        break
      default:
        message += ` I would like more information about your services.`
    }
    
    message += ` Thank you!`
    
    const encodedMessage = encodeURIComponent(message)
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`
    
    // Open WhatsApp in a new tab
    window.open(whatsappUrl, '_blank')
  }

  return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* WhatsApp Contact Section */}
          <div className="lg:col-span-2">
            <Card className="bg-gray-100 border-gray-300">
              <CardHeader>
                <CardTitle className="text-2xl text-gray-900">Contact us on WhatsApp</CardTitle>
                {vehicleSlug && (
                  <p className="text-gray-600">Inquiry about: {vehicleSlug.replace(/-/g, ' ')}</p>
                )}
                <p className="text-gray-600">Get instant response by chatting with us directly on WhatsApp</p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Quick Contact Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {services.map((service, index) => {
                    const IconComponent = service.icon
                    const inquiryType = service.title === 'General Inquiry' ? 'general' : 
                                      service.title === 'Get Quote' ? 'quote' :
                                      service.title === 'Schedule Visit' ? 'visit' : 'service'
                    
                    return (
                      <Button
                        key={index}
                        onClick={() => openWhatsApp(inquiryType)}
                        variant="outline"
                        className="h-auto p-4 flex flex-col items-center space-y-2 hover:bg-green-50 hover:border-green-300 border-2 transition-all duration-200"
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${service.color}`}>
                          <IconComponent className="h-5 w-5" />
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-gray-900">{service.title}</div>
                          <div className="text-xs text-gray-600">{service.description}</div>
                        </div>
                      </Button>
                    )
                  })}
                </div>

                {/* Main WhatsApp Button */}
                <div className="text-center py-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Start a conversation</h3>
                  <Button
                    onClick={() => openWhatsApp()}
                    size="lg"
                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    <MessageCircle className="h-6 w-6 mr-3" />
                    Chat on WhatsApp
                  </Button>
                  <p className="text-sm text-gray-600 mt-3">
                    Click to open WhatsApp and start chatting with our team
                  </p>
                </div>

                {/* Benefits */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">Why choose WhatsApp?</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <MessageCircle className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="font-medium text-gray-900">Instant Response</div>
                      <div className="text-gray-600">Get replies within minutes</div>
                    </div>
                    <div className="text-center">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Phone className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="font-medium text-gray-900">Easy to Use</div>
                      <div className="text-gray-600">No forms to fill out</div>
                    </div>
                    <div className="text-center">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Clock className="h-4 w-4 text-purple-600" />
                      </div>
                      <div className="font-medium text-gray-900">Available 24/7</div>
                      <div className="text-gray-600">Message us anytime</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            {(isLoading || fallbackLoading) ? (
              <div className="animate-pulse space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-gray-200 h-32 rounded-lg" />
                ))}
              </div>
            ) : contactInfo ? (
              <>
                <Card className="bg-gray-100 border-gray-300">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mr-4">
                        <Phone className="h-5 w-5 text-gray-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Phone</h3>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600 text-sm">Sales:</span>
                        <span className="text-gray-900 text-sm font-medium">{contactInfo.salesPhone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 text-sm">Service:</span>
                        <span className="text-gray-900 text-sm font-medium">{contactInfo.servicePhone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 text-sm">Finance:</span>
                        <span className="text-gray-900 text-sm font-medium">{contactInfo.financePhone}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-100 border-gray-300">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mr-4">
                        <Mail className="h-5 w-5 text-gray-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Email</h3>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600 text-sm">Sales:</span>
                        <span className="text-gray-900 text-sm font-medium">{contactInfo.salesEmail}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 text-sm">Service:</span>
                        <span className="text-gray-900 text-sm font-medium">{contactInfo.serviceEmail}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 text-sm">Support:</span>
                        <span className="text-gray-900 text-sm font-medium">{contactInfo.supportEmail}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-100 border-gray-300">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mr-4">
                        <MapPin className="h-5 w-5 text-gray-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Location</h3>
                    </div>
                    <div className="space-y-2">
                      <div className="text-gray-900 text-sm font-medium">
                        {contactInfo.address}<br />
                        {contactInfo.city}, {contactInfo.state} {contactInfo.postcode}<br />
                        {contactInfo.country}
                      </div>
                      {contactInfo.directions && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 text-sm">Directions:</span>
                          <span className="text-gray-900 text-sm font-medium">{contactInfo.directions}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-100 border-gray-300">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mr-4">
                        <Clock className="h-5 w-5 text-gray-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Hours</h3>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600 text-sm">Mon - Fri:</span>
                        <span className="text-gray-900 text-sm font-medium">{contactInfo.mondayToFriday}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 text-sm">Saturday:</span>
                        <span className="text-gray-900 text-sm font-medium">{contactInfo.saturday}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 text-sm">Sunday:</span>
                        <span className="text-gray-900 text-sm font-medium">{contactInfo.sunday}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <div className="text-center py-8 text-gray-600">
                Unable to load contact information
              </div>
            )}

            {/* Quick Response Promise */}
            <Card className="bg-gray-100 border-gray-300">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-6 w-6 text-gray-700" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Quick Response</h3>
                <p className="text-gray-700 text-sm">
                  We respond to all inquiries within 24 hours during business days
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
  )
}

export default function ContactPage() {
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null)

  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        const response = await fetch('/api/contact-info')
        if (response.ok) {
          const data = await response.json()
          setContactInfo(data)
        }
      } catch (error) {
        console.error('Error fetching contact info:', error)
        setContactInfo({
          salesPhone: '+1 (555) 123-4567',
          servicePhone: '+1 (555) 123-4568',
          financePhone: '+1 (555) 123-4569',
          salesEmail: 'sales@elitefleet.com',
          serviceEmail: 'service@elitefleet.com',
          supportEmail: 'support@elitefleet.com',
          address: '123 Business Avenue',
          city: 'Commercial District',
          state: 'NY',
          postcode: '10001',
          country: 'United States',
          directions: 'Near Metro Station',
          mondayToFriday: '8:00 AM - 6:00 PM',
          saturday: '9:00 AM - 4:00 PM',
          sunday: 'Closed'
        })
      }
    }

    fetchContactInfo()
  }, [])

  return (
    <div className="min-h-screen pt-20 bg-background">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-6">
            Contact Us
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Ready to find your perfect commercial vehicle? Get in touch with our expert team for personalized assistance and competitive quotes.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {services.map((service, index) => {
            const IconComponent = service.icon
            return (
              <Card key={index} className="bg-gray-100 border-gray-300 transition-colors">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                    <IconComponent className="h-6 w-6 text-gray-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{service.title}</h3>
                  <p className="text-sm text-gray-600">{service.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <Suspense fallback={<div className="text-center py-8">Loading...</div>}>
          <WhatsAppContact />
        </Suspense>

        {/* Map Placeholder */}
        <div className="mt-16">
          <Card className="bg-gray-100 border-gray-300">
            <CardContent className="p-0">
              <div className="aspect-[21/9] bg-gray-200 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Visit Our Showroom</h3>
                  <p className="text-gray-600">
                    {contactInfo ? 
                      `${contactInfo.address}, ${contactInfo.city}, ${contactInfo.state} ${contactInfo.postcode}, ${contactInfo.country}` : 
                      '123 Business Avenue, Commercial District, NY 10001, United States'
                    }
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Interactive map would be embedded here
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}