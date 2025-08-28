'use client'

import { useState, useEffect } from 'react'
import { Car, Users, MessageSquare, TrendingUp, Eye, Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

const stats = [
  {
    title: 'Total Vehicles',
    value: '48',
    change: '+12%',
    changeType: 'increase',
    icon: Car
  },
  {
    title: 'Active Users',
    value: '1,234',
    change: '+18%',
    changeType: 'increase',
    icon: Users
  },
  {
    title: 'Pending Inquiries',
    value: '23',
    change: '+5%',
    changeType: 'increase',
    icon: MessageSquare
  },
  {
    title: 'Monthly Revenue',
    value: '$125,000',
    change: '+23%',
    changeType: 'increase',
    icon: TrendingUp
  }
]

const recentInquiries = [
  {
    id: 1,
    name: 'John Smith',
    email: 'john@company.com',
    vehicle: 'Mercedes Sprinter 3500',
    type: 'Quote Request',
    date: '2024-01-15',
    status: 'new'
  },
  {
    id: 2,
    name: 'Sarah Johnson',
    email: 'sarah@logistics.com',
    vehicle: 'Ford F-650 Box Truck',
    type: 'General Inquiry',
    date: '2024-01-14',
    status: 'responded'
  },
  {
    id: 3,
    name: 'Mike Wilson',
    email: 'mike@transport.com',
    vehicle: 'Freightliner Cascadia',
    type: 'Schedule Visit',
    date: '2024-01-13',
    status: 'scheduled'
  }
]

const recentVehicles = [
  {
    id: 1,
    name: 'Mercedes Sprinter 3500',
    price: 75000,
    status: 'AVAILABLE',
    views: 234,
    inquiries: 12
  },
  {
    id: 2,
    name: 'Ford F-650 Box Truck',
    price: 89000,
    status: 'AVAILABLE',
    views: 189,
    inquiries: 8
  },
  {
    id: 3,
    name: 'Blue Bird School Bus',
    price: 125000,
    status: 'RESERVED',
    views: 156,
    inquiries: 15
  }
]

export default function AdminDashboard() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <div className="px-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="px-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600 mt-2">
          Welcome to your EliteFleet admin dashboard. Here's what's happening with your business today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className="bg-white border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                    <p className={`text-xs mt-1 ${
                      stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.change} from last month
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                    <Icon className="h-6 w-6 text-gray-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Inquiries */}
        <Card className="bg-white border border-gray-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl text-gray-900">Recent Inquiries</CardTitle>
              <Link href="/admin/inquiries">
                <Button variant="secondary" size="sm">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentInquiries.map((inquiry) => (
                <div key={inquiry.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div>
                        <h4 className="font-medium text-gray-900">{inquiry.name}</h4>
                        <p className="text-sm text-gray-600">{inquiry.email}</p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm font-medium text-gray-900">{inquiry.vehicle}</p>
                      <p className="text-xs text-gray-500">{inquiry.type} • {inquiry.date}</p>
                    </div>
                  </div>
                  <div className="ml-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      inquiry.status === 'new' 
                        ? 'bg-blue-100 text-blue-800'
                        : inquiry.status === 'responded'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {inquiry.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Popular Vehicles */}
        <Card className="bg-white border border-gray-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl text-gray-900">Popular Vehicles</CardTitle>
              <Link href="/admin/vehicles">
                <Button variant="secondary" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Vehicle
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentVehicles.map((vehicle) => (
                <div key={vehicle.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">{vehicle.name}</h4>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        vehicle.status === 'AVAILABLE' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {vehicle.status}
                      </span>
                    </div>
                    <p className="text-lg font-bold text-gray-900 mt-1">
                      ${vehicle.price.toLocaleString()}
                    </p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Eye className="h-4 w-4 mr-1" />
                        {vehicle.views} views
                      </div>
                      <div className="flex items-center">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        {vehicle.inquiries} inquiries
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <Card className="bg-white border border-gray-200">
          <CardHeader>
            <CardTitle className="text-xl text-gray-900">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href="/admin/vehicles">
                <Button variant="secondary" className="w-full h-16">
                  <div className="text-center">
                    <Car className="h-6 w-6 mx-auto mb-1" />
                    <div className="text-sm">Manage Vehicles</div>
                  </div>
                </Button>
              </Link>
              <Link href="/admin/inquiries">
                <Button variant="secondary" className="w-full h-16">
                  <div className="text-center">
                    <MessageSquare className="h-6 w-6 mx-auto mb-1" />
                    <div className="text-sm">View Inquiries</div>
                  </div>
                </Button>
              </Link>
              <Link href="/admin/users">
                <Button variant="secondary" className="w-full h-16">
                  <div className="text-center">
                    <Users className="h-6 w-6 mx-auto mb-1" />
                    <div className="text-sm">User Management</div>
                  </div>
                </Button>
              </Link>
              <Link href="/admin/settings">
                <Button variant="secondary" className="w-full h-16">
                  <div className="text-center">
                    <TrendingUp className="h-6 w-6 mx-auto mb-1" />
                    <div className="text-sm">Analytics</div>
                  </div>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}