'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Save, ArrowLeft, Phone, MessageCircle, Globe } from 'lucide-react'
import Link from 'next/link'

interface ContactInfo {
  id: string
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

interface PhoneNumberParts {
  countryCode: string
  number: string
}

// Popular country codes for commercial businesses
const COUNTRY_CODES = [
  { code: '+60', country: 'Malaysia', flag: '🇲🇾' },
  { code: '+65', country: 'Singapore', flag: '🇸🇬' },
  { code: '+62', country: 'Indonesia', flag: '🇮🇩' },
  { code: '+66', country: 'Thailand', flag: '🇹🇭' },
  { code: '+84', country: 'Vietnam', flag: '🇻🇳' },
  { code: '+63', country: 'Philippines', flag: '🇵🇭' },
  { code: '+86', country: 'China', flag: '🇨🇳' },
  { code: '+91', country: 'India', flag: '🇮🇳' },
  { code: '+1', country: 'United States', flag: '🇺🇸' },
  { code: '+44', country: 'United Kingdom', flag: '🇬🇧' },
  { code: '+61', country: 'Australia', flag: '🇦🇺' },
  { code: '+81', country: 'Japan', flag: '🇯🇵' },
  { code: '+82', country: 'South Korea', flag: '🇰🇷' },
]

export default function AdminContactInfoPage() {
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  
  // Phone number parsing and formatting
  const parsePhoneNumber = (fullNumber: string): PhoneNumberParts => {
    const cleaned = fullNumber.replace(/[\s\-\(\)]/g, '')
    
    // Find matching country code
    const matchingCode = COUNTRY_CODES.find(cc => cleaned.startsWith(cc.code))
    
    if (matchingCode) {
      return {
        countryCode: matchingCode.code,
        number: cleaned.substring(matchingCode.code.length)
      }
    }
    
    // Default to Malaysia if no country code found
    if (cleaned.startsWith('0')) {
      return {
        countryCode: '+60',
        number: cleaned.substring(1)
      }
    }
    
    return {
      countryCode: '+60',
      number: cleaned
    }
  }
  
  const formatPhoneNumber = (countryCode: string, number: string): string => {
    return countryCode + number.replace(/[\s\-\(\)]/g, '')
  }

  useEffect(() => {
    fetchContactInfo()
  }, [])

  const fetchContactInfo = async () => {
    try {
      const response = await fetch('/api/contact-info')
      if (response.ok) {
        const data = await response.json()
        setContactInfo(data)
      }
    } catch (error) {
      console.error('Error fetching contact info:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!contactInfo) return

    setIsSaving(true)
    setSaveMessage('')

    try {
      const response = await fetch('/api/contact-info', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactInfo),
      })

      if (response.ok) {
        setSaveMessage('Contact information saved successfully!')
        setTimeout(() => setSaveMessage(''), 3000)
      } else {
        setSaveMessage('Error saving contact information. Please try again.')
      }
    } catch (error) {
      console.error('Error saving contact info:', error)
      setSaveMessage('Error saving contact information. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const updateContactInfo = (field: keyof ContactInfo, value: string) => {
    if (!contactInfo) return
    setContactInfo({
      ...contactInfo,
      [field]: value
    })
  }
  
  const updatePhoneNumber = (field: keyof ContactInfo, countryCode: string, number: string) => {
    if (!contactInfo) return
    const formattedPhone = formatPhoneNumber(countryCode, number)
    setContactInfo({
      ...contactInfo,
      [field]: formattedPhone
    })
  }
  
  const testWhatsAppNumber = (phoneNumber: string) => {
    const cleanNumber = phoneNumber.replace(/[\s\-\(\)]/g, '')
    const testUrl = `https://wa.me/${cleanNumber}?text=Test message from admin panel`
    window.open(testUrl, '_blank')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!contactInfo) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error loading contact information</h2>
          <Button onClick={fetchContactInfo}>Retry</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/admin"
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Contact Information</h1>
        </div>
        <Button onClick={handleSave} disabled={isSaving} size="sm">
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {/* Save Message */}
      {saveMessage && (
        <div className={`p-3 rounded-md ${
          saveMessage.includes('Error') 
            ? 'bg-red-100 text-red-800 border border-red-200' 
            : 'bg-green-100 text-green-800 border border-green-200'
        }`}>
          {saveMessage}
        </div>
      )}

      {/* WhatsApp Information */}
      <Card className="bg-green-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <MessageCircle className="h-5 w-5" />
            WhatsApp Integration Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white rounded-lg border border-green-200">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Phone className="h-6 w-6 text-green-600" />
              </div>
              <div className="font-semibold text-gray-900">Primary WhatsApp</div>
              <div className="text-sm text-gray-600">{contactInfo.salesPhone}</div>
              <Button
                size="sm"
                variant="outline"
                className="mt-2 text-green-600 border-green-300 hover:bg-green-50"
                onClick={() => testWhatsAppNumber(contactInfo.salesPhone)}
              >
                Test Chat
              </Button>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border border-green-200">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <MessageCircle className="h-6 w-6 text-blue-600" />
              </div>
              <div className="font-semibold text-gray-900">Contact Page</div>
              <div className="text-sm text-gray-600">WhatsApp Integration</div>
              <div className="text-xs text-green-600 mt-1">✓ Active</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border border-green-200">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Globe className="h-6 w-6 text-purple-600" />
              </div>
              <div className="font-semibold text-gray-900">Auto-Format</div>
              <div className="text-sm text-gray-600">Country codes</div>
              <div className="text-xs text-green-600 mt-1">✓ Enabled</div>
            </div>
          </div>
          <div className="mt-4 p-3 bg-white rounded-lg border border-green-200">
            <h4 className="font-semibold text-gray-900 mb-2">How it works:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• The primary sales phone number is used for WhatsApp contact</li>
              <li>• Phone numbers are automatically formatted with country codes</li>
              <li>• Users can click WhatsApp buttons to start conversations</li>
              <li>• Messages are pre-filled based on inquiry type</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Phone Numbers with Country Codes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Phone Numbers
            </CardTitle>
            <p className="text-sm text-gray-600">Primary sales phone will be used for WhatsApp contact</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Sales Phone (Primary WhatsApp) */}
            <div>
              <Label htmlFor="salesPhone" className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-green-600" />
                Sales Phone (WhatsApp Primary)
              </Label>
              <div className="flex gap-2 mt-1">
                <select 
                  className="w-32 px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={parsePhoneNumber(contactInfo.salesPhone).countryCode} 
                  onChange={(e) => {
                    const parsed = parsePhoneNumber(contactInfo.salesPhone)
                    updatePhoneNumber('salesPhone', e.target.value, parsed.number)
                  }}
                >
                  {COUNTRY_CODES.map((cc) => (
                    <option key={cc.code} value={cc.code}>
                      {cc.flag} {cc.code} {cc.country}
                    </option>
                  ))}
                </select>
                <Input
                  id="salesPhone"
                  className="flex-1"
                  value={parsePhoneNumber(contactInfo.salesPhone).number}
                  onChange={(e) => {
                    const parsed = parsePhoneNumber(contactInfo.salesPhone)
                    updatePhoneNumber('salesPhone', parsed.countryCode, e.target.value)
                  }}
                  placeholder="123456789"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => testWhatsAppNumber(contactInfo.salesPhone)}
                  className="text-green-600 hover:text-green-700"
                >
                  Test WhatsApp
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Full number: {contactInfo.salesPhone}</p>
            </div>
            
            {/* Service Phone */}
            <div>
              <Label htmlFor="servicePhone">Service Phone</Label>
              <div className="flex gap-2 mt-1">
                <select 
                  className="w-32 px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={parsePhoneNumber(contactInfo.servicePhone).countryCode} 
                  onChange={(e) => {
                    const parsed = parsePhoneNumber(contactInfo.servicePhone)
                    updatePhoneNumber('servicePhone', e.target.value, parsed.number)
                  }}
                >
                  {COUNTRY_CODES.map((cc) => (
                    <option key={cc.code} value={cc.code}>
                      {cc.flag} {cc.code} {cc.country}
                    </option>
                  ))}
                </select>
                <Input
                  id="servicePhone"
                  className="flex-1"
                  value={parsePhoneNumber(contactInfo.servicePhone).number}
                  onChange={(e) => {
                    const parsed = parsePhoneNumber(contactInfo.servicePhone)
                    updatePhoneNumber('servicePhone', parsed.countryCode, e.target.value)
                  }}
                  placeholder="123456789"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Full number: {contactInfo.servicePhone}</p>
            </div>
            
            {/* Finance Phone */}
            <div>
              <Label htmlFor="financePhone">Finance Phone</Label>
              <div className="flex gap-2 mt-1">
                <select 
                  className="w-32 px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={parsePhoneNumber(contactInfo.financePhone).countryCode} 
                  onChange={(e) => {
                    const parsed = parsePhoneNumber(contactInfo.financePhone)
                    updatePhoneNumber('financePhone', e.target.value, parsed.number)
                  }}
                >
                  {COUNTRY_CODES.map((cc) => (
                    <option key={cc.code} value={cc.code}>
                      {cc.flag} {cc.code} {cc.country}
                    </option>
                  ))}
                </select>
                <Input
                  id="financePhone"
                  className="flex-1"
                  value={parsePhoneNumber(contactInfo.financePhone).number}
                  onChange={(e) => {
                    const parsed = parsePhoneNumber(contactInfo.financePhone)
                    updatePhoneNumber('financePhone', parsed.countryCode, e.target.value)
                  }}
                  placeholder="123456789"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Full number: {contactInfo.financePhone}</p>
            </div>
          </CardContent>
        </Card>

        {/* Email Addresses */}
        <Card>
          <CardHeader>
            <CardTitle>Email Addresses</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="salesEmail">Sales Email</Label>
              <Input
                id="salesEmail"
                type="email"
                value={contactInfo.salesEmail}
                onChange={(e) => updateContactInfo('salesEmail', e.target.value)}
                placeholder="sales@evtl.com"
              />
            </div>
            <div>
              <Label htmlFor="serviceEmail">Service Email</Label>
              <Input
                id="serviceEmail"
                type="email"
                value={contactInfo.serviceEmail}
                onChange={(e) => updateContactInfo('serviceEmail', e.target.value)}
                placeholder="service@evtl.com"
              />
            </div>
            <div>
              <Label htmlFor="supportEmail">Support Email</Label>
              <Input
                id="supportEmail"
                type="email"
                value={contactInfo.supportEmail}
                onChange={(e) => updateContactInfo('supportEmail', e.target.value)}
                placeholder="support@evtl.com"
              />
            </div>
          </CardContent>
        </Card>

        {/* Address Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Address Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="address">Street Address</Label>
              <Input
                id="address"
                value={contactInfo.address}
                onChange={(e) => updateContactInfo('address', e.target.value)}
                placeholder="123 Business Avenue"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={contactInfo.city}
                  onChange={(e) => updateContactInfo('city', e.target.value)}
                  placeholder="Commercial District"
                />
              </div>
              <div>
                <Label htmlFor="state">State/Province</Label>
                <Input
                  id="state"
                  value={contactInfo.state}
                  onChange={(e) => updateContactInfo('state', e.target.value)}
                  placeholder="NY"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="postcode">Postal Code</Label>
                <Input
                  id="postcode"
                  value={contactInfo.postcode}
                  onChange={(e) => updateContactInfo('postcode', e.target.value)}
                  placeholder="10001"
                />
              </div>
              <div>
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={contactInfo.country}
                  onChange={(e) => updateContactInfo('country', e.target.value)}
                  placeholder="United States"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="directions">Directions/Landmark</Label>
              <Input
                id="directions"
                value={contactInfo.directions}
                onChange={(e) => updateContactInfo('directions', e.target.value)}
                placeholder="Near Metro Station"
              />
            </div>
          </CardContent>
        </Card>

        {/* Business Hours */}
        <Card>
          <CardHeader>
            <CardTitle>Business Hours</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="mondayToFriday">Monday to Friday</Label>
              <Input
                id="mondayToFriday"
                value={contactInfo.mondayToFriday}
                onChange={(e) => updateContactInfo('mondayToFriday', e.target.value)}
                placeholder="8:00 AM - 6:00 PM"
              />
            </div>
            <div>
              <Label htmlFor="saturday">Saturday</Label>
              <Input
                id="saturday"
                value={contactInfo.saturday}
                onChange={(e) => updateContactInfo('saturday', e.target.value)}
                placeholder="9:00 AM - 4:00 PM"
              />
            </div>
            <div>
              <Label htmlFor="sunday">Sunday</Label>
              <Input
                id="sunday"
                value={contactInfo.sunday}
                onChange={(e) => updateContactInfo('sunday', e.target.value)}
                placeholder="Closed"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preview Section */}
      <Card className="bg-gray-50">
        <CardHeader>
          <CardTitle>Contact Information Preview</CardTitle>
          <p className="text-sm text-gray-600">This is how your contact information will appear to customers</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Phone Preview */}
            <div className="bg-white p-4 rounded-lg border">
              <div className="flex items-center mb-3">
                <Phone className="h-5 w-5 text-gray-600 mr-2" />
                <h3 className="font-semibold text-gray-900">Phone</h3>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Sales:</span>
                  <span className="font-medium">{contactInfo.salesPhone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Service:</span>
                  <span className="font-medium">{contactInfo.servicePhone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Finance:</span>
                  <span className="font-medium">{contactInfo.financePhone}</span>
                </div>
              </div>
            </div>
            
            {/* Email Preview */}
            <div className="bg-white p-4 rounded-lg border">
              <div className="flex items-center mb-3">
                <span className="w-5 h-5 text-gray-600 mr-2">📧</span>
                <h3 className="font-semibold text-gray-900">Email</h3>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Sales:</span>
                  <span className="font-medium truncate">{contactInfo.salesEmail}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Service:</span>
                  <span className="font-medium truncate">{contactInfo.serviceEmail}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Support:</span>
                  <span className="font-medium truncate">{contactInfo.supportEmail}</span>
                </div>
              </div>
            </div>
            
            {/* Location Preview */}
            <div className="bg-white p-4 rounded-lg border">
              <div className="flex items-center mb-3">
                <span className="w-5 h-5 text-gray-600 mr-2">📍</span>
                <h3 className="font-semibold text-gray-900">Location</h3>
              </div>
              <div className="text-sm">
                <div className="font-medium text-gray-900 mb-1">
                  {contactInfo.address}
                </div>
                <div className="text-gray-600">
                  {contactInfo.city}, {contactInfo.state} {contactInfo.postcode}
                </div>
                <div className="text-gray-600">
                  {contactInfo.country}
                </div>
              </div>
            </div>
            
            {/* Hours Preview */}
            <div className="bg-white p-4 rounded-lg border">
              <div className="flex items-center mb-3">
                <span className="w-5 h-5 text-gray-600 mr-2">🕐</span>
                <h3 className="font-semibold text-gray-900">Hours</h3>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Mon-Fri:</span>
                  <span className="font-medium">{contactInfo.mondayToFriday}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Saturday:</span>
                  <span className="font-medium">{contactInfo.saturday}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Sunday:</span>
                  <span className="font-medium">{contactInfo.sunday}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}