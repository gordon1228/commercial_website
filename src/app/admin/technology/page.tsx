'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { ImageUpload } from '@/components/ui/image-upload'
import { Plus, Trash2, Edit3, GripVertical, Eye, EyeOff } from 'lucide-react'

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
  
  // Feature management states
  const [showAddFeature, setShowAddFeature] = useState(false)
  const [editingFeature, setEditingFeature] = useState<TechnologyFeature | null>(null)
  const [newFeature, setNewFeature] = useState<Partial<TechnologyFeature>>({
    title: '',
    description: '',
    iconName: 'Zap',
    order: 0,
    active: true
  })

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

  // Feature management functions
  const handleAddFeature = async () => {
    if (!newFeature.title || !newFeature.description) {
      setMessage({ type: 'error', text: 'Title and description are required' })
      return
    }

    try {
      const response = await fetch('/api/technology-features', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newFeature,
          order: features.length
        })
      })

      if (response.ok) {
        await fetchData()
        setNewFeature({
          title: '',
          description: '',
          iconName: 'Zap',
          order: 0,
          active: true
        })
        setShowAddFeature(false)
        setMessage({ type: 'success', text: 'Feature added successfully!' })
      } else {
        throw new Error('Failed to add feature')
      }
    } catch (error) {
      console.error('Error adding feature:', error)
      setMessage({ type: 'error', text: 'Failed to add feature' })
    }
  }

  const handleEditFeature = async (feature: TechnologyFeature) => {
    try {
      const response = await fetch(`/api/technology-features/${feature.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feature)
      })

      if (response.ok) {
        await fetchData()
        setEditingFeature(null)
        setMessage({ type: 'success', text: 'Feature updated successfully!' })
      } else {
        throw new Error('Failed to update feature')
      }
    } catch (error) {
      console.error('Error updating feature:', error)
      setMessage({ type: 'error', text: 'Failed to update feature' })
    }
  }

  const handleDeleteFeature = async (id: string) => {
    if (!confirm('Are you sure you want to delete this feature?')) return

    try {
      const response = await fetch(`/api/technology-features/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchData()
        setMessage({ type: 'success', text: 'Feature deleted successfully!' })
      } else {
        throw new Error('Failed to delete feature')
      }
    } catch (error) {
      console.error('Error deleting feature:', error)
      setMessage({ type: 'error', text: 'Failed to delete feature' })
    }
  }

  const handleToggleActive = async (feature: TechnologyFeature) => {
    await handleEditFeature({
      ...feature,
      active: !feature.active
    })
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
                    Background Image
                  </label>
                  <ImageUpload
                    images={content.heroBackgroundImage ? [content.heroBackgroundImage] : []}
                    onImagesChange={(images) => handleInputChange('heroBackgroundImage', images[0] || '')}
                    maxImages={1}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Recommended size: 1920x1080px or larger for best quality
                  </p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hero Subtitle
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px] resize-none"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px] resize-none"
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
          <div className="flex justify-between items-center">
            <CardTitle>Technology Features</CardTitle>
            <Button
              onClick={() => setShowAddFeature(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Feature
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Add New Feature Form */}
          {showAddFeature && (
            <div className="border rounded-lg p-4 mb-6 bg-gray-50">
              <h3 className="text-lg font-semibold mb-4">Add New Feature</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title
                  </label>
                  <Input
                    value={newFeature.title || ''}
                    onChange={(e) => setNewFeature(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="High-Capacity Battery"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Icon Name
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={newFeature.iconName}
                    onChange={(e) => setNewFeature(prev => ({ ...prev, iconName: e.target.value }))}
                  >
                    <option value="Zap">Zap (Lightning)</option>
                    <option value="Battery">Battery</option>
                    <option value="Smartphone">Smartphone</option>
                    <option value="RotateCcw">RotateCcw (Regenerative)</option>
                    <option value="Settings">Settings (Maintenance)</option>
                    <option value="Leaf">Leaf (Eco-friendly)</option>
                    <option value="Truck">Truck</option>
                    <option value="Shield">Shield (Security)</option>
                    <option value="Cpu">Cpu (Processing)</option>
                  </select>
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px] resize-none"
                  value={newFeature.description || ''}
                  onChange={(e) => setNewFeature(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe this technology feature..."
                />
              </div>
              <div className="flex gap-2 mt-4">
                <Button onClick={handleAddFeature}>
                  Add Feature
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddFeature(false)
                    setNewFeature({
                      title: '',
                      description: '',
                      iconName: 'Zap',
                      order: 0,
                      active: true
                    })
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Features List */}
          <div className="space-y-4">
            {features.length === 0 ? (
              <div className="text-center py-8 text-gray-600">
                <p>No features added yet.</p>
                <p className="text-sm mt-2">Click &quot;Add Feature&quot; to create your first technology feature.</p>
              </div>
            ) : (
              features.map((feature, index) => (
                <div
                  key={feature.id}
                  className={`border rounded-lg p-4 ${!feature.active ? 'bg-gray-50 opacity-60' : 'bg-white'}`}
                >
                  {editingFeature?.id === feature.id ? (
                    // Edit Mode
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Title
                          </label>
                          <Input
                            value={editingFeature?.title || ''}
                            onChange={(e) => setEditingFeature(prev => prev ? ({ ...prev, title: e.target.value }) : null)}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Icon Name
                          </label>
                          <select
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={editingFeature?.iconName || ''}
                            onChange={(e) => setEditingFeature(prev => prev ? ({ ...prev, iconName: e.target.value }) : null)}
                          >
                            <option value="Zap">Zap (Lightning)</option>
                            <option value="Battery">Battery</option>
                            <option value="Smartphone">Smartphone</option>
                            <option value="RotateCcw">RotateCcw (Regenerative)</option>
                            <option value="Settings">Settings (Maintenance)</option>
                            <option value="Leaf">Leaf (Eco-friendly)</option>
                            <option value="Truck">Truck</option>
                            <option value="Shield">Shield (Security)</option>
                            <option value="Cpu">Cpu (Processing)</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Description
                        </label>
                        <textarea
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px] resize-none"
                          value={editingFeature?.description || ''}
                          onChange={(e) => setEditingFeature(prev => prev ? ({ ...prev, description: e.target.value }) : null)}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => editingFeature && handleEditFeature(editingFeature)}
                          disabled={!editingFeature}
                        >
                          Save Changes
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setEditingFeature(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // View Mode
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex items-center gap-2">
                            <GripVertical className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-500">#{index + 1}</span>
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {feature.title}
                          </h3>
                          <span className="text-sm text-gray-500 px-2 py-1 bg-gray-100 rounded">
                            {feature.iconName}
                          </span>
                          {!feature.active && (
                            <span className="text-xs text-red-600 px-2 py-1 bg-red-100 rounded">
                              Hidden
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm">
                          {feature.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleActive(feature)}
                          title={feature.active ? 'Hide feature' : 'Show feature'}
                        >
                          {feature.active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingFeature(feature)}
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteFeature(feature.id!)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}