'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

interface TechnologyContent {
  id?: string
  heroTitle: string
  heroSubtitle: string
  heroBackgroundImage: string
  heroBackgroundImageAlt: string
  section1Title: string
  section1Description: string
  section2Title: string
  section2Description: string
  section3Title: string
  section3Description: string
  section4Title: string
  section4Description: string
}

interface TechnologyFeature {
  id?: string
  title: string
  description: string
  iconName: string
  order: number
  active: boolean
}

export default function TechnologyManagementPage() {
  const { data: session, status } = useSession()
  const [content, setContent] = useState<TechnologyContent>({
    heroTitle: '',
    heroSubtitle: '',
    heroBackgroundImage: '',
    heroBackgroundImageAlt: '',
    section1Title: '',
    section1Description: '',
    section2Title: '',
    section2Description: '',
    section3Title: '',
    section3Description: '',
    section4Title: '',
    section4Description: ''
  })
  const [features, setFeatures] = useState<TechnologyFeature[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    if (status === 'loading') return
    if (status === 'unauthenticated' || !['ADMIN', 'MANAGER'].includes(session?.user?.role || '')) {
      return
    }

    fetchData()
  }, [status, session])

  const fetchData = async () => {
    try {
      const [contentRes, featuresRes] = await Promise.all([
        fetch('/api/technology-content'),
        fetch('/api/technology-features')
      ])

      if (contentRes.ok) {
        const contentData = await contentRes.json()
        setContent(contentData)
      }

      if (featuresRes.ok) {
        const featuresData = await featuresRes.json()
        setFeatures(featuresData)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      setMessage({ type: 'error', text: 'Failed to load technology content' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleContentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setMessage(null)

    try {
      const response = await fetch('/api/technology-content', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(content)
      })

      if (response.ok) {
        const updatedContent = await response.json()
        setContent(updatedContent)
        setMessage({ type: 'success', text: 'Technology content updated successfully!' })
      } else {
        throw new Error('Failed to update content')
      }
    } catch (error) {
      console.error('Error updating content:', error)
      setMessage({ type: 'error', text: 'Failed to update technology content' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleInputChange = (field: keyof TechnologyContent, value: string) => {
    setContent(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (status === 'unauthenticated' || !['ADMIN', 'MANAGER'].includes(session?.user?.role || '')) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don&apos;t have permission to access this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="px-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Technology Content Management</h1>
        <p className="text-gray-600 mt-2">Manage the content displayed on the technology page</p>
      </div>

      {message && (
        <div className={`p-4 rounded-md ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Technology Page Content</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleContentSubmit} className="space-y-6">
            {/* Hero Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Hero Section</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hero Title
                  </label>
                  <Input
                    value={content.heroTitle}
                    onChange={(e) => handleInputChange('heroTitle', e.target.value)}
                    placeholder="Next-Generation Electric Truck Technology"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Background Image URL
                  </label>
                  <Input
                    value={content.heroBackgroundImage}
                    onChange={(e) => handleInputChange('heroBackgroundImage', e.target.value)}
                    placeholder="/uploads/Technology_background.png"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hero Subtitle
                </label>
                <textarea
                  className="input min-h-[80px] resize-none"
                  value={content.heroSubtitle}
                  onChange={(e) => handleInputChange('heroSubtitle', e.target.value)}
                  placeholder="Advanced electric vehicle technology designed for commercial success..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Background Image Alt Text
                </label>
                <Input
                  value={content.heroBackgroundImageAlt}
                  onChange={(e) => handleInputChange('heroBackgroundImageAlt', e.target.value)}
                  placeholder="Electric Truck Technology Background"
                />
              </div>
            </div>

            {/* Content Sections */}
            {[1, 2, 3, 4].map((num) => (
              <div key={num} className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Section {num}</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Section {num} Title
                  </label>
                  <Input
                    value={content[`section${num}Title` as keyof TechnologyContent]}
                    onChange={(e) => handleInputChange(`section${num}Title` as keyof TechnologyContent, e.target.value)}
                    placeholder={`Section ${num} Title`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Section {num} Description
                  </label>
                  <textarea
                    className="input min-h-[100px] resize-none"
                    value={content[`section${num}Description` as keyof TechnologyContent]}
                    onChange={(e) => handleInputChange(`section${num}Description` as keyof TechnologyContent, e.target.value)}
                    placeholder={`Section ${num} description...`}
                  />
                </div>
              </div>
            ))}

            <Button 
              type="submit" 
              className="w-full md:w-auto"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Technology Features Section */}
      <Card>
        <CardHeader>
          <CardTitle>Technology Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-600">
            <p>Technology features management coming soon.</p>
            <p className="text-sm mt-2">Current features: {features.length}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}