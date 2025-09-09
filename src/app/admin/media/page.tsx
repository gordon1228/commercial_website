'use client'

import { useState, useEffect } from 'react'
import { 
  Upload, 
  Trash2, 
  Download, 
  Search, 
  RefreshCw,
  AlertCircle,
  CheckCircle,
  X,
  Copy,
  Eye
} from 'lucide-react'

interface ImageData {
  name: string
  path: string
  url: string
  size: number
  createdAt: string
  modifiedAt: string
}

export default function MediaPage() {
  const [images, setImages] = useState<ImageData[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedImages, setSelectedImages] = useState<string[]>([])
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)

  const loadImages = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/images')
      const data = await response.json()
      
      if (response.ok) {
        setImages(data.images || [])
      } else {
        showMessage('error', data.error || 'Failed to load images')
      }
    } catch (error) {
      showMessage('error', 'Failed to load images')
      console.error('Error loading images:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadImages()
  }, [])

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 5000)
  }

  const handleFileUpload = async (files: FileList) => {
    if (files.length === 0) return

    setUploading(true)
    let successCount = 0
    let errorCount = 0

    for (const file of Array.from(files)) {
      try {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (response.ok) {
          successCount++
        } else {
          errorCount++
        }
      } catch (error) {
        errorCount++
        console.error('Upload error:', error)
      }
    }

    setUploading(false)
    
    if (successCount > 0) {
      showMessage('success', `${successCount} file(s) uploaded successfully`)
      loadImages()
    }
    
    if (errorCount > 0) {
      showMessage('error', `${errorCount} file(s) failed to upload`)
    }
  }

  const handleDelete = async (fileName: string) => {
    if (!confirm(`Are you sure you want to delete ${fileName}?`)) return

    try {
      const response = await fetch(`/api/images?file=${encodeURIComponent(fileName)}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (response.ok) {
        showMessage('success', data.message)
        setImages(images.filter(img => img.name !== fileName))
        setSelectedImages(selectedImages.filter(name => name !== fileName))
      } else {
        showMessage('error', data.error || 'Failed to delete image')
      }
    } catch (error) {
      showMessage('error', 'Failed to delete image')
      console.error('Delete error:', error)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedImages.length === 0) return
    
    if (!confirm(`Are you sure you want to delete ${selectedImages.length} selected image(s)?`)) return

    let successCount = 0
    let errorCount = 0

    for (const fileName of selectedImages) {
      try {
        const response = await fetch(`/api/images?file=${encodeURIComponent(fileName)}`, {
          method: 'DELETE',
        })

        if (response.ok) {
          successCount++
        } else {
          errorCount++
        }
      } catch (error) {
        errorCount++
        console.error('Delete error:', error)
      }
    }

    if (successCount > 0) {
      showMessage('success', `${successCount} image(s) deleted successfully`)
      loadImages()
    }
    
    if (errorCount > 0) {
      showMessage('error', `${errorCount} image(s) failed to delete`)
    }

    setSelectedImages([])
  }

  const toggleImageSelection = (fileName: string) => {
    setSelectedImages(prev => 
      prev.includes(fileName) 
        ? prev.filter(name => name !== fileName)
        : [...prev, fileName]
    )
  }

  const selectAllImages = () => {
    if (selectedImages.length === filteredImages.length) {
      setSelectedImages([])
    } else {
      setSelectedImages(filteredImages.map(img => img.name))
    }
  }

  const copyImageUrl = (url: string) => {
    const fullUrl = `${window.location.origin}${url}`
    navigator.clipboard.writeText(fullUrl)
    showMessage('success', 'Image URL copied to clipboard')
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const filteredImages = images.filter(image => 
    image.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Media Management</h1>
        <p className="mt-2 text-gray-600">
          Manage your uploaded images and media files
        </p>
      </div>

      {/* Message Display */}
      {message && (
        <div className={`mb-6 p-4 rounded-md flex items-center ${
          message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="h-5 w-5 mr-2" />
          ) : (
            <AlertCircle className="h-5 w-5 mr-2" />
          )}
          {message.text}
          <button 
            onClick={() => setMessage(null)}
            className="ml-auto"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Controls */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Upload Button */}
          <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <Upload className="h-4 w-4 mr-2" />
            {uploading ? 'Uploading...' : 'Upload Images'}
            <input
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
              disabled={uploading}
            />
          </label>

          {/* Refresh Button */}
          <button
            onClick={loadImages}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search images..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedImages.length > 0 && (
        <div className="mb-6 p-4 bg-blue-50 rounded-md flex items-center justify-between">
          <div className="text-sm text-blue-800">
            {selectedImages.length} image(s) selected
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleBulkDelete}
              className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded text-red-700 bg-red-100 hover:bg-red-200"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete Selected
            </button>
            <button
              onClick={() => setSelectedImages([])}
              className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* Image Grid */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">
            Images ({filteredImages.length})
          </h2>
          {filteredImages.length > 0 && (
            <button
              onClick={selectAllImages}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {selectedImages.length === filteredImages.length ? 'Deselect All' : 'Select All'}
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        ) : filteredImages.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-2">No images found</div>
            <div className="text-gray-500 text-sm">
              {searchTerm ? 'Try adjusting your search terms' : 'Upload some images to get started'}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredImages.map((image) => (
              <div key={image.name} className="group relative bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {/* Selection Checkbox */}
                <div className="absolute top-2 left-2 z-10">
                  <input
                    type="checkbox"
                    checked={selectedImages.includes(image.name)}
                    onChange={() => toggleImageSelection(image.name)}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                </div>

                {/* Image */}
                <div className="aspect-square relative">
                  <img
                    src={image.url}
                    alt={image.name}
                    className="w-full h-full object-cover cursor-pointer"
                    onClick={() => setPreviewImage(image.url)}
                  />
                  
                  {/* Action Overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setPreviewImage(image.url)}
                        className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                        title="Preview"
                      >
                        <Eye className="h-4 w-4 text-gray-600" />
                      </button>
                      <button
                        onClick={() => copyImageUrl(image.url)}
                        className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                        title="Copy URL"
                      >
                        <Copy className="h-4 w-4 text-gray-600" />
                      </button>
                      <a
                        href={image.url}
                        download={image.name}
                        className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                        title="Download"
                      >
                        <Download className="h-4 w-4 text-gray-600" />
                      </a>
                      <button
                        onClick={() => handleDelete(image.name)}
                        className="p-2 bg-white rounded-full hover:bg-red-100 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Image Info */}
                <div className="p-3">
                  <div className="text-sm font-medium text-gray-900 truncate" title={image.name}>
                    {image.name}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {formatFileSize(image.size)}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {new Date(image.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 p-2 bg-white rounded-full hover:bg-gray-100 transition-colors z-10"
            >
              <X className="h-6 w-6 text-gray-600" />
            </button>
            <img
              src={previewImage}
              alt="Preview"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  )
}