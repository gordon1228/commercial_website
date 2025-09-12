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

interface HomepageContent {
  id: string
  // Hero Section
  heroTitle: string
  heroSubtitle: string
  heroDescription: string
  heroButtonPrimary: string
  heroButtonSecondary: string
  // Statistics
  happyClients: number
  yearsExperience: number
  satisfactionRate: number
  // Partners Section
  partnersTitle: string
  partnersDescription: string
  // Features
  feature1Title: string
  feature1Description: string
  feature2Title: string
  feature2Description: string
  feature3Title: string
  feature3Description: string
  // Coming Soon Section
  comingSoonImage: string
  comingSoonImageAlt: string
  comingSoonImageMobile?: string
  // Section Visibility Controls
  showComingSoonSection: boolean
  showHeroSection: boolean
  showVehicleCategories: boolean
  showFeaturedVehicles: boolean
  showTrustSection: boolean
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


      {/* Hero Section - Simplified */}
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Hero Section Content</CardTitle>
          <p className="text-sm text-gray-600">Manage the main homepage hero section content</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="heroTitle">Title</Label>
            <Input
              id="heroTitle"
              value={content.heroTitle}
              onChange={(e) => updateContent('heroTitle', e.target.value)}
              placeholder="Premium Commercial"
              className="text-lg"
            />
          </div>
          <div>
            <Label htmlFor="heroSubtitle">Subtitle</Label>
            <Input
              id="heroSubtitle"
              value={content.heroSubtitle}
              onChange={(e) => updateContent('heroSubtitle', e.target.value)}
              placeholder="Trucks"
              className="text-lg"
            />
          </div>
          <div>
            <Label htmlFor="heroDescription">Description</Label>
            <Textarea
              id="heroDescription"
              value={content.heroDescription}
              onChange={(e) => updateContent('heroDescription', e.target.value)}
              rows={4}
              placeholder="Discover elite truck solutions built for businesses that demand excellence, reliability, and uncompromising performance."
              className="text-base"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="heroButtonPrimary">Primary Button Text</Label>
              <Input
                id="heroButtonPrimary"
                value={content.heroButtonPrimary}
                onChange={(e) => updateContent('heroButtonPrimary', e.target.value)}
                placeholder="Explore Trucks"
              />
            </div>
            <div>
              <Label htmlFor="heroButtonSecondary">Secondary Button Text</Label>
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

      {/* Statistics Section */}
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Company Statistics</CardTitle>
          <p className="text-sm text-gray-600">Display key company achievements and statistics</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="happyClients">Happy Clients</Label>
              <Input
                id="happyClients"
                type="number"
                value={content.happyClients}
                onChange={(e) => updateContent('happyClients', parseInt(e.target.value) || 0)}
                placeholder="25"
              />
            </div>
            <div>
              <Label htmlFor="yearsExperience">Years Experience</Label>
              <Input
                id="yearsExperience"
                type="number"
                value={content.yearsExperience}
                onChange={(e) => updateContent('yearsExperience', parseInt(e.target.value) || 0)}
                placeholder="10"
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
                placeholder="95"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Partners Section */}
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Partners Section</CardTitle>
          <p className="text-sm text-gray-600">Content for the trusted partners section</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="partnersTitle">Partners Section Title</Label>
            <Input
              id="partnersTitle"
              value={content.partnersTitle}
              onChange={(e) => updateContent('partnersTitle', e.target.value)}
              placeholder="Trusted by Industry Leaders"
            />
          </div>
          <div>
            <Label htmlFor="partnersDescription">Partners Section Description</Label>
            <Textarea
              id="partnersDescription"
              value={content.partnersDescription}
              onChange={(e) => updateContent('partnersDescription', e.target.value)}
              rows={3}
              placeholder="We partner with the world's most respected commercial vehicle manufacturers..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Features Section */}
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Key Features</CardTitle>
          <p className="text-sm text-gray-600">Three key features to highlight on the homepage</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Feature 1</h4>
              <div>
                <Label htmlFor="feature1Title">Title</Label>
                <Input
                  id="feature1Title"
                  value={content.feature1Title}
                  onChange={(e) => updateContent('feature1Title', e.target.value)}
                  placeholder="Quality Guarantee"
                />
              </div>
              <div>
                <Label htmlFor="feature1Description">Description</Label>
                <Textarea
                  id="feature1Description"
                  value={content.feature1Description}
                  onChange={(e) => updateContent('feature1Description', e.target.value)}
                  rows={3}
                  placeholder="Every vehicle undergoes rigorous inspection..."
                />
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Feature 2</h4>
              <div>
                <Label htmlFor="feature2Title">Title</Label>
                <Input
                  id="feature2Title"
                  value={content.feature2Title}
                  onChange={(e) => updateContent('feature2Title', e.target.value)}
                  placeholder="Fast Delivery"
                />
              </div>
              <div>
                <Label htmlFor="feature2Description">Description</Label>
                <Textarea
                  id="feature2Description"
                  value={content.feature2Description}
                  onChange={(e) => updateContent('feature2Description', e.target.value)}
                  rows={3}
                  placeholder="Quick processing and delivery..."
                />
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Feature 3</h4>
              <div>
                <Label htmlFor="feature3Title">Title</Label>
                <Input
                  id="feature3Title"
                  value={content.feature3Title}
                  onChange={(e) => updateContent('feature3Title', e.target.value)}
                  placeholder="24/7 Support"
                />
              </div>
              <div>
                <Label htmlFor="feature3Description">Description</Label>
                <Textarea
                  id="feature3Description"
                  value={content.feature3Description}
                  onChange={(e) => updateContent('feature3Description', e.target.value)}
                  rows={3}
                  placeholder="Round-the-clock customer support..."
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section Visibility Controls */}
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Section Visibility</CardTitle>
          <p className="text-sm text-gray-600">Control which sections are displayed on the homepage</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="showHeroSection"
                checked={content.showHeroSection}
                onChange={(e) => updateContent('showHeroSection', e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              <Label htmlFor="showHeroSection">Show Hero Section</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="showVehicleCategories"
                checked={content.showVehicleCategories}
                onChange={(e) => updateContent('showVehicleCategories', e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              <Label htmlFor="showVehicleCategories">Show Vehicle Categories</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="showFeaturedVehicles"
                checked={content.showFeaturedVehicles}
                onChange={(e) => updateContent('showFeaturedVehicles', e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              <Label htmlFor="showFeaturedVehicles">Show Featured Vehicles</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="showTrustSection"
                checked={content.showTrustSection}
                onChange={(e) => updateContent('showTrustSection', e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              <Label htmlFor="showTrustSection">Show Trust Section</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="showComingSoonSection"
                checked={content.showComingSoonSection}
                onChange={(e) => updateContent('showComingSoonSection', e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              <Label htmlFor="showComingSoonSection">Show Coming Soon Section</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Coming Soon Section */}
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Coming Soon Section</CardTitle>
          <p className="text-sm text-gray-600">Manage the coming soon section background image</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <ImageSelector
                value={content.comingSoonImage || ''}
                onChange={(value) => updateContent('comingSoonImage', value)}
                label="Coming Soon Desktop Image"
                placeholder="No desktop image selected"
                folder="uploads"
              />
              <p className="text-xs text-gray-500 mt-2">
                Optimal size: 1920x1080 (landscape). Used for desktop and tablet devices.
              </p>
            </div>
            <div>
              <ImageSelector
                value={content.comingSoonImageMobile || ''}
                onChange={(value) => updateContent('comingSoonImageMobile', value)}
                label="Coming Soon Mobile Image"
                placeholder="No mobile image selected (will use desktop)"
                folder="uploads"
              />
              <p className="text-xs text-gray-500 mt-2">
                Optimal size: 750x1334 (portrait). Used for mobile devices. If not set, desktop image will be used.
              </p>
            </div>
          </div>
          <div>
            <Label htmlFor="comingSoonImageAlt">Coming Soon Image Alt Text</Label>
            <Input
              id="comingSoonImageAlt"
              value={content.comingSoonImageAlt}
              onChange={(e) => updateContent('comingSoonImageAlt', e.target.value)}
              placeholder="Coming Soon Background"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}