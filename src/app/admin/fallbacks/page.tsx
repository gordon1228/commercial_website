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
  fallbackData: any
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
      { key: 'companyDescription', label: 'Company Description', type: 'textarea' },
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
      const response = await fetch('/api/page-fallbacks')
      if (response.ok) {
        const data = await response.json()
        const fallbacksMap: { [key: string]: PageFallback } = {}
        data.forEach((fallback: PageFallback) => {
          fallbacksMap[fallback.pageName] = fallback
        })
        setFallbacks(fallbacksMap)
      }
    } catch (error) {
      console.error('Error fetching fallbacks:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInitialize = async () => {
    setIsInitializing(true)
    try {
      const response = await fetch('/api/page-fallbacks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'initialize' }),
      })

      if (response.ok) {
        setSaveMessage('Page fallbacks initialized successfully!')
        await fetchFallbacks()
      } else {
        setSaveMessage('Error initializing fallbacks. Please try again.')
      }
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
      const response = await fetch('/api/page-fallbacks', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pageName,
          fallbackData: fallback.fallbackData,
          enabled: fallback.enabled
        }),
      })

      if (response.ok) {
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

  const renderField = (pageName: string, field: any) => {
    const value = fallbacks[pageName]?.fallbackData?.[field.key] || ''

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
            value={value}
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