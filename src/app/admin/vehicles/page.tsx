'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Plus, Edit, Trash2, Eye, Search, Filter, ChevronUp, ChevronDown, Power, PowerOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Image from 'next/image'
import Link from 'next/link'

interface Vehicle {
  id: string
  name: string
  slug: string
  price: number
  status: string
  active: boolean
  category: {
    id: string
    name: string
  }
  images: string[]
  createdAt: string
  updatedAt: string
}

interface Category {
  id: string
  name: string
  slug: string
}

type SortField = 'name' | 'category' | 'price' | 'status' | 'updatedAt'
type SortDirection = 'asc' | 'desc'

export default function AdminVehiclesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [sortField, setSortField] = useState<SortField>('updatedAt')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  useEffect(() => {
    if (status === 'loading') return
    if (!session || session.user?.role !== 'ADMIN') {
      router.push('/admin/login')
      return
    }

    fetchCategories()
    fetchVehicles()
  }, [session, status, router])

  useEffect(() => {
    if (vehicles.length > 0) {
      sortVehicles()
    }
  }, [sortField, sortDirection])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchVehicles = async () => {
    try {
      const params = new URLSearchParams()
      if (searchTerm) params.set('search', searchTerm)
      if (statusFilter) params.set('status', statusFilter)
      if (categoryFilter) params.set('category', categoryFilter)
      params.set('limit', '100') // Get more vehicles for admin

      const response = await fetch(`/api/vehicles?${params.toString()}`)
      if (!response.ok) throw new Error('Failed to fetch vehicles')

      const data = await response.json()
      setVehicles(data.vehicles)
    } catch (error) {
      console.error('Error fetching vehicles:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const sortVehicles = () => {
    const sorted = [...vehicles].sort((a, b) => {
      let aValue: string | number | Date
      let bValue: string | number | Date

      switch (sortField) {
        case 'name':
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case 'category':
          aValue = a.category.name.toLowerCase()
          bValue = b.category.name.toLowerCase()
          break
        case 'price':
          aValue = a.price
          bValue = b.price
          break
        case 'status':
          aValue = a.status
          bValue = b.status
          break
        case 'updatedAt':
          aValue = new Date(a.updatedAt)
          bValue = new Date(b.updatedAt)
          break
        default:
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
      }

      if (aValue < bValue) {
        return sortDirection === 'asc' ? -1 : 1
      }
      if (aValue > bValue) {
        return sortDirection === 'asc' ? 1 : -1
      }
      return 0
    })

    setVehicles(sorted)
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction if clicking the same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      // Set new field with default ascending direction
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return null
    }
    return sortDirection === 'asc' ? (
      <ChevronUp className="h-4 w-4 inline ml-1" />
    ) : (
      <ChevronDown className="h-4 w-4 inline ml-1" />
    )
  }

  const handleDeleteVehicle = async (vehicleId: string) => {
    if (!confirm('Are you sure you want to delete this truck?')) return

    try {
      const response = await fetch(`/api/vehicles/${vehicleId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete truck')

      setVehicles(prev => prev.filter(v => v.id !== vehicleId))
      alert('Truck deleted successfully')
    } catch (error) {
      console.error('Error deleting truck:', error)
      alert('Failed to delete truck')
    }
  }

  const handleToggleActive = async (vehicleId: string, currentStatus: boolean) => {
    const action = currentStatus ? 'deactivate' : 'activate'
    if (!confirm(`Are you sure you want to ${action} this truck?`)) return

    try {
      const response = await fetch(`/api/vehicles/${vehicleId}/toggle-active`, {
        method: 'PATCH',
      })

      if (!response.ok) throw new Error(`Failed to ${action} truck`)

      const result = await response.json()
      
      // Update the vehicle in the list
      setVehicles(prev => prev.map(v => 
        v.id === vehicleId ? { ...v, active: result.vehicle.active } : v
      ))
      
      alert(result.message)
    } catch (error) {
      console.error(`Error ${action}ing truck:`, error)
      alert(`Failed to ${action} truck`)
    }
  }

  const handleSearch = () => {
    fetchVehicles()
  }

  const clearFilters = () => {
    setSearchTerm('')
    setStatusFilter('')
    setCategoryFilter('')
    fetchVehicles()
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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Truck Management</h1>
          <p className="text-gray-600 mt-2">
            Manage your truck inventory - add, edit, or remove trucks from your fleet.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/preview/vehicles">
            <Button variant="outline" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Preview Listing
            </Button>
          </Link>
          <Link href="/admin/vehicles/create">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add New Vehicle
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Input
                placeholder="Search vehicles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="AVAILABLE">Available</option>
                <option value="RESERVED">Reserved</option>
                <option value="SOLD">Sold</option>
              </select>
            </div>
            <div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.slug} value={category.slug}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSearch} className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                Search
              </Button>
              <Button variant="outline" onClick={clearFilters}>
                Clear
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="mb-6">
        <p className="text-gray-600">
          Showing {vehicles.length} vehicle{vehicles.length !== 1 ? 's' : ''}
          {sortField && (
            <span className="ml-2 text-sm">
              (sorted by {sortField} {sortDirection === 'asc' ? '↑' : '↓'})
            </span>
          )}
        </p>
      </div>

      {/* Vehicles Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th 
                    className="text-left py-3 px-4 font-medium text-gray-900 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('name')}
                  >
                    Vehicle {getSortIcon('name')}
                  </th>
                  <th 
                    className="text-left py-3 px-4 font-medium text-gray-900 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('category')}
                  >
                    Category {getSortIcon('category')}
                  </th>
                  <th 
                    className="text-left py-3 px-4 font-medium text-gray-900 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('price')}
                  >
                    Price {getSortIcon('price')}
                  </th>
                  <th 
                    className="text-left py-3 px-4 font-medium text-gray-900 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('status')}
                  >
                    Status {getSortIcon('status')}
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">
                    Active
                  </th>
                  <th 
                    className="text-left py-3 px-4 font-medium text-gray-900 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('updatedAt')}
                  >
                    Updated {getSortIcon('updatedAt')}
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {vehicles.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-gray-500">
                      No vehicles found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  vehicles.map((vehicle) => (
                    <tr key={vehicle.id} className={`hover:bg-gray-50 ${!vehicle.active ? 'opacity-60 bg-gray-25' : ''}`}>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded bg-gray-100 flex items-center justify-center overflow-hidden relative">
                            {vehicle.images?.[0] && vehicle.images[0].trim() !== '' ? (
                              <Image
                                src={vehicle.images[0]}
                                alt={vehicle.name}
                                fill
                                className="object-cover"
                                sizes="48px"
                              />
                            ) : (
                              <div className="text-gray-400 text-xs text-center">
                                <div>📷</div>
                                <div className="text-[8px]">No Image</div>
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{vehicle.name}</div>
                            <div className="text-sm text-gray-500">{vehicle.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-900">
                        {vehicle.category.name}
                      </td>
                      <td className="py-4 px-4 text-gray-900 font-medium">
                        ${vehicle.price.toLocaleString()}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          vehicle.status === 'AVAILABLE' 
                            ? 'bg-green-100 text-green-800' 
                            : vehicle.status === 'RESERVED'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {vehicle.status}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          vehicle.active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {vehicle.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-500">
                        {new Date(vehicle.updatedAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <Link href={`/admin/preview/vehicles/${vehicle.slug}`}>
                            <Button variant="ghost" size="sm" title="Admin Preview">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/admin/vehicles/edit/${vehicle.id}`}>
                            <Button variant="ghost" size="sm" title="Edit Vehicle">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleToggleActive(vehicle.id, vehicle.active)}
                            className={vehicle.active 
                              ? "text-orange-600 hover:text-orange-800 hover:bg-orange-50" 
                              : "text-green-600 hover:text-green-800 hover:bg-green-50"
                            }
                            title={vehicle.active ? 'Deactivate vehicle' : 'Activate vehicle'}
                          >
                            {vehicle.active ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeleteVehicle(vehicle.id)}
                            className="text-red-600 hover:text-red-800 hover:bg-red-50"
                            title="Delete Vehicle"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}