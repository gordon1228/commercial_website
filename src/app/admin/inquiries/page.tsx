'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { MessageSquare, Mail, Phone, Calendar, Eye, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Inquiry {
  id: string
  customerName: string
  email: string
  phone?: string
  message: string
  status: string
  vehicleId?: string
  createdAt: string
  vehicle?: {
    id: string
    name: string
    slug: string
  }
}

const statusColors = {
  'NEW': 'bg-blue-100 text-blue-800',
  'CONTACTED': 'bg-yellow-100 text-yellow-800',
  'RESOLVED': 'bg-green-100 text-green-800',
  'CLOSED': 'bg-gray-100 text-gray-800'
}

export default function InquiriesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    if (status === 'loading') return
    if (!session || session.user?.role !== 'ADMIN') {
      router.push('/admin/login')
      return
    }

    fetchInquiries()
  }, [session, status, router])

  const fetchInquiries = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams()
      if (statusFilter) params.set('status', statusFilter)

      const response = await fetch(`/api/inquiries?${params.toString()}`)
      if (!response.ok) throw new Error('Failed to fetch inquiries')
      
      const data = await response.json()
      setInquiries(data.inquiries)
    } catch (error) {
      console.error('Error fetching inquiries:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/inquiries/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      
      if (!response.ok) throw new Error('Failed to update status')
      
      setInquiries(prev => prev.map(inquiry => 
        inquiry.id === id ? { ...inquiry, status: newStatus } : inquiry
      ))
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Failed to update status')
    }
  }

  const deleteInquiry = async (id: string) => {
    if (!confirm('Are you sure you want to delete this inquiry?')) return

    try {
      const response = await fetch(`/api/inquiries/${id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) throw new Error('Failed to delete inquiry')
      
      setInquiries(prev => prev.filter(inquiry => inquiry.id !== id))
    } catch (error) {
      console.error('Error deleting inquiry:', error)
      alert('Failed to delete inquiry')
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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customer Inquiries</h1>
          <p className="text-gray-600 mt-2">
            Manage customer inquiries and support requests.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              fetchInquiries()
            }}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="NEW">New</option>
            <option value="CONTACTED">Contacted</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>
      </div>

      {/* Inquiries List */}
      <div className="space-y-4">
        {inquiries.length > 0 ? (
          inquiries.map((inquiry) => (
            <Card key={inquiry.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="h-5 w-5 text-gray-600" />
                    <div>
                      <CardTitle className="text-lg">{inquiry.customerName}</CardTitle>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                        <div className="flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          {inquiry.email}
                        </div>
                        {inquiry.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-4 w-4" />
                            {inquiry.phone}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(inquiry.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColors[inquiry.status as keyof typeof statusColors] || statusColors.NEW}`}>
                      {inquiry.status}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {inquiry.vehicle && (
                  <div className="mb-3 p-2 bg-gray-50 rounded">
                    <span className="text-sm font-medium">Vehicle Interest: </span>
                    <span className="text-sm">{inquiry.vehicle.name}</span>
                  </div>
                )}
                <p className="text-gray-700 mb-4">{inquiry.message}</p>
                
                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    <select
                      value={inquiry.status}
                      onChange={(e) => updateStatus(inquiry.id, e.target.value)}
                      className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="NEW">New</option>
                      <option value="CONTACTED">Contacted</option>
                      <option value="RESOLVED">Resolved</option>
                      <option value="CLOSED">Closed</option>
                    </select>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(`mailto:${inquiry.email}`, '_blank')}
                    >
                      <Mail className="h-4 w-4 mr-1" />
                      Email
                    </Button>
                    {inquiry.phone && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(`tel:${inquiry.phone}`, '_blank')}
                      >
                        <Phone className="h-4 w-4 mr-1" />
                        Call
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteInquiry(inquiry.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-12">
            <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No inquiries found</h3>
            <p className="text-gray-600">
              {statusFilter ? 'Try adjusting your filter.' : 'Customer inquiries will appear here.'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}