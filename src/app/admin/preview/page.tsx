'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Eye, Edit, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

// Import public page components
import HeroSection from '@/components/hero-section'
import ComingSoonSection from '@/components/coming-soon-section'
import FeaturedVehicles from '@/components/featured-vehicles'
import VehicleCategories from '@/components/vehicle-categories'
import TrustSection from '@/components/trust-section'

export default function AdminPreviewHomepage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [showAdminOverlay, setShowAdminOverlay] = useState(true)

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
            <h1 className="text-lg font-semibold">Homepage Preview</h1>
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
            <Link href="/" target="_blank">
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
                <CardTitle className="text-lg">Homepage Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Homepage Content</h4>
                    <Link href="/admin/homepage">
                      <Button variant="outline" size="sm" className="w-full">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Homepage
                      </Button>
                    </Link>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Categories</h4>
                    <Link href="/admin/categories">
                      <Button variant="outline" size="sm" className="w-full">
                        <Edit className="h-4 w-4 mr-2" />
                        Manage Categories
                      </Button>
                    </Link>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Featured Vehicles</h4>
                    <Link href="/admin/vehicles">
                      <Button variant="outline" size="sm" className="w-full">
                        <Edit className="h-4 w-4 mr-2" />
                        Manage Featured
                      </Button>
                    </Link>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Site Settings</h4>
                    <Link href="/admin/settings">
                      <Button variant="outline" size="sm" className="w-full">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Settings
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Public Page Content */}
      <div className="min-h-screen bg-background">
        <ComingSoonSection />
        <HeroSection />
        <VehicleCategories />
        <FeaturedVehicles />
        <TrustSection />
      </div>
    </div>
  )
}