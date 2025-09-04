'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Plus, Edit2, Trash2, Save, X, Power, PowerOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import ImageSelector from '@/components/ui/image-selector'
import Image from 'next/image'

interface Category {
  id: string
  name: string
  slug: string
  description?: string
  image?: string
  active: boolean
  _count?: {
    vehicles: number
  }
  activeVehicleCount?: number
}

export default function CategoriesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: ''
  })

  useEffect(() => {
    if (status === 'loading') return
    if (!session || session.user?.role !== 'ADMIN') {
      router.push('/admin/login')
      return
    }

    fetchCategories()
  }, [session, status, router])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (!response.ok) throw new Error('Failed to fetch categories')
      
      const data = await response.json()
      setCategories(data)
    } catch (error) {
      console.error('Error fetching categories:', error)
      alert('Failed to fetch categories')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    try {
      const url = editingId ? `/api/categories/${editingId}` : '/api/categories'
      const method = editingId ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          image: formData.image.trim() || undefined
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || `Failed to ${editingId ? 'update' : 'create'} category`)
      }

      await fetchCategories()
      resetForm()
      alert(`Category ${editingId ? 'updated' : 'created'} successfully!`)
    } catch (error) {
      console.error('Error saving category:', error)
      alert(`Failed to ${editingId ? 'update' : 'create'} category: ${error}`)
    }
  }

  const handleEdit = (category: Category) => {
    setEditingId(category.id)
    setFormData({
      name: category.name,
      description: category.description || '',
      image: category.image || ''
    })
    setIsCreating(true)
  }

  const handleDelete = async (id: string, name: string) => {
    const category = categories.find(c => c.id === id)
    const vehicleCount = category?._count?.vehicles || 0
    
    if (vehicleCount > 0) {
      alert(`Cannot delete "${name}" because it has ${vehicleCount} vehicle(s) assigned to it. Please reassign or delete those vehicles first.`)
      return
    }

    if (!confirm(`Are you sure you want to delete the category "${name}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete category')
      }

      await fetchCategories()
      alert('Category deleted successfully!')
    } catch (error) {
      console.error('Error deleting category:', error)
      alert(`Failed to delete category: ${error}`)
    }
  }

  const handleToggleActive = async (id: string, name: string, currentStatus: boolean) => {
    const action = currentStatus ? 'deactivate' : 'activate'
    if (!confirm(`Are you sure you want to ${action} the category "${name}"?`)) return

    try {
      const response = await fetch(`/api/categories/${id}/toggle-active`, {
        method: 'PATCH',
      })

      const result = await response.json()

      if (!response.ok) {
        // Show the specific error message from the API
        alert(result.error || `Failed to ${action} category`)
        return
      }
      
      // Update the category in the list
      setCategories(prev => prev.map(c => 
        c.id === id ? { ...c, active: result.category.active } : c
      ))
      
      alert(result.message)
    } catch (error) {
      console.error(`Error ${action}ing category:`, error)
      alert(`Failed to ${action} category`)
    }
  }

  const resetForm = () => {
    setFormData({ name: '', description: '', image: '' })
    setEditingId(null)
    setIsCreating(false)
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="px-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="px-6">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-600 mt-2">
            Manage vehicle categories for your inventory.
          </p>
        </div>
        <Button
          onClick={() => setIsCreating(true)}
          disabled={isCreating}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Category
        </Button>
      </div>

      {/* Create/Edit Form */}
      {isCreating && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{editingId ? 'Edit Category' : 'Create New Category'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Name *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Commercial Trucks"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional description for this category..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
                  rows={3}
                />
              </div>

              <div>
                <ImageSelector
                  value={formData.image}
                  onChange={(value) => setFormData({ ...formData, image: value })}
                  label="Category Image"
                  placeholder="Select an image for this category"
                  folder="uploads"
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  {editingId ? 'Update' : 'Create'} Category
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Categories List */}
      <Card>
        <CardHeader>
          <CardTitle>All Categories ({categories.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {categories.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No categories found.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className={`flex items-center gap-4 p-4 border border-gray-200 rounded-lg ${!category.active ? 'opacity-60 bg-gray-50' : ''}`}
                >
                  {/* Category Image */}
                  <div className="flex-shrink-0">
                    {category.image ? (
                      <div className="w-16 h-16 relative rounded-lg overflow-hidden">
                        <Image
                          src={category.image}
                          alt={category.name}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                        <span className="text-gray-400 text-xs text-center">No Image</span>
                      </div>
                    )}
                  </div>

                  {/* Category Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{category.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        category.active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {category.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Slug: <code className="bg-gray-100 px-2 py-1 rounded">{category.slug}</code>
                    </p>
                    {category.description && (
                      <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                    )}
                    <p className="text-sm text-gray-500 mt-1">
                      {category._count?.vehicles || 0} vehicle(s)
                      {category.activeVehicleCount !== undefined && (
                        <span className="ml-1">
                          ({category.activeVehicleCount} active)
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(category)}
                      disabled={isCreating}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleActive(category.id, category.name, category.active)}
                      disabled={isCreating || (category.active && (category.activeVehicleCount || 0) > 0)}
                      className={category.active 
                        ? "text-orange-600 hover:text-orange-800 hover:bg-orange-50" 
                        : "text-green-600 hover:text-green-800 hover:bg-green-50"
                      }
                      title={
                        category.active && (category.activeVehicleCount || 0) > 0
                          ? `Cannot deactivate: ${category.activeVehicleCount} active vehicle(s) in this category`
                          : category.active ? 'Deactivate category' : 'Activate category'
                      }
                    >
                      {category.active ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(category.id, category.name)}
                      disabled={isCreating}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}