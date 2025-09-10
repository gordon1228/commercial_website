'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, X, Image as ImageIcon, FolderOpen, Check, Info, Car, Cpu, Home, Users, Folder } from 'lucide-react'
import { Button } from './button'

interface ImageUploadProps {
  images: string[]
  onImagesChange: (images: string[]) => void
  maxImages?: number
  className?: string
}

interface MediaImage {
  name: string
  path: string
  url: string
  size: number
  createdAt: string
}

interface ImageUsage {
  type: string
  id?: string
  name?: string
  context: string
}

interface ImageUsageData {
  url: string
  usedIn: ImageUsage[]
}

export function ImageUpload({ 
  images, 
  onImagesChange, 
  maxImages = 10, 
  className = '' 
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [showMediaSelector, setShowMediaSelector] = useState(false)
  const [mediaImages, setMediaImages] = useState<MediaImage[]>([])
  const [loadingMedia, setLoadingMedia] = useState(false)
  const [selectedMediaImages, setSelectedMediaImages] = useState<string[]>([])
  const [imageUsages, setImageUsages] = useState<ImageUsageData[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = useCallback(async (files: File[]) => {
    if (files.length === 0) return

    setUploading(true)
    const newImages: string[] = []

    for (const file of files) {
      if (file.type.startsWith('image/')) {
        try {
          // Upload file to server
          const formData = new FormData()
          formData.append('file', file)

          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          })

          if (response.ok) {
            const result = await response.json()
            newImages.push(result.url)
          } else {
            let errorMessage = `HTTP ${response.status}: ${response.statusText}`
            try {
              const contentType = response.headers.get('content-type')
              if (contentType && contentType.includes('application/json')) {
                const error = await response.json()
                errorMessage = error.error || error.message || errorMessage
              } else {
                const textError = await response.text()
                if (textError && !textError.includes('<html')) {
                  errorMessage = textError
                }
              }
            } catch (e) {
              // Use the fallback message if parsing fails
              console.error('Error parsing error response:', e)
            }
            console.error('Upload error:', errorMessage)
            alert(`Failed to upload ${file.name}: ${errorMessage}`)
          }
        } catch (error) {
          console.error('Error uploading file:', error)
          alert(`Failed to upload ${file.name}: ${error}`)
        }
      }
    }

    if (newImages.length > 0) {
      const updatedImages = [...images, ...newImages].slice(0, maxImages)
      onImagesChange(updatedImages)
    }

    setUploading(false)
  }, [images, onImagesChange, maxImages])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    handleFileUpload(files)
  }, [handleFileUpload])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : []
    handleFileUpload(files)
    
    // Reset input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [handleFileUpload])

  const handleChooseFiles = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const removeImage = useCallback((index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    onImagesChange(newImages)
  }, [images, onImagesChange])

  const loadMediaImages = useCallback(async () => {
    setLoadingMedia(true)
    try {
      // Load images and usage data in parallel
      const [imagesResponse, usageResponse] = await Promise.all([
        fetch('/api/images'),
        fetch('/api/image-usage')
      ])

      if (imagesResponse.ok) {
        const imagesData = await imagesResponse.json()
        setMediaImages(imagesData.images || [])
      } else {
        console.error('Failed to load media images')
      }

      if (usageResponse.ok) {
        const usageData = await usageResponse.json()
        setImageUsages(usageData.usages || [])
      } else {
        console.error('Failed to load image usage data')
      }
    } catch (error) {
      console.error('Error loading media data:', error)
    } finally {
      setLoadingMedia(false)
    }
  }, [])

  const handleOpenMediaSelector = useCallback(() => {
    setShowMediaSelector(true)
    setSelectedMediaImages([])
    loadMediaImages()
  }, [loadMediaImages])

  const handleCloseMediaSelector = useCallback(() => {
    setShowMediaSelector(false)
    setSelectedMediaImages([])
  }, [])

  const toggleMediaImageSelection = useCallback((url: string) => {
    setSelectedMediaImages(prev => 
      prev.includes(url) 
        ? prev.filter(u => u !== url)
        : [...prev, url]
    )
  }, [])

  const handleSelectMediaImages = useCallback(() => {
    const newImages = [...images, ...selectedMediaImages].slice(0, maxImages)
    onImagesChange(newImages)
    handleCloseMediaSelector()
  }, [images, selectedMediaImages, maxImages, onImagesChange, handleCloseMediaSelector])

  const getImageUsage = useCallback((imageUrl: string): ImageUsage[] => {
    const usage = imageUsages.find(u => u.url === imageUrl)
    return usage ? usage.usedIn : []
  }, [imageUsages])

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${isDragging 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${uploading ? 'opacity-50 pointer-events-none' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
            <Upload className="h-8 w-8 text-gray-400" />
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              {uploading ? 'Processing images...' : 'Upload vehicle images'}
            </h3>
            <p className="text-gray-600 mt-1">
              Drag and drop images here, or click to select files
            </p>
            <p className="text-sm text-gray-500 mt-2">
              PNG, JPG, JPEG up to 10MB each. Maximum {maxImages} images.
            </p>
          </div>

          <div className="flex gap-2 justify-center">
            <Button
              type="button"
              variant="outline"
              onClick={handleChooseFiles}
              disabled={uploading}
            >
              <Upload className="h-4 w-4 mr-2" />
              Choose Files
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleOpenMediaSelector}
              disabled={uploading}
            >
              <FolderOpen className="h-4 w-4 mr-2" />
              Select from Media
            </Button>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                {image ? (
                  <img
                    src={image}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-gray-400" />
                  </div>
                )}
              </div>
              
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
                onClick={() => removeImage(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Image Counter */}
      {images.length > 0 && (
        <p className="text-sm text-gray-500">
          {images.length} of {maxImages} images
        </p>
      )}

      {/* Media Selector Modal */}
      {showMediaSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  Select from Media Library
                </h3>
                <button
                  onClick={handleCloseMediaSelector}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              {selectedMediaImages.length > 0 && (
                <p className="text-sm text-gray-600 mt-2">
                  {selectedMediaImages.length} image(s) selected
                </p>
              )}
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {loadingMedia ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              ) : mediaImages.length === 0 ? (
                <div className="text-center py-8">
                  <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-gray-500">No images found in media library</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {mediaImages.map((mediaImage) => {
                    const isSelected = selectedMediaImages.includes(mediaImage.url)
                    const isAlreadyUsed = images.includes(mediaImage.url)
                    const usage = getImageUsage(mediaImage.url)
                    const hasOtherUsage = usage.length > 0
                    
                    return (
                      <div 
                        key={mediaImage.name} 
                        className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                          isSelected 
                            ? 'border-blue-500 shadow-lg' 
                            : isAlreadyUsed 
                              ? 'border-gray-300 opacity-50'
                              : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => !isAlreadyUsed && toggleMediaImageSelection(mediaImage.url)}
                      >
                        <div className="aspect-square">
                          <img
                            src={mediaImage.url}
                            alt={mediaImage.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        {/* Usage Indicator */}
                        {hasOtherUsage && !isAlreadyUsed && (
                          <div className="absolute top-2 left-2 bg-orange-500 text-white rounded-full p-1" title={`Used in ${usage.length} place(s)`}>
                            <Info className="h-3 w-3" />
                          </div>
                        )}
                        
                        {/* Selection Indicator */}
                        {isSelected && (
                          <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1">
                            <Check className="h-3 w-3" />
                          </div>
                        )}
                        
                        {/* Already Used Indicator */}
                        {isAlreadyUsed && (
                          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                            <span className="text-white text-xs font-medium">Already Added</span>
                          </div>
                        )}
                        
                        {/* Image Info */}
                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white text-xs">
                          <div className="p-2">
                            <p className="truncate font-medium" title={mediaImage.name}>
                              {mediaImage.name}
                            </p>
                            {hasOtherUsage && (
                              <div className="mt-1 space-y-1">
                                {usage.slice(0, 2).map((use, idx) => (
                                  <div key={idx} className="flex items-center gap-1">
                                    {use.type === 'vehicle' ? (
                                      <Car className="h-3 w-3" />
                                    ) : use.type.startsWith('technology') ? (
                                      <Cpu className="h-3 w-3" />
                                    ) : use.type === 'homepage' ? (
                                      <Home className="h-3 w-3" />
                                    ) : use.type === 'category' ? (
                                      <Folder className="h-3 w-3" />
                                    ) : use.type === 'partner' ? (
                                      <Users className="h-3 w-3" />
                                    ) : (
                                      <ImageIcon className="h-3 w-3" />
                                    )}
                                    <span className="truncate">{use.context}</span>
                                  </div>
                                ))}
                                {usage.length > 2 && (
                                  <div className="text-gray-300">
                                    +{usage.length - 2} more
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseMediaSelector}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSelectMediaImages}
                disabled={selectedMediaImages.length === 0}
              >
                Add Selected ({selectedMediaImages.length})
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}