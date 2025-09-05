'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Car, Users, MessageSquare, TrendingUp, Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Eye } from "lucide-react";

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

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentInquiries, setRecentInquiries] = useState<RecentInquiry[]>([])
  const [recentVehicles, setRecentVehicles] = useState<RecentVehicle[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [fetchingData, setFetchingData] = useState(false)


  useEffect(() => {
    if (status === 'loading') return

    // Check if user is authenticated and has admin/manager role
    // USER role should be redirected to inquiries page
    if (status === 'unauthenticated') {
      router.push('/admin/login')
      return
    }
    
    if (session?.user?.role === 'USER') {
      router.push('/admin/inquiries')
      return
    }
    
    if (session?.user?.role !== 'ADMIN' && session?.user?.role !== 'MANAGER') {
      router.push('/admin/login')
      return
    }

    fetchDashboardData()
  }, [status, session, router, fetchDashboardData])

  const fetchDashboardData = useCallback(async () => {
    // Prevent multiple simultaneous fetches
    if (fetchingData) {
      console.log('Already fetching data, skipping...')
      return
    }
    
    try {
      setFetchingData(true)
      setIsLoading(true)
      
      // Wait a bit to prevent rapid succession calls
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Fetch dashboard stats with cache-busting
      const timestamp = Date.now()
      
      console.log('Fetching dashboard data...')
      
      const [statsRes, inquiriesRes, vehiclesRes] = await Promise.all([
        fetch(`/api/admin/dashboard/stats?_t=${timestamp}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          },
          credentials: 'include',
          cache: 'no-store'
        }),
        fetch(`/api/inquiries?limit=5&sort=recent&_t=${timestamp}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          },
          credentials: 'include',
          cache: 'no-store'
        }),
        fetch(`/api/vehicles?limit=5&sort=recent&_t=${timestamp}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          },
          credentials: 'include',
          cache: 'no-store'
        })
      ])

      console.log('API responses:', { 
        stats: statsRes.status, 
        inquiries: inquiriesRes.status, 
        vehicles: vehiclesRes.status 
      })

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        console.log('Stats data:', statsData)
        setStats(statsData)
      } else {
        console.error('Failed to fetch stats:', statsRes.status, statsRes.statusText)
      }

      if (inquiriesRes.ok) {
        const inquiriesData = await inquiriesRes.json()
        const inquiries = Array.isArray(inquiriesData) ? inquiriesData : inquiriesData.inquiries || []
        console.log('Inquiries data:', inquiries.length, 'items')
        setRecentInquiries(inquiries)
      } else {
        console.error('Failed to fetch inquiries:', inquiriesRes.status, inquiriesRes.statusText)
        setRecentInquiries([])
      }

      if (vehiclesRes.ok) {
        const vehiclesData = await vehiclesRes.json()
        const vehicles = Array.isArray(vehiclesData) ? vehiclesData : vehiclesData.vehicles || []
        console.log('Vehicles data:', vehicles.length, 'items')
        setRecentVehicles(vehicles)
      } else {
        console.error('Failed to fetch vehicles:', vehiclesRes.status, vehiclesRes.statusText)
        setRecentVehicles([])
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      // Set empty arrays to prevent UI from showing stale data
      setRecentInquiries([])
      setRecentVehicles([])
    } finally {
      setIsLoading(false)
      setFetchingData(false)
    }
  }, [fetchingData])


  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (status === 'unauthenticated' || !['ADMIN', 'MANAGER'].includes(session?.user?.role)) {
    return null
  }

  const dashboardStats = [
    {
      title: 'Total Trucks',
      value: stats?.vehiclesCount?.toString() || '0',
      icon: Car,
      href: '/admin/vehicles'
    },
    {
      title: 'Active Users',
      value: stats?.usersCount?.toString() || '0',
      icon: Users,
      href: '/admin/users'
    },
    {
      title: 'Total Inquiries',
      value: stats?.inquiriesCount?.toString() || '0',
      icon: MessageSquare,
      href: '/admin/inquiries'
    },
    {
      title: 'Pending Inquiries',
      value: stats?.pendingInquiriesCount?.toString() || '0',
      icon: TrendingUp,
      href: '/admin/inquiries?status=NEW'
    }
  ]

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
        {dashboardStats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Link key={index} href={stat.href}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </CardTitle>
                  <Icon className="h-4 w-4 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
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
                        <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                          inquiry.status === 'NEW' ? 'bg-blue-100 text-blue-800' :
                          inquiry.status === 'CONTACTED' ? 'bg-yellow-100 text-yellow-800' :
                          inquiry.status === 'RESOLVED' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
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
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                        vehicle.status === 'AVAILABLE' ? 'bg-green-100 text-green-800' :
                        vehicle.status === 'SOLD' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
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
            <Link href="/admin/vehicles/create">
              <Button variant="outline" size="lg" className="w-full h-20 flex flex-col gap-2">
                <Plus className="h-5 w-5" />
                Add Truck
              </Button>
            </Link>
            <Link href="/admin/inquiries">
              <Button variant="outline" size="lg" className="w-full h-20 flex flex-col gap-2">
                <MessageSquare className="h-5 w-5" />
                View Inquiries
              </Button>
            </Link>
            <Link href="/admin/preview">
              <Button variant="outline" size="lg" className="w-full h-20 flex flex-col gap-2">
                <Eye className="h-5 w-5" />
                Preview Homepage
              </Button>
            </Link>
            <Link href="/admin/settings">
              <Button variant="outline" size="lg" className="w-full h-20 flex flex-col gap-2">
                <TrendingUp className="h-5 w-5" />
                Settings
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}