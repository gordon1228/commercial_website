'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Save, Eye, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import ImageSelector from '@/components/ui/image-selector'
import PartnersManager from '@/components/ui/partners-manager'

interface HomepageContent {
  id: string
  // Section Visibility
  showComingSoonSection: boolean
  showHeroSection: boolean
  showVehicleCategories: boolean
  showFeaturedVehicles: boolean
  showTrustSection: boolean
  // Content
  heroTitle: string
  heroSubtitle: string
  heroDescription: string
  heroButtonPrimary: string
  heroButtonSecondary: string
  vehiclesSold: number
  happyClients: number
  yearsExperience: number
  satisfactionRate: number
  partnersTitle: string
  partnersDescription: string
  feature1Title: string
  feature1Description: string
  feature2Title: string
  feature2Description: string
  feature3Title: string
  feature3Description: string
  comingSoonImage: string
  comingSoonImageAlt: string
}

export default function AdminHomepagePage() {
  const [content, setContent] = useState<HomepageContent | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')

  useEffect(() => {
    fetchContent()
  }, [])

  const fetchContent = async () => {
    try {
      const response = await fetch('/api/homepage-content')
      if (response.ok) {
        const data = await response.json()
        setContent(data)
      }
    } catch (error) {
      console.error('Error fetching homepage content:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!content) return

    setIsSaving(true)
    setSaveMessage('')

    try {
      const response = await fetch('/api/homepage-content', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(content),
      })

      if (response.ok) {
        setSaveMessage('Homepage content saved successfully!')
        setTimeout(() => setSaveMessage(''), 3000)
      } else {
        setSaveMessage('Error saving content. Please try again.')
      }
    } catch (error) {
      console.error('Error saving content:', error)
      setSaveMessage('Error saving content. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const updateContent = (field: keyof HomepageContent, value: string | number | boolean) => {
    if (!content) return
    setContent({
      ...content,
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

  if (!content) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error loading content</h2>
          <Button onClick={fetchContent}>Retry</Button>
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
          <h1 className="text-3xl font-bold text-gray-900">Homepage Content</h1>
        </div>
        <div className="flex items-center space-x-3">
          <Link href="/admin/preview">
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
          </Link>
          <Button onClick={handleSave} disabled={isSaving} size="sm">
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
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

      {/* Section Visibility Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Section Visibility</CardTitle>
          <p className="text-sm text-gray-600">Control which sections appear on the homepage</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="showComingSoonSection"
                checked={content.showComingSoonSection}
                onChange={(e) => updateContent('showComingSoonSection', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <Label htmlFor="showComingSoonSection" className="text-sm font-medium">
                Coming Soon Section
              </Label>
            </div>
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="showHeroSection"
                checked={content.showHeroSection}
                onChange={(e) => updateContent('showHeroSection', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <Label htmlFor="showHeroSection" className="text-sm font-medium">
                Hero Section
              </Label>
            </div>
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="showVehicleCategories"
                checked={content.showVehicleCategories}
                onChange={(e) => updateContent('showVehicleCategories', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <Label htmlFor="showVehicleCategories" className="text-sm font-medium">
                Vehicle Categories
              </Label>
            </div>
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="showFeaturedVehicles"
                checked={content.showFeaturedVehicles}
                onChange={(e) => updateContent('showFeaturedVehicles', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <Label htmlFor="showFeaturedVehicles" className="text-sm font-medium">
                Featured Vehicles
              </Label>
            </div>
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="showTrustSection"
                checked={content.showTrustSection}
                onChange={(e) => updateContent('showTrustSection', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <Label htmlFor="showTrustSection" className="text-sm font-medium">
                Trust Section
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hero Section */}
        <Card>
          <CardHeader>
            <CardTitle>Hero Section</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="heroTitle">Title</Label>
              <Input
                id="heroTitle"
                value={content.heroTitle}
                onChange={(e) => updateContent('heroTitle', e.target.value)}
                placeholder="Premium Commercial"
              />
            </div>
            <div>
              <Label htmlFor="heroSubtitle">Subtitle</Label>
              <Input
                id="heroSubtitle"
                value={content.heroSubtitle}
                onChange={(e) => updateContent('heroSubtitle', e.target.value)}
                placeholder="Vehicles"
              />
            </div>
            <div>
              <Label htmlFor="heroDescription">Description</Label>
              <Textarea
                id="heroDescription"
                value={content.heroDescription}
                onChange={(e) => updateContent('heroDescription', e.target.value)}
                rows={3}
                placeholder="Discover elite fleet solutions..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="heroButtonPrimary">Primary Button</Label>
                <Input
                  id="heroButtonPrimary"
                  value={content.heroButtonPrimary}
                  onChange={(e) => updateContent('heroButtonPrimary', e.target.value)}
                  placeholder="Explore Fleet"
                />
              </div>
              <div>
                <Label htmlFor="heroButtonSecondary">Secondary Button</Label>
                <Input
                  id="heroButtonSecondary"
                  value={content.heroButtonSecondary}
                  onChange={(e) => updateContent('heroButtonSecondary', e.target.value)}
                  placeholder="Get Quote"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="vehiclesSold">Vehicles Available</Label>
                <Input
                  id="vehiclesSold"
                  type="number"
                  value={content.vehiclesSold}
                  onChange={(e) => updateContent('vehiclesSold', parseInt(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label htmlFor="happyClients">Happy Clients</Label>
                <Input
                  id="happyClients"
                  type="number"
                  value={content.happyClients}
                  onChange={(e) => updateContent('happyClients', parseInt(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label htmlFor="yearsExperience">Years Experience</Label>
                <Input
                  id="yearsExperience"
                  type="number"
                  value={content.yearsExperience}
                  onChange={(e) => updateContent('yearsExperience', parseInt(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label htmlFor="satisfactionRate">Satisfaction Rate (%)</Label>
                <Input
                  id="satisfactionRate"
                  type="number"
                  min="0"
                  max="100"
                  value={content.satisfactionRate}
                  onChange={(e) => updateContent('satisfactionRate', parseInt(e.target.value) || 0)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Partners Section */}
        <Card>
          <CardHeader>
            <CardTitle>Partners Section</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="partnersTitle">Title</Label>
              <Input
                id="partnersTitle"
                value={content.partnersTitle}
                onChange={(e) => updateContent('partnersTitle', e.target.value)}
                placeholder="Trusted by Industry Leaders"
              />
            </div>
            <div>
              <Label htmlFor="partnersDescription">Description</Label>
              <Textarea
                id="partnersDescription"
                value={content.partnersDescription}
                onChange={(e) => updateContent('partnersDescription', e.target.value)}
                rows={3}
                placeholder="We partner with the world's most respected..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Trust Features */}
        <Card>
          <CardHeader>
            <CardTitle>Trust Features</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Feature 1</Label>
              <Input
                value={content.feature1Title}
                onChange={(e) => updateContent('feature1Title', e.target.value)}
                placeholder="Quality Guarantee"
                className="mb-2"
              />
              <Textarea
                value={content.feature1Description}
                onChange={(e) => updateContent('feature1Description', e.target.value)}
                rows={2}
                placeholder="Every vehicle undergoes rigorous inspection..."
              />
            </div>
            <div className="space-y-2">
              <Label>Feature 2</Label>
              <Input
                value={content.feature2Title}
                onChange={(e) => updateContent('feature2Title', e.target.value)}
                placeholder="Fast Delivery"
                className="mb-2"
              />
              <Textarea
                value={content.feature2Description}
                onChange={(e) => updateContent('feature2Description', e.target.value)}
                rows={2}
                placeholder="Quick processing and delivery..."
              />
            </div>
            <div className="space-y-2">
              <Label>Feature 3</Label>
              <Input
                value={content.feature3Title}
                onChange={(e) => updateContent('feature3Title', e.target.value)}
                placeholder="24/7 Support"
                className="mb-2"
              />
              <Textarea
                value={content.feature3Description}
                onChange={(e) => updateContent('feature3Description', e.target.value)}
                rows={2}
                placeholder="Round-the-clock customer support..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Coming Soon Section */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Coming Soon Section</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ImageSelector
              value={content.comingSoonImage}
              onChange={(value) => updateContent('comingSoonImage', value)}
              label="Coming Soon Background Image"
              placeholder="No image selected"
              folder="uploads"
            />
            <div>
              <Label htmlFor="comingSoonImageAlt">Image Alt Text</Label>
              <Input
                id="comingSoonImageAlt"
                value={content.comingSoonImageAlt}
                onChange={(e) => updateContent('comingSoonImageAlt', e.target.value)}
                placeholder="Coming Soon"
              />
            </div>
          </CardContent>
        </Card>

        {/* Partners Management */}
        <div className="lg:col-span-2">
          <PartnersManager />
        </div>
      </div>
    </div>
  )
}