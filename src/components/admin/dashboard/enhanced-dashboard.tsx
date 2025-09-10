'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { 
  Car, Users, MessageSquare, TrendingUp, Plus, Eye, Activity,
  ArrowUp, ArrowDown, Calendar, Clock, DollarSign, Target,
  AlertTriangle, CheckCircle, XCircle, Zap, BarChart3
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface DashboardStats {
  vehiclesCount: number;
  usersCount: number;
  inquiriesCount: number;
  pendingInquiriesCount: number;
  // Enhanced stats
  revenueThisMonth?: number;
  averageResponseTime?: number;
  conversionRate?: number;
  activeListings?: number;
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
  priority?: 'HIGH' | 'MEDIUM' | 'LOW';
}

interface RecentVehicle {
  id: string;
  name: string;
  price: number;
  status: string;
  slug: string;
  createdAt: string;
  _count?: {
    inquiries: number;
  };
}

interface PerformanceMetric {
  label: string;
  value: string;
  change: number;
  trend: 'up' | 'down' | 'stable';
  icon: React.ComponentType<{ className?: string }>;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  variant: 'primary' | 'secondary' | 'success' | 'warning';
}

export default function EnhancedAdminDashboard() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentInquiries, setRecentInquiries] = useState<RecentInquiry[]>([])
  const [recentVehicles, setRecentVehicles] = useState<RecentVehicle[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const dataFetched = useRef(false)

  // Enhanced metrics for performance tracking
  const performanceMetrics: PerformanceMetric[] = [
    {
      label: 'Response Time',
      value: stats?.averageResponseTime ? `${stats.averageResponseTime}h` : '2.4h',
      change: -12,
      trend: 'up',
      icon: Clock
    },
    {
      label: 'Conversion Rate',
      value: stats?.conversionRate ? `${stats.conversionRate}%` : '24%',
      change: 8,
      trend: 'up',
      icon: Target
    },
    {
      label: 'Revenue MTD',
      value: stats?.revenueThisMonth ? `$${(stats.revenueThisMonth / 1000).toFixed(0)}k` : '$127k',
      change: 15,
      trend: 'up',
      icon: DollarSign
    },
    {
      label: 'Active Listings',
      value: stats?.activeListings?.toString() || '89',
      change: 3,
      trend: 'up',
      icon: Activity
    }
  ]

  const quickActions: QuickAction[] = [
    {
      id: 'add-vehicle',
      title: 'Add New Vehicle',
      description: 'List a new commercial vehicle',
      icon: Plus,
      href: '/admin/vehicles/create',
      variant: 'primary'
    },
    {
      id: 'urgent-inquiries',
      title: 'Urgent Inquiries',
      description: 'Review high-priority requests',
      icon: AlertTriangle,
      href: '/admin/inquiries?priority=HIGH',
      variant: 'warning'
    },
    {
      id: 'analytics',
      title: 'View Analytics',
      description: 'Detailed performance insights',
      icon: BarChart3,
      href: '/admin/analytics',
      variant: 'secondary'
    },
    {
      id: 'settings',
      title: 'System Settings',
      description: 'Configure platform settings',
      icon: Eye,
      href: '/admin/settings',
      variant: 'secondary'
    }
  ]

  const fetchDashboardData = useCallback(async () => {
    if (dataFetched.current) return
    
    try {
      setIsLoading(true)
      
      const [statsRes, inquiriesRes, vehiclesRes] = await Promise.all([
        fetch('/api/admin/dashboard/stats'),
        fetch('/api/inquiries?limit=5&sort=recent'),
        fetch('/api/vehicles?limit=5&sort=recent')
      ])

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData)
      }

      if (inquiriesRes.ok) {
        const inquiriesData = await inquiriesRes.json()
        const inquiries = Array.isArray(inquiriesData) ? inquiriesData : inquiriesData.inquiries || []
        setRecentInquiries(inquiries)
      }

      if (vehiclesRes.ok) {
        const vehiclesData = await vehiclesRes.json()
        const vehicles = Array.isArray(vehiclesData) ? vehiclesData : vehiclesData.vehicles || []
        setRecentVehicles(vehicles)
      }
      
      dataFetched.current = true
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (session?.user?.role && ['ADMIN', 'MANAGER'].includes(session.user.role)) {
      fetchDashboardData()
    }
  }, [session?.user?.role, fetchDashboardData])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'NEW': return AlertTriangle
      case 'RESOLVED': return CheckCircle
      case 'CLOSED': return XCircle
      default: return MessageSquare
    }
  }

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'HIGH': return 'bg-red-100 text-red-800 border-red-200'
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'LOW': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getVariantStyles = (variant: string) => {
    switch (variant) {
      case 'primary': return 'border-blue-200 hover:border-blue-300 bg-blue-50 hover:bg-blue-100'
      case 'success': return 'border-green-200 hover:border-green-300 bg-green-50 hover:bg-green-100'
      case 'warning': return 'border-orange-200 hover:border-orange-300 bg-orange-50 hover:bg-orange-100'
      default: return 'border-gray-200 hover:border-gray-300 bg-gray-50 hover:bg-gray-100'
    }
  }

  if (isLoading) {
    return (
      <div className="px-6 py-8 animate-in fade-in duration-500">
        <div className="space-y-8">
          {/* Header Skeleton */}
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded-lg w-64 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-96 animate-pulse" />
          </div>
          
          {/* Stats Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse" />
            ))}
          </div>
          
          {/* Performance Metrics Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="px-6 py-8 animate-in slide-up duration-700">
      {/* Enhanced Header */}
      <div className="mb-8 relative">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              Good {new Date().getHours() < 12 ? 'morning' : 'afternoon'}, {session?.user?.email?.split('@')[0]}
            </h1>
            <p className="text-gray-600 mt-2 text-lg">
              Here's your business overview for {new Date().toLocaleDateString('en-US', { 
                weekday: 'long',
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="px-3 py-1 text-sm">
              <Calendar className="w-4 h-4 mr-2" />
              Last updated: {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </Badge>
          </div>
        </div>
        
        {/* Decorative Element */}
        <div className="absolute -top-2 -right-2 w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full opacity-20 -z-10" />
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Total Vehicles</CardTitle>
            <Car className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900">{stats?.vehiclesCount || 0}</div>
            <p className="text-xs text-blue-600 mt-1">Active listings</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Total Users</CardTitle>
            <Users className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-900">{stats?.usersCount || 0}</div>
            <p className="text-xs text-green-600 mt-1">Registered users</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-purple-50 to-purple-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Total Inquiries</CardTitle>
            <MessageSquare className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-900">{stats?.inquiriesCount || 0}</div>
            <p className="text-xs text-purple-600 mt-1">All time inquiries</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-orange-50 to-orange-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-orange-700">Pending Actions</CardTitle>
            <AlertTriangle className="h-5 w-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-900">{stats?.pendingInquiriesCount || 0}</div>
            <p className="text-xs text-orange-600 mt-1">Need attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {performanceMetrics.map((metric) => {
          const Icon = metric.icon
          return (
            <Card key={metric.label} className="border border-gray-200 hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{metric.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Icon className="h-5 w-5 text-gray-400" />
                    <div className={cn(
                      "flex items-center text-sm",
                      metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    )}>
                      {metric.trend === 'up' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                      <span>{Math.abs(metric.change)}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick Actions */}
      <Card className="mb-8 border-0 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <Link key={action.id} href={action.href}>
                  <Card className={cn(
                    "cursor-pointer transition-all duration-200 hover:scale-105 border-2",
                    getVariantStyles(action.variant)
                  )}>
                    <CardContent className="p-6 text-center">
                      <Icon className="h-8 w-8 mx-auto mb-3 text-gray-600" />
                      <h3 className="font-semibold text-gray-900 mb-1">{action.title}</h3>
                      <p className="text-sm text-gray-600">{action.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Enhanced Recent Inquiries */}
        <Card className="border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Recent Inquiries
            </CardTitle>
            <Link href="/admin/inquiries">
              <Button variant="outline" size="sm" className="hover:bg-blue-50">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentInquiries.length > 0 ? (
              recentInquiries.map((inquiry) => {
                const StatusIcon = getStatusIcon(inquiry.status)
                return (
                  <Link 
                    key={inquiry.id} 
                    href={`/admin/inquiries?highlight=${inquiry.id}`}
                    className="block"
                  >
                    <div className="p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-200 hover:shadow-sm transition-all duration-200 cursor-pointer">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium text-gray-900 truncate">{inquiry.customerName}</h4>
                            {inquiry.priority && (
                              <Badge className={cn("text-xs px-2 py-0.5", getPriorityColor(inquiry.priority))}>
                                {inquiry.priority}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 truncate mb-1">{inquiry.email}</p>
                          {inquiry.vehicle && (
                            <p className="text-xs text-blue-600 truncate font-medium">{inquiry.vehicle.name}</p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-2 ml-4">
                          <div className="flex items-center gap-1">
                            <StatusIcon className="h-4 w-4 text-gray-400" />
                            <span className="text-xs text-gray-500 capitalize">
                              {inquiry.status.toLowerCase()}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">
                            {new Date(inquiry.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })
            ) : (
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No recent inquiries</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Enhanced Recent Vehicles */}
        <Card className="border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Car className="h-5 w-5" />
              Recent Vehicles
            </CardTitle>
            <Link href="/admin/vehicles">
              <Button variant="outline" size="sm" className="hover:bg-green-50">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentVehicles.length > 0 ? (
              recentVehicles.map((vehicle) => (
                <div key={vehicle.id} className="p-4 bg-white border border-gray-200 rounded-lg hover:border-green-200 hover:shadow-sm transition-all duration-200">
                  <div className="flex items-start justify-between">
                    <Link 
                      href={`/vehicles/${vehicle.slug}`}
                      className="flex-1 min-w-0 cursor-pointer group"
                    >
                      <h4 className="font-medium text-gray-900 group-hover:text-green-600 truncate mb-1">{vehicle.name}</h4>
                      <p className="text-lg font-semibold text-green-600 mb-2">
                        ${vehicle.price.toLocaleString()}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge variant={vehicle.status === 'AVAILABLE' ? 'success' : 'secondary'} className="text-xs">
                          {vehicle.status}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {vehicle._count?.inquiries || 0} inquiries
                        </span>
                      </div>
                    </Link>
                    <div className="flex flex-col gap-2 ml-4">
                      <Link 
                        href={`/admin/vehicles/edit/${vehicle.id}`}
                        className="text-xs text-blue-600 hover:text-blue-800 hover:underline font-medium"
                      >
                        Edit
                      </Link>
                      <p className="text-xs text-gray-500">
                        {new Date(vehicle.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <Car className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No vehicles found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}