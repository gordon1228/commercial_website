'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Save, ArrowLeft, RefreshCw, AlertCircle } from 'lucide-react'
import Link from 'next/link'

interface PageFallback {
  id: string
  pageName: string
  fallbackData: Record<string, string | number | boolean>
  enabled: boolean
  createdAt: string
  updatedAt: string
}

const PAGE_CONFIGS = {
  homepage: {
    title: 'Homepage Fallbacks',
    description: 'Manage fallback content for the homepage',
    fields: [
      { key: 'heroTitle', label: 'Hero Title', type: 'text' },
      { key: 'heroSubtitle', label: 'Hero Subtitle', type: 'text' },
      { key: 'heroDescription', label: 'Hero Description', type: 'textarea' },
      { key: 'comingSoonImage', label: 'Coming Soon Image', type: 'text' },
      { key: 'comingSoonImageMobile', label: 'Coming Soon Mobile Image', type: 'text' },
      { key: 'companyTagline', label: 'Company Tagline', type: 'text' }
    ]
  },
  about: {
    title: 'About Page Fallbacks',
    description: 'Manage fallback content for the about page',
    fields: [
      { key: 'companyName', label: 'Company Name', type: 'text' },
      { key: 'companyDescription', label: 'Company Description 1', type: 'textarea' },
      { key: 'companyDescription2', label: 'Company Description 2', type: 'textarea' },
      { key: 'foundedYear', label: 'Founded Year', type: 'number' },
      { key: 'totalVehiclesSold', label: 'Total Vehicles Sold', type: 'number' },
      { key: 'totalHappyCustomers', label: 'Total Happy Customers', type: 'number' },
      { key: 'totalYearsExp', label: 'Years of Experience', type: 'number' },
      { key: 'satisfactionRate', label: 'Satisfaction Rate (%)', type: 'number' },
      { key: 'storyTitle', label: 'Story Title', type: 'text' },
      { key: 'storyParagraph1', label: 'Story Paragraph 1', type: 'textarea' },
      { key: 'storyParagraph2', label: 'Story Paragraph 2', type: 'textarea' },
      { key: 'storyParagraph3', label: 'Story Paragraph 3', type: 'textarea' },
      { key: 'missionTitle', label: 'Mission Title', type: 'text' },
      { key: 'missionText', label: 'Mission Text', type: 'textarea' },
      { key: 'visionTitle', label: 'Vision Title', type: 'text' },
      { key: 'visionText', label: 'Vision Text', type: 'textarea' }
    ]
  },
  contact: {
    title: 'Contact Page Fallbacks',
    description: 'Manage fallback content for the contact page',
    fields: [
      { key: 'salesPhone', label: 'Sales Phone', type: 'text' },
      { key: 'servicePhone', label: 'Service Phone', type: 'text' },
      { key: 'financePhone', label: 'Finance Phone', type: 'text' },
      { key: 'salesEmail', label: 'Sales Email', type: 'email' },
      { key: 'serviceEmail', label: 'Service Email', type: 'email' },
      { key: 'supportEmail', label: 'Support Email', type: 'email' },
      { key: 'address', label: 'Address', type: 'text' },
      { key: 'city', label: 'City', type: 'text' },
      { key: 'state', label: 'State', type: 'text' },
      { key: 'postcode', label: 'Postcode', type: 'text' },
      { key: 'country', label: 'Country', type: 'text' },
      { key: 'directions', label: 'Directions', type: 'text' },
      { key: 'mondayToFriday', label: 'Monday to Friday Hours', type: 'text' },
      { key: 'saturday', label: 'Saturday Hours', type: 'text' },
      { key: 'sunday', label: 'Sunday Hours', type: 'text' },
      { key: 'facebookUrl', label: 'Facebook URL', type: 'url' },
      { key: 'twitterUrl', label: 'Twitter URL', type: 'url' },
      { key: 'instagramUrl', label: 'Instagram URL', type: 'url' },
      { key: 'linkedinUrl', label: 'LinkedIn URL', type: 'url' }
    ]
  },
  header: {
    title: 'Header Fallbacks',
    description: 'Manage fallback content for the header component',
    fields: [
      { key: 'companyName', label: 'Company Name', type: 'text' }
    ]
  },
  footer: {
    title: 'Footer Fallbacks',
    description: 'Manage fallback content for the footer component',
    fields: [
      { key: 'companyName', label: 'Company Name', type: 'text' },
      { key: 'companyDescription', label: 'Company Description', type: 'textarea' },
      { key: 'salesPhone', label: 'Sales Phone', type: 'text' },
      { key: 'servicePhone', label: 'Service Phone', type: 'text' },
      { key: 'salesEmail', label: 'Sales Email', type: 'email' },
      { key: 'serviceEmail', label: 'Service Email', type: 'email' },
      { key: 'supportEmail', label: 'Support Email', type: 'email' },
      { key: 'address', label: 'Address', type: 'text' },
      { key: 'city', label: 'City', type: 'text' }
    ]
  }
}

