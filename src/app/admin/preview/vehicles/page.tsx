'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Eye, Edit, ExternalLink, PowerOff, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import VehicleGrid from '@/components/vehicle-grid'
import VehicleFilters from '@/components/vehicle-filters'

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
    active: boolean
  }
  images: string[]
}

export default function AdminPreviewVehiclesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [showAdminOverlay, setShowAdminOverlay] = useState(true)
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [inactiveCount, setInactiveCount] = useState(0)

  useEffect(() => {
    if (status === 'authenticated' && (session?.user?.role === 'ADMIN' || session?.user?.role === 'MANAGER')) {
      fetchVehicleStats()
    }
  }, [status, session])

  const fetchVehicleStats = async () => {
    try {
      const response = await fetch('/api/vehicles?limit=100')
      if (response.ok) {
        const data = await response.json()
        setVehicles(data.vehicles || [])
        setInactiveCount(data.vehicles?.filter((v: Vehicle) => !v.active).length || 0)
      }
    } catch (error) {
      console.error('Error fetching vehicle stats:', error)
    }
  }

  if (status === 'loading') {
    return <div className="px-6 py-8">Loading...</div>
  }

  if (!session || session.user?.role !== 'ADMIN') {
    router.push('/admin/login')
    return null
  }

  return (
    <div className="relative">
      {/* Admin Preview Header */}
      <div className="bg-blue-600 text-white p-4 sticky top-0 z-50">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Eye className="h-5 w-5" />
            <h1 className="text-lg font-semibold">Vehicles Listing Preview</h1>
            <span className="text-blue-200 text-sm">Admin View</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowAdminOverlay(!showAdminOverlay)}
            >
              {showAdminOverlay ? 'Hide' : 'Show'} Admin Tools
            </Button>
            <Link href="/vehicles" target="_blank">
              <Button variant="secondary" size="sm">
                <ExternalLink className="h-4 w-4 mr-2" />
                View Live
              </Button>
            </Link>
            <Link href="/admin">
              <Button variant="outline" size="sm">
                Back to Admin
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Admin Overlay Panel */}
      {showAdminOverlay && (
        <div className="bg-yellow-50 border-b border-yellow-200 p-4">
          <div className="max-w-7xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Vehicles Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-white p-4 rounded-lg border">
                    <h4 className="font-medium text-gray-900">Total Vehicles</h4>
                    <p className="text-2xl font-bold text-blue-600">{vehicles.length}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border">
                    <h4 className="font-medium text-gray-900">Active Vehicles</h4>
                    <p className="text-2xl font-bold text-green-600">{vehicles.length - inactiveCount}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border">
                    <h4 className="font-medium text-gray-900">Inactive Vehicles</h4>
                    <p className="text-2xl font-bold text-orange-600">{inactiveCount}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border">
                    <h4 className="font-medium text-gray-900">Categories</h4>
                    <p className="text-2xl font-bold text-purple-600">
                      {Array.from(new Set(vehicles.map(v => v.category.name))).length}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <Link href="/admin/vehicles">
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-2" />
                      Manage Vehicles
                    </Button>
                  </Link>
                  <Link href="/admin/vehicles/create">
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Add New Vehicle
                    </Button>
                  </Link>
                  <Link href="/admin/categories">
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Manage Categories
                    </Button>
                  </Link>
                </div>

                {inactiveCount > 0 && (
                  <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="text-sm text-orange-800">
                      <PowerOff className="h-4 w-4 inline mr-1" />
                      Note: {inactiveCount} inactive vehicle(s) are hidden from public view
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Public Page Content */}
      <div className="min-h-screen pt-20 bg-background">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-6">
              Commercial Vehicle Fleet
            </h1>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Discover our comprehensive selection of premium commercial vehicles, each inspected and ready for your business needs.
            </p>
          </div>

          {/* Filters and Grid */}
          <div className="lg:grid lg:grid-cols-4 lg:gap-8">
            {/* Filters Sidebar */}
            <div className="lg:col-span-1">
              <VehicleFilters />
            </div>

            {/* Vehicle Grid */}
            <div className="lg:col-span-3 mt-8 lg:mt-0">
              <VehicleGrid />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}