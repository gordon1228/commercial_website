'use client'

import { useState } from 'react'
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
import { useToast } from '@/components/ui/toast'
import { useFormSubmit } from '@/hooks/use-api'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { InlineError } from '@/components/ui/error-display'

const contactMethods = [
  {
    icon: Phone,
    title: 'Phone',
    details: [
      { label: 'Sales', value: '+1 (555) 123-4567' },
      { label: 'Service', value: '+1 (555) 123-4568' },
      { label: 'Finance', value: '+1 (555) 123-4569' }
    ]
  },
  {
    icon: Mail,
    title: 'Email',
    details: [
      { label: 'Sales', value: 'sales@elitefleet.com' },
      { label: 'Service', value: 'service@elitefleet.com' },
      { label: 'Support', value: 'support@elitefleet.com' }
    ]
  },
  {
    icon: MapPin,
    title: 'Location',
    details: [
      { label: 'Address', value: '123 Business Avenue' },
      { label: 'City', value: 'Commercial District, NY 10001' },
      { label: 'Directions', value: 'Near Metro Station' }
    ]
  },
  {
    icon: Clock,
    title: 'Hours',
    details: [
      { label: 'Mon - Fri', value: '8:00 AM - 6:00 PM' },
      { label: 'Saturday', value: '9:00 AM - 4:00 PM' },
      { label: 'Sunday', value: 'Closed' }
    ]
  }
]

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

export default function ContactPage() {
  const searchParams = useSearchParams()
  const vehicleSlug = searchParams?.get('vehicle')
  const { showSuccess, showError } = useToast()
  const { submit, error, clearError, isSubmitting } = useFormSubmit()
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    inquiryType: vehicleSlug ? 'quote' : 'general',
    vehicleInterest: vehicleSlug || '',
    message: '',
    preferredContact: 'email'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    
    const submissionData = {
      customerName: `${formData.firstName} ${formData.lastName}`,
      email: formData.email,
      phone: formData.phone || undefined,
      message: `${formData.message}\n\nInquiry Type: ${formData.inquiryType}\n${formData.company ? `Company: ${formData.company}\n` : ''}${formData.vehicleInterest ? `Vehicle Interest: ${formData.vehicleInterest}\n` : ''}Preferred Contact: ${formData.preferredContact}`,
      vehicleId: null // General inquiry
    }

    await submit('/api/inquiries', submissionData, {
      onSuccess: () => {
        showSuccess(
          'Inquiry submitted successfully!', 
          'We will contact you within 24 hours.'
        )
        // Reset form
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          company: '',
          inquiryType: 'general',
          vehicleInterest: '',
          message: '',
          preferredContact: 'email'
        })
      },
      onError: (error) => {
        showError('Failed to submit inquiry', error)
      }
    })
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

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
              <Card key={index} className="bg-gray-900/50 bg-gray-100 border-gray-300 transition-colors">
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="bg-gray-100 border-gray-300">
              <CardHeader>
                <CardTitle className="text-2xl text-gray-900">Send us a message</CardTitle>
                {vehicleSlug && (
                  <p className="text-gray-600">Inquiry about: {vehicleSlug.replace(/-/g, ' ')}</p>
                )}
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name *
                      </label>
                      <Input
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name *
                      </label>
                      <Input
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* Contact Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <Input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Company */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Name
                    </label>
                    <Input
                      value={formData.company}
                      onChange={(e) => handleInputChange('company', e.target.value)}
                    />
                  </div>

                  {/* Inquiry Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Inquiry Type *
                    </label>
                    <select 
                      className="input w-full"
                      value={formData.inquiryType}
                      onChange={(e) => handleInputChange('inquiryType', e.target.value)}
                      required
                    >
                      <option value="general">General Information</option>
                      <option value="quote">Request Quote</option>
                      <option value="visit">Schedule Visit</option>
                      <option value="financing">Financing Options</option>
                      <option value="service">Service Support</option>
                    </select>
                  </div>

                  {/* Vehicle Interest */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vehicle of Interest
                    </label>
                    <select 
                      className="input w-full"
                      value={formData.vehicleInterest}
                      onChange={(e) => handleInputChange('vehicleInterest', e.target.value)}
                    >
                      <option value="">Select a vehicle type</option>
                      <option value="trucks">Commercial Trucks</option>
                      <option value="vans">Delivery Vans</option>
                      <option value="buses">Passenger Buses</option>
                      <option value="specialty">Specialty Vehicles</option>
                    </select>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message *
                    </label>
                    <textarea
                      className="input min-h-[120px] resize-none"
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      placeholder="Tell us about your needs, timeline, or any specific questions..."
                      rows={5}
                      required
                    />
                  </div>

                  {/* Preferred Contact */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Contact Method
                    </label>
                    <div className="flex space-x-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="preferredContact"
                          value="email"
                          checked={formData.preferredContact === 'email'}
                          onChange={(e) => handleInputChange('preferredContact', e.target.value)}
                          className="mr-2"
                        />
                        <span className="text-gray-700">Email</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="preferredContact"
                          value="phone"
                          checked={formData.preferredContact === 'phone'}
                          onChange={(e) => handleInputChange('preferredContact', e.target.value)}
                          className="mr-2"
                        />
                        <span className="text-gray-700">Phone</span>
                      </label>
                    </div>
                  </div>

                  {/* Error Display */}
                  {error && (
                    <InlineError 
                      message={error}
                      onDismiss={clearError}
                    />
                  )}

                  {/* Submit Button */}
                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            {contactMethods.map((method, index) => {
              const IconComponent = method.icon
              return (
                <Card key={index} className="bg-gray-100 border-gray-300">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mr-4">
                        <IconComponent className="h-5 w-5 text-gray-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">{method.title}</h3>
                    </div>
                    <div className="space-y-2">
                      {method.details.map((detail, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span className="text-gray-600 text-sm">{detail.label}:</span>
                          <span className="text-gray-900 text-sm font-medium">{detail.value}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )
            })}

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

        {/* Map Placeholder */}
        <div className="mt-16">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-0">
              <div className="aspect-[21/9] bg-gray-800 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Visit Our Showroom</h3>
                  <p className="text-muted-foreground">
                    123 Business Avenue, Commercial District, NY 10001
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
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