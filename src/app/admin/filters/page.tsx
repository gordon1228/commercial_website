'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Plus, Edit2, Trash2, Save, X, Power, PowerOff, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface FilterOption {
  id: string
  type: string
  value: string
  label: string
  order: number
  active: boolean
  createdAt: string
  updatedAt: string
}

interface FormData {
  type: string
  value: string
  label: string
  order: string
}

export default function FiltersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [filterOptions, setFilterOptions] = useState<FilterOption[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [selectedType, setSelectedType] = useState<string>('all')
  const [formData, setFormData] = useState<FormData>({
    type: 'make',
    value: '',
    label: '',
    order: ''
  })

  useEffect(() => {
    if (status === 'loading') return
    if (!session || session.user?.role !== 'ADMIN') {
      router.push('/admin/login')
      return
    }

    fetchFilterOptions()
  }, [session, status, router])

  const fetchFilterOptions = async () => {
    try {
      const response = await fetch('/api/admin/filter-options')
      if (!response.ok) throw new Error('Failed to fetch filter options')
      
      const data = await response.json()
      setFilterOptions(data)
    } catch (error) {
      console.error('Error fetching filter options:', error)
      alert('Failed to fetch filter options')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.value.trim() || !formData.label.trim()) return

    try {
      const url = editingId ? `/api/admin/filter-options/${editingId}` : '/api/admin/filter-options'
      const method = editingId ? 'PUT' : 'POST'

      const body: any = {
        type: formData.type,
        value: formData.value.trim(),
        label: formData.label.trim(),
      }
      
      if (formData.order) {
        body.order = parseInt(formData.order)
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || `Failed to ${editingId ? 'update' : 'create'} filter option`)
      }

      await fetchFilterOptions()
      resetForm()
      alert(`Filter option ${editingId ? 'updated' : 'created'} successfully!`)
    } catch (error) {
      console.error('Error saving filter option:', error)
      alert(`Failed to ${editingId ? 'update' : 'create'} filter option: ${error}`)
    }
  }

  const handleEdit = (option: FilterOption) => {
    setEditingId(option.id)
    setFormData({
      type: option.type,
      value: option.value,
      label: option.label,
      order: option.order.toString()
    })
    setIsCreating(true)
  }

  const handleDelete = async (id: string, label: string) => {
    if (!confirm(`Are you sure you want to delete the filter option "${label}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/filter-options/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete filter option')
      }

      await fetchFilterOptions()
      alert('Filter option deleted successfully!')
    } catch (error) {
      console.error('Error deleting filter option:', error)
      alert(`Failed to delete filter option: ${error}`)
    }
  }

  const handleToggleActive = async (id: string, label: string, currentStatus: boolean) => {
    const action = currentStatus ? 'deactivate' : 'activate'
    if (!confirm(`Are you sure you want to ${action} the filter option "${label}"?`)) return

    try {
      const response = await fetch(`/api/admin/filter-options/${id}/toggle`, {
        method: 'PATCH',
      })

      const result = await response.json()

      if (!response.ok) {
        alert(result.error || `Failed to ${action} filter option`)
        return
      }
      
      // Update the option in the list
      setFilterOptions(prev => prev.map(opt => 
        opt.id === id ? { ...opt, active: result.filterOption.active } : opt
      ))
      
      alert(result.message)
    } catch (error) {
      console.error(`Error ${action}ing filter option:`, error)
      alert(`Failed to ${action} filter option`)
    }
  }

  const resetForm = () => {
    setFormData({ type: 'make', value: '', label: '', order: '' })
    setEditingId(null)
    setIsCreating(false)
  }

  const filteredOptions = selectedType === 'all' 
    ? filterOptions 
    : filterOptions.filter(opt => opt.type === selectedType)

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'make': return 'Make/Brand'
      case 'fuelType': return 'Fuel Type'
      default: return type
    }
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
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Filter className="h-8 w-8" />
            Vehicle Filters
          </h1>
          <p className="text-gray-600 mt-2">
            Manage filter options for vehicle search (Make/Brand and Fuel Type).
          </p>
        </div>
        <Button
          onClick={() => setIsCreating(true)}
          disabled={isCreating}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Filter Option
        </Button>
      </div>

      {/* Filter Type Selector */}
      <div className="mb-6">
        <div className="flex gap-2">
          <Button
            variant={selectedType === 'all' ? 'default' : 'outline'}
            onClick={() => setSelectedType('all')}
            size="sm"
          >
            All ({filterOptions.length})
          </Button>
          <Button
            variant={selectedType === 'make' ? 'default' : 'outline'}
            onClick={() => setSelectedType('make')}
            size="sm"
          >
            Make/Brand ({filterOptions.filter(opt => opt.type === 'make').length})
          </Button>
          <Button
            variant={selectedType === 'fuelType' ? 'default' : 'outline'}
            onClick={() => setSelectedType('fuelType')}
            size="sm"
          >
            Fuel Type ({filterOptions.filter(opt => opt.type === 'fuelType').length})
          </Button>
        </div>
      </div>

      {/* Create/Edit Form */}
      {isCreating && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{editingId ? 'Edit Filter Option' : 'Create New Filter Option'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="make">Make/Brand</option>
                    <option value="fuelType">Fuel Type</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Order
                  </label>
                  <Input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                    placeholder="Auto-assigned if empty"
                    min="1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Value *
                </label>
                <Input
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  placeholder="e.g., Ford, Electric"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Internal value used for filtering (should be unique)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Display Label *
                </label>
                <Input
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  placeholder="e.g., Ford, Electric"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Label shown to users in the filter interface
                </p>
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  {editingId ? 'Update' : 'Create'} Filter Option
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

      {/* Filter Options List */}
      <Card>
        <CardHeader>
          <CardTitle>
            {selectedType === 'all' ? 'All Filter Options' : `${getTypeLabel(selectedType)} Options`} ({filteredOptions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredOptions.length === 0 ? (
            <div className="text-center py-8">
              <Filter className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No filter options found.</p>
              <p className="text-gray-400 text-sm mt-2">Create your first filter option to get started.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOptions.map((option) => (
                <div
                  key={option.id}
                  className={`flex items-center gap-4 p-4 border border-gray-200 rounded-lg ${!option.active ? 'opacity-60 bg-gray-50' : ''}`}
                >
                  {/* Filter Option Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{option.label}</h3>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {getTypeLabel(option.type)}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        option.active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {option.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Value: <code className="bg-gray-100 px-2 py-1 rounded">{option.value}</code>
                      {' • '}Order: {option.order}
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(option)}
                      disabled={isCreating}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleActive(option.id, option.label, option.active)}
                      disabled={isCreating}
                      className={option.active 
                        ? "text-orange-600 hover:text-orange-800 hover:bg-orange-50" 
                        : "text-green-600 hover:text-green-800 hover:bg-green-50"
                      }
                      title={option.active ? 'Deactivate filter option' : 'Activate filter option'}
                    >
                      {option.active ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(option.id, option.label)}
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