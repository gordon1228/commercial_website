'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Save, ArrowLeft } from 'lucide-react'
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

export default function AdminContactInfoPage() {
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Phone Numbers */}
        <Card>
          <CardHeader>
            <CardTitle>Phone Numbers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="salesPhone">Sales Phone</Label>
              <Input
                id="salesPhone"
                value={contactInfo.salesPhone}
                onChange={(e) => updateContactInfo('salesPhone', e.target.value)}
                placeholder="+1 (555) 123-4567"
              />
            </div>
            <div>
              <Label htmlFor="servicePhone">Service Phone</Label>
              <Input
                id="servicePhone"
                value={contactInfo.servicePhone}
                onChange={(e) => updateContactInfo('servicePhone', e.target.value)}
                placeholder="+1 (555) 123-4568"
              />
            </div>
            <div>
              <Label htmlFor="financePhone">Finance Phone</Label>
              <Input
                id="financePhone"
                value={contactInfo.financePhone}
                onChange={(e) => updateContactInfo('financePhone', e.target.value)}
                placeholder="+1 (555) 123-4569"
              />
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
            <CardTitle>Address Information</CardTitle>
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
    </div>
  )
}