'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { Car, Users, MessageSquare, TrendingUp, Plus, Eye } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useJsonData } from '@/lib/data-loader'
import type { DashboardConfig, StatusColorMappings } from '@/types/data-config'

interface DashboardStats {
  vehiclesCount: number;
  usersCount: number;
  inquiriesCount: number;
  pendingInquiriesCount: number;
}

interface RecentInquiry {
  id: string;
  customerName: string;
  email: string;
  message: string;
  vehicle?: {
    name: string;
  } | null;
  createdAt: string;
  status: string;
}

// Icon mapping for dynamic rendering
const iconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
  Car,
  Users,
  MessageSquare,
  TrendingUp,
  Plus,
  Eye
}

interface RecentVehicle {
  id: string;
  name: string;
  price: number;
  status: string;
  slug: string;
  _count?: {
    inquiries: number;
  };
}

// Fallback dashboard configuration
const defaultDashboardConfig: DashboardConfig = {
  stats: [
    { id: 'vehicles', title: 'Total Trucks', icon: 'Car', href: '/admin/vehicles', dataKey: 'vehiclesCount' },
    { id: 'users', title: 'Active Users', icon: 'Users', href: '/admin/users', dataKey: 'usersCount' },
    { id: 'inquiries', title: 'Total Inquiries', icon: 'MessageSquare', href: '/admin/inquiries', dataKey: 'inquiriesCount' },
    { id: 'pending', title: 'Pending Inquiries', icon: 'TrendingUp', href: '/admin/inquiries?status=NEW', dataKey: 'pendingInquiriesCount' }
  ],
  quickActions: [
    { id: 'add-vehicle', title: 'Add Truck', icon: 'Plus', href: '/admin/vehicles/create' },
    { id: 'view-inquiries', title: 'View Inquiries', icon: 'MessageSquare', href: '/admin/inquiries' },
    { id: 'preview-homepage', title: 'Preview Homepage', icon: 'Eye', href: '/admin/preview' },
    { id: 'settings', title: 'Settings', icon: 'TrendingUp', href: '/admin/settings' }
  ]
}