export default function AdminFallbacksPage() {
  const [fallbacks, setFallbacks] = useState<{ [key: string]: PageFallback }>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState('')
  const [isInitializing, setIsInitializing] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [activeTab, setActiveTab] = useState('homepage')

  useEffect(() => {
    fetchFallbacks()
  }, [])

  const fetchFallbacks = async () => {
    try {
      // Fetch data from existing APIs
      const [homepageRes, companyRes, contactRes] = await Promise.all([
        fetch('/api/homepage-content'),
        fetch('/api/company-info'),
        fetch('/api/contact-info')
      ])

      const fallbacksMap: { [key: string]: PageFallback } = {}

      if (homepageRes.ok) {
        const homepageData = await homepageRes.json()
        fallbacksMap.homepage = {
          id: 'homepage',
          pageName: 'homepage',
          fallbackData: {
            heroTitle: homepageData.heroTitle || 'Premium Commercial',
            heroSubtitle: homepageData.heroSubtitle || 'Vehicles',
            heroDescription: homepageData.heroDescription || 'Discover EVTL fleet solutions',
            comingSoonImage: homepageData.comingSoonImage || '',
            comingSoonImageMobile: homepageData.comingSoonImageMobile || '',
            companyTagline: 'Mining 24 Hours a Day with Autonomous Trucks Coming Soon'
          },
          enabled: true,
          createdAt: homepageData.createdAt || new Date().toISOString(),
          updatedAt: homepageData.updatedAt || new Date().toISOString()
        }
      }

      if (companyRes.ok) {
        const companyData = await companyRes.json()
        fallbacksMap.about = {
          id: 'about',
          pageName: 'about',
          fallbackData: {
            companyName: companyData.companyName || 'EVTL',
            companyDescription: companyData.companyDescription || 'EVTL is a next-generation mobility startup',
            companyDescription2: companyData.companyDescription2 || 'We specialize in providing high-quality commercial vehicles and comprehensive fleet solutions',
            foundedYear: companyData.foundedYear || 1998,
            totalVehiclesSold: companyData.totalVehiclesSold || 2500,
            totalHappyCustomers: companyData.totalHappyCustomers || 850,
            totalYearsExp: companyData.totalYearsExp || 25,
            satisfactionRate: companyData.satisfactionRate || 98,
            storyTitle: companyData.storyTitle || 'Our Story',
            storyParagraph1: companyData.storyParagraph1 || 'Founded in 1998...',
            storyParagraph2: companyData.storyParagraph2 || 'Over the years...',
            storyParagraph3: companyData.storyParagraph3 || 'Today, we continue...',
            missionTitle: companyData.missionTitle || 'Our Mission',
            missionText: companyData.missionText || 'To empower businesses...',
            visionTitle: companyData.visionTitle || 'Our Vision',
            visionText: companyData.visionText || 'To be the leading...'
          },
          enabled: true,
          createdAt: companyData.createdAt || new Date().toISOString(),
          updatedAt: companyData.updatedAt || new Date().toISOString()
        }
      }

      if (contactRes.ok) {
        const contactData = await contactRes.json()
        fallbacksMap.contact = {
          id: 'contact',
          pageName: 'contact',
          fallbackData: {
            salesPhone: contactData.salesPhone || '+60 10 339 1414',
            servicePhone: contactData.servicePhone || '+60 16 332 2349',
            financePhone: contactData.financePhone || '+60 16 332 2349',
            salesEmail: contactData.salesEmail || 'sales@evtl.com',
            serviceEmail: contactData.serviceEmail || 'service@evtl.com',
            supportEmail: contactData.supportEmail || 'support@evtl.com',
            address: contactData.address || '3-20 Level 3 MKH Boulevard',
            city: contactData.city || 'Kajang',
            state: contactData.state || 'Selangor',
            postcode: contactData.postcode || '43000',
            country: contactData.country || 'Malaysia',
            directions: contactData.directions || 'EVTL Trucks Office',
            mondayToFriday: contactData.mondayToFriday || '9:00 AM - 6:00 PM',
            saturday: contactData.saturday || '9:00 AM - 1:00 PM',
            sunday: contactData.sunday || 'Closed',
            facebookUrl: contactData.facebookUrl || '',
            twitterUrl: contactData.twitterUrl || '',
            instagramUrl: contactData.instagramUrl || '',
            linkedinUrl: contactData.linkedinUrl || ''
          },
          enabled: true,
          createdAt: contactData.createdAt || new Date().toISOString(),
          updatedAt: contactData.updatedAt || new Date().toISOString()
        }
      }

      // Add header and footer fallbacks using existing data
      fallbacksMap.header = {
        id: 'header',
        pageName: 'header',
        fallbackData: {
          companyName: fallbacksMap.contact?.fallbackData.companyName || 'EVTL'
        },
        enabled: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      fallbacksMap.footer = {
        id: 'footer',
        pageName: 'footer',
        fallbackData: {
          companyName: fallbacksMap.contact?.fallbackData.companyName || 'EVTL',
          companyDescription: fallbacksMap.contact?.fallbackData.companyDescription || 'EVTL Sdn. Bhd. is a next-generation mobility startup',
          salesPhone: fallbacksMap.contact?.fallbackData.salesPhone || '+60 10 339 1414',
          servicePhone: fallbacksMap.contact?.fallbackData.servicePhone || '+60 16 332 2349',
          salesEmail: fallbacksMap.contact?.fallbackData.salesEmail || 'sales@evtl.com',
          serviceEmail: fallbacksMap.contact?.fallbackData.serviceEmail || 'service@evtl.com',
          supportEmail: fallbacksMap.contact?.fallbackData.supportEmail || 'support@evtl.com',
          address: fallbacksMap.contact?.fallbackData.address || '3-20 Level 3 MKH Boulevard',
          city: fallbacksMap.contact?.fallbackData.city || 'Kajang'
        },
        enabled: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      setFallbacks(fallbacksMap)
    } catch (error) {
      console.error('Error fetching fallbacks:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInitialize = async () => {
    setIsInitializing(true)
    try {
      // Since we're using existing APIs, just refetch the data
      await fetchFallbacks()
      setSaveMessage('Fallback data loaded successfully!')
    } catch (error) {
      console.error('Error initializing fallbacks:', error)
      setSaveMessage('Error initializing fallbacks. Please try again.')
    } finally {
      setIsInitializing(false)
      setTimeout(() => setSaveMessage(''), 3000)
    }
  }

  const handleSave = async (pageName: string) => {
    const fallback = fallbacks[pageName]
    if (!fallback) return

    setIsSaving(pageName)
    setSaveMessage('')

    try {
      let response
      const fallbackData = fallback.fallbackData

      // Route to appropriate API based on page name
      switch (pageName) {
        case 'homepage':
          response = await fetch('/api/homepage-content', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(fallbackData)
          })
          break
        case 'about':
          response = await fetch('/api/company-info', {
            method: 'PUT', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(fallbackData)
          })
          break
        case 'contact':
          response = await fetch('/api/contact-info', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(fallbackData)
          })
          break
        case 'header':
        case 'footer':
          // For header/footer, update contact-info since that's where company name is stored
          response = await fetch('/api/contact-info', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ siteName: fallbackData.companyName })
          })
          break
        default:
          throw new Error(`Unknown page: ${pageName}`)
      }

      if (response && response.ok) {
        setSaveMessage(`${PAGE_CONFIGS[pageName as keyof typeof PAGE_CONFIGS]?.title} saved successfully!`)
        setTimeout(() => setSaveMessage(''), 3000)
      } else {
        setSaveMessage('Error saving fallbacks. Please try again.')
      }
    } catch (error) {
      console.error('Error saving fallbacks:', error)
      setSaveMessage('Error saving fallbacks. Please try again.')
    } finally {
      setIsSaving('')
    }
  }

  const updateFallbackData = (pageName: string, field: string, value: string | number | boolean) => {
    setFallbacks(prev => ({
      ...prev,
      [pageName]: {
        ...prev[pageName],
        fallbackData: {
          ...prev[pageName]?.fallbackData,
          [field]: value
        }
      }
    }))
  }

  const toggleEnabled = (pageName: string) => {
    setFallbacks(prev => ({
      ...prev,
      [pageName]: {
        ...prev[pageName],
        enabled: !prev[pageName]?.enabled
      }
    }))
  }

  const renderField = (pageName: string, field: { key: string; label: string; type: string }) => {
    const rawValue = fallbacks[pageName]?.fallbackData?.[field.key] || ''
    const value = typeof rawValue === 'boolean' ? String(rawValue) : String(rawValue || '')

    switch (field.type) {
      case 'textarea':
        return (
          <Textarea
            value={value}
            onChange={(e) => updateFallbackData(pageName, field.key, e.target.value)}
            rows={3}
            placeholder={`Enter ${field.label.toLowerCase()}`}
          />
        )
      case 'number':
        return (
          <Input
            type="number"
            value={rawValue === '' ? '' : String(rawValue)}
            onChange={(e) => updateFallbackData(pageName, field.key, parseInt(e.target.value) || 0)}
            placeholder={`Enter ${field.label.toLowerCase()}`}
          />
        )
      default:
        return (
          <Input
            type={field.type}
            value={value}
            onChange={(e) => updateFallbackData(pageName, field.key, e.target.value)}
            placeholder={`Enter ${field.label.toLowerCase()}`}
          />
        )
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const hasNoFallbacks = Object.keys(fallbacks).length === 0

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
          <h1 className="text-3xl font-bold text-gray-900">Fallback Data Management</h1>
        </div>
        <div className="flex items-center space-x-3">
          {hasNoFallbacks && (
            <Button 
              onClick={handleInitialize} 
              disabled={isInitializing}
              variant="outline"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isInitializing ? 'animate-spin' : ''}`} />
              {isInitializing ? 'Initializing...' : 'Initialize Fallbacks'}
            </Button>
          )}
        </div>
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

      {hasNoFallbacks ? (
        <Card className="max-w-4xl mx-auto">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Fallback Data Found</h2>
            <p className="text-gray-600 mb-6">
              Initialize the fallback data to start managing page-specific fallback content.
            </p>
            <Button onClick={handleInitialize} disabled={isInitializing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isInitializing ? 'animate-spin' : ''}`} />
              {isInitializing ? 'Initializing...' : 'Initialize Fallbacks'}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            {Object.keys(PAGE_CONFIGS).map((pageName) => (
              <TabsTrigger key={pageName} value={pageName} className="capitalize">
                {pageName}
              </TabsTrigger>
            ))}
          </TabsList>

          {Object.entries(PAGE_CONFIGS).map(([pageName, config]) => (
            <TabsContent key={pageName} value={pageName}>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{config.title}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">{config.description}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Label htmlFor={`${pageName}-enabled`} className="text-sm">
                          Enabled
                        </Label>
                        <Switch
                          id={`${pageName}-enabled`}
                          checked={fallbacks[pageName]?.enabled || false}
                          onCheckedChange={() => toggleEnabled(pageName)}
                        />
                      </div>
                      <Button 
                        onClick={() => handleSave(pageName)} 
                        disabled={isSaving === pageName}
                        size="sm"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {isSaving === pageName ? 'Saving...' : 'Save'}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {config.fields.map((field) => (
                      <div key={field.key} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                        <Label htmlFor={`${pageName}-${field.key}`}>{field.label}</Label>
                        {renderField(pageName, field)}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  )
}