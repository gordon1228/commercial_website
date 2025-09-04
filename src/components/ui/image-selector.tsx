'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Loader2, Upload, X, Plus } from 'lucide-react'

interface ImageOption {
  name: string
  path: string
  url: string
  isDefault?: boolean
}

interface ImageSelectorProps {
  value: string
  onChange: (value: string) => void
  label?: string
  placeholder?: string
  folder?: string
}

export default function ImageSelector({ 
  value, 
  onChange, 
  label = "Select Image", 
  placeholder = "No image selected",
  folder = "images"
}: ImageSelectorProps) {
  const [images, setImages] = useState<ImageOption[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showSelector, setShowSelector] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    if (showSelector) {
      fetchImages()
    }
  }, [showSelector, folder])

  const fetchImages = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/images?folder=${folder}`)
      if (response.ok) {
        const data = await response.json()
        setImages(data.images || [])
      }
    } catch (error) {
      console.error('Error fetching images:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageSelect = (imagePath: string) => {
    onChange(imagePath)
    setShowSelector(false)
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        onChange(data.url) // Set the newly uploaded image as selected
        await fetchImages() // Refresh the images list
        setShowSelector(false) // Close the selector
      } else {
        console.error('Failed to upload image')
        alert('Failed to upload image. Please try again.')
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Error uploading image. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const currentImage = images.find(img => img.path === value)

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      
      {/* Current selection display */}
      <div className="border border-gray-200 rounded-lg p-3">
        {value ? (
          <div className="flex items-center gap-3">
            <div className="relative w-16 h-16 rounded overflow-hidden">
              <Image
                src={value}
                alt="Selected image"
                fill
                className="object-cover"
                sizes="64px"
              />
            </div>
            <div className="flex-1">
              <div className="font-medium text-sm">{currentImage?.name || 'Custom image'}</div>
              <div className="text-xs text-gray-500">{value}</div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowSelector(true)}
            >
              Change
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onChange('')}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="text-center py-4">
            <div className="text-gray-500 mb-2">{placeholder}</div>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowSelector(true)}
            >
              <Upload className="h-4 w-4 mr-2" />
              Select Image
            </Button>
          </div>
        )}
      </div>

      {/* Manual input for custom paths */}
      <div>
        <Label className="text-sm text-gray-600">Or enter custom path:</Label>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter image URL..."
          className="mt-1"
        />
      </div>

      {/* Image selector modal */}
      {showSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-4xl max-h-[80vh] m-4">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Select an Image</h3>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    id="image-upload"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={isUploading}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById('image-upload')?.click()}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Upload New
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSelector(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
                  {images.map((image, index) => (
                    <div key={index} className="relative group">
                      <div 
                        className={`relative aspect-square rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
                          value === image.path 
                            ? 'border-blue-500 shadow-lg' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handleImageSelect(image.path)}
                      >
                        <Image
                          src={image.url}
                          alt={image.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        />
                        {image.isDefault && (
                          <div className="absolute top-1 right-1 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                            Default
                          </div>
                        )}
                      </div>
                      <div className="mt-1 text-xs text-center text-gray-600 truncate">
                        {image.name}
                      </div>
                    </div>
                  ))}
                  
                  {images.length === 0 && (
                    <div className="col-span-full text-center py-8 text-gray-500">
                      No images found in the {folder} folder
                    </div>
                  )}
                </div>
              )}

              <div className="mt-4 pt-4 border-t flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowSelector(false)}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}