// Fallback status color mappings
const defaultStatusColors: StatusColorMappings = {
  inquiryStatus: {
    'NEW': 'bg-blue-100 text-blue-800',
    'CONTACTED': 'bg-yellow-100 text-yellow-800',
    'RESOLVED': 'bg-green-100 text-green-800',
    'CLOSED': 'bg-gray-100 text-gray-800',
    'default': 'bg-gray-100 text-gray-800'
  },
  vehicleStatus: {
    'AVAILABLE': 'bg-green-100 text-green-800',
    'SOLD': 'bg-red-100 text-red-800',
    'RESERVED': 'bg-yellow-100 text-yellow-800',
    'default': 'bg-gray-100 text-gray-800'
  }
}

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentInquiries, setRecentInquiries] = useState<RecentInquiry[]>([])
  const [recentVehicles, setRecentVehicles] = useState<RecentVehicle[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [fetchingData, setFetchingData] = useState(false)
  const dataFetched = useRef(false)

  // Load dashboard and status color configuration from JSON
  const { data: dashboardConfig } = useJsonData<DashboardConfig>('admin/dashboard.json', defaultDashboardConfig)
  const { data: statusColors } = useJsonData<StatusColorMappings>('admin/status-colors.json', defaultStatusColors)

  const fetchDashboardData = useCallback(async () => {
    // Prevent multiple simultaneous fetches and re-fetching
    if (fetchingData || dataFetched.current) {
      console.log('Already fetching data or data already fetched, skipping...')
      return
    }
    
    try {
      setFetchingData(true)
      setIsLoading(true)
      
      console.log('Fetching dashboard data...')
      
      const [statsRes, inquiriesRes, vehiclesRes] = await Promise.all([
        fetch('/api/admin/dashboard/stats', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        }),
        fetch('/api/inquiries?limit=5&sort=recent', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        }),
        fetch('/api/vehicles?limit=5&sort=recent', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        })
      ])

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData)
      }

      if (inquiriesRes.ok) {
        const inquiriesData = await inquiriesRes.json()
        const inquiries = Array.isArray(inquiriesData) ? inquiriesData : inquiriesData.inquiries || []
        setRecentInquiries(inquiries)
      } else {
        setRecentInquiries([])
      }

      if (vehiclesRes.ok) {
        const vehiclesData = await vehiclesRes.json()
        const vehicles = Array.isArray(vehiclesData) ? vehiclesData : vehiclesData.vehicles || []
        setRecentVehicles(vehicles)
      } else {
        setRecentVehicles([])
      }
      
      dataFetched.current = true
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setRecentInquiries([])
      setRecentVehicles([])
    } finally {
      setIsLoading(false)
      setFetchingData(false)
    }
  }, [fetchingData])

  useEffect(() => {
    if (status === 'loading') return

    // Only fetch data once for authenticated ADMIN/MANAGER users
    if (status === 'authenticated' && (session?.user?.role === 'ADMIN' || session?.user?.role === 'MANAGER') && !dataFetched.current) {
      fetchDashboardData()
    }
  }, [status, session?.user?.role, fetchDashboardData])

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Let middleware handle authentication and authorization
  if (status === 'unauthenticated' || !session?.user?.role) {
    return null
  }

  // This page is only for ADMIN and MANAGER roles
  if (!['ADMIN', 'MANAGER'].includes(session.user.role)) {
    return null
  }

  // Helper function to get status color class
  const getStatusColor = (status: string, type: 'inquiry' | 'vehicle') => {
    const colorMap = type === 'inquiry' ? statusColors?.inquiryStatus : statusColors?.vehicleStatus
    return colorMap?.[status] || colorMap?.default || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="px-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600 mt-2">
          Welcome back, {session?.user?.email}. Here&apos;s what&apos;s happening with your business today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {dashboardConfig?.stats.map((stat) => {
          const Icon = iconMap[stat.icon] || iconMap.TrendingUp
          const value = stats?.[stat.dataKey as keyof DashboardStats]?.toString() || '0'
          return (
            <Link key={stat.id} href={stat.href}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </CardTitle>
                  <Icon className="h-4 w-4 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{value}</div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      {/* Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Recent Inquiries */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">Recent Inquiries</CardTitle>
            <Link href="/admin/inquiries">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentInquiries.length > 0 ? (
                recentInquiries.map((inquiry) => (
                  <Link 
                    key={inquiry.id} 
                    href={`/admin/inquiries?highlight=${inquiry.id}`}
                    className="block"
                  >
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors h-24">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">{inquiry.customerName}</h4>
                        <p className="text-sm text-gray-600 truncate">{inquiry.email}</p>
                        {inquiry.vehicle && (
                          <p className="text-xs text-blue-600 truncate">{inquiry.vehicle.name}</p>
                        )}
                      </div>
                      <div className="text-right flex flex-col items-end gap-1 ml-4">
                        <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColor(inquiry.status, 'inquiry')}`}>
                          {inquiry.status}
                        </span>
                        <p className="text-xs text-gray-500">
                          {new Date(inquiry.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">No recent inquiries</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Trucks */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">Recent Trucks</CardTitle>
            <Link href="/admin/vehicles">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentVehicles.length > 0 ? (
                recentVehicles.map((vehicle) => (
                  <div key={vehicle.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors h-24">
                    <Link 
                      href={`/vehicles/${vehicle.slug}`}
                      className="flex-1 min-w-0 cursor-pointer"
                    >
                      <div>
                        <h4 className="font-medium text-gray-900 hover:text-blue-600 truncate">{vehicle.name}</h4>
                        <p className="text-lg font-semibold text-blue-600">
                          ${vehicle.price.toLocaleString()}
                        </p>
                      </div>
                    </Link>
                    <div className="text-right flex flex-col items-end gap-1 ml-4">
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColor(vehicle.status, 'vehicle')}`}>
                        {vehicle.status}
                      </span>
                      <p className="text-xs text-gray-500">
                        {vehicle._count?.inquiries || 0} inquiries
                      </p>
                      <Link 
                        href={`/admin/vehicles/edit/${vehicle.id}`}
                        className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        Edit
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">No trucks found</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {dashboardConfig?.quickActions.map((action) => {
              const Icon = iconMap[action.icon] || iconMap.TrendingUp
              return (
                <Link key={action.id} href={action.href}>
                  <Button variant="outline" size="lg" className="w-full h-20 flex flex-col gap-2">
                    <Icon className="h-5 w-5" />
                    {action.title}
                  </Button>
                </Link>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}