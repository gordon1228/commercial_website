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
  // Essential Content Only
  heroTitle: string
  heroSubtitle: string
  heroDescription: string
  heroButtonPrimary: string
  heroButtonSecondary: string
  // Coming Soon Section
  comingSoonImage: string
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

      {/* Coming Soon Section */}
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Coming Soon Section</CardTitle>
          <p className="text-sm text-gray-600">Manage the coming soon section background image</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <ImageSelector
              value={content.comingSoonImage || ''}
              onChange={(value) => updateContent('comingSoonImage', value)}
              label="Coming Soon Background Image"
              placeholder="No image selected for coming soon section"
              folder="backgrounds"
            />
            <p className="text-xs text-gray-500 mt-2">
              This image will be displayed as the background of the coming soon section on the homepage.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}