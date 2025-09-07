'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Eye, Edit, ExternalLink, Home, Truck, Lightbulb, Users, Phone, ArrowLeft, ArrowRight, Settings, Monitor, Smartphone, Tablet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

// Import public page components
import Header from '@/components/header'
import Footer from '@/components/footer'
import HeroSection from '@/components/hero-section'
import ComingSoonSection from '@/components/coming-soon-section'
import VehicleGrid from '@/components/vehicle-grid'
import VehicleFilters from '@/components/vehicle-filters'
import { PreviewProvider } from '@/contexts/preview-context'

// Lazy import for dynamic pages to avoid bundle issues
import dynamic from 'next/dynamic'

const AboutPage = dynamic(() => import('@/app/about/page'))
const TechnologyPage = dynamic(() => import('@/app/technology/page'))
const ContactPage = dynamic(() => import('@/app/contact/page'))
const VehicleDetailPage = dynamic(() => import('@/app/vehicles/[slug]/page'))

// Page definitions
const pages = [
  {
    id: 'home',
    name: 'Homepage',
    icon: Home,
    description: 'Main landing page with hero and coming soon sections'
  },
  {
    id: 'vehicles',
    name: 'Vehicles',
    icon: Truck,
    description: 'Vehicle listing page with filters and grid'
  },
  {
    id: 'vehicle-detail',
    name: 'Vehicle Detail',
    icon: Truck,
    description: 'Individual truck detail page with specifications'
  },
  {
    id: 'technology',
    name: 'Technology',
    icon: Lightbulb,
    description: 'Technology showcase page'
  },
  {
    id: 'about',
    name: 'About',
    icon: Users,
    description: 'Company information and story'
  },
  {
    id: 'contact',
    name: 'Contact',
    icon: Phone,
    description: 'Contact form and information'
  }
]

export default function AdminPreviewPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [currentPage, setCurrentPage] = useState('home')
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!session || session.user?.role !== 'ADMIN') {
    router.push('/admin/login')
    return null
  }

  const currentPageData = pages.find(p => p.id === currentPage) || pages[0]

  // Navigate between pages
  const navigateToPage = (pageId: string) => {
    setCurrentPage(pageId)
  }

  const currentPageIndex = pages.findIndex(p => p.id === currentPage)
  const prevPage = pages[currentPageIndex > 0 ? currentPageIndex - 1 : pages.length - 1]
  const nextPage = pages[currentPageIndex < pages.length - 1 ? currentPageIndex + 1 : 0]

  // Get preview frame styles based on mode
  const getPreviewStyles = () => {
    switch (previewMode) {
      case 'mobile':
        return 'w-[375px] mx-auto'
      case 'tablet':
        return 'w-[768px] mx-auto'
      case 'desktop':
      default:
        return 'w-full'
    }
  }


  // Render page content based on current page
  const renderPageContent = () => {
    switch (currentPage) {
      case 'home':
        return (
          <>
            <ComingSoonSection />
            <HeroSection />
          </>
        )
      
      case 'vehicles':
        return (
          <div className="min-h-screen pt-20 bg-background">
            <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              {/* Header */}
              <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-6">
                  Commercial Truck Fleet
                </h1>
                <p className="text-xl text-gray-700 max-w-3xl mx-auto">
                  Discover our comprehensive selection of premium commercial trucks with advanced specifications, each inspected and ready for your business needs.
                </p>
              </div>

              {/* Filters and Grid */}
              <div className="lg:grid lg:grid-cols-4 lg:gap-8">
                {/* Filters Sidebar */}
                <div className="lg:col-span-1">
                  <Suspense fallback={<div className="animate-pulse bg-gray-200 h-96 rounded-lg" />}>
                    <VehicleFilters />
                  </Suspense>
                </div>

                {/* Vehicle Grid */}
                <div className="lg:col-span-3 mt-8 lg:mt-0">
                  <Suspense fallback={
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="animate-pulse">
                          <div className="bg-gray-200 aspect-[4/3] rounded-lg mb-4" />
                          <div className="space-y-2">
                            <div className="h-6 bg-gray-200 rounded w-3/4" />
                            <div className="h-8 bg-gray-200 rounded w-1/2" />
                            <div className="h-4 bg-gray-200 rounded w-full" />
                          </div>
                        </div>
                      ))}
                    </div>
                  }>
                    <VehicleGrid />
                  </Suspense>
                </div>
              </div>
            </div>
          </div>
        )
      
      case 'vehicle-detail':
        return (
          <Suspense fallback={
            <div className="min-h-screen pt-20 bg-background">
              <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900"></div>
                </div>
              </div>
            </div>
          }>
            <VehicleDetailPage params={{ slug: 'truck-1' }} />
          </Suspense>
        )
      
      case 'technology':
        return (
          <Suspense fallback={
            <div className="min-h-screen pt-20 bg-background">
              <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900"></div>
                </div>
              </div>
            </div>
          }>
            <TechnologyPage />
          </Suspense>
        )
      
      case 'about':
        return (
          <Suspense fallback={
            <div className="min-h-screen pt-20 bg-background">
              <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900"></div>
                </div>
              </div>
            </div>
          }>
            <AboutPage />
          </Suspense>
        )
      
      case 'contact':
        return (
          <Suspense fallback={
            <div className="min-h-screen pt-20 bg-background">
              <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900"></div>
                </div>
              </div>
            </div>
          }>
            <ContactPage />
          </Suspense>
        )
      
      default:
        return (
          <>
            <ComingSoonSection />
            <HeroSection />
          </>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Preview Frame */}
      <div className="p-4">
        <div className={`${getPreviewStyles()} bg-white shadow-lg rounded-lg overflow-hidden`}>
          {previewMode !== 'desktop' && (
            <div className="bg-gray-800 text-white text-center py-2 text-sm">
              {previewMode.charAt(0).toUpperCase() + previewMode.slice(1)} Preview - {previewMode === 'mobile' ? '375px' : previewMode === 'tablet' ? '768px' : ''}
            </div>
          )}
          
          {/* Page Content with Header and Footer - Force responsive layout */}
          <div className={`bg-white ${previewMode === 'mobile' ? 'force-mobile-layout' : previewMode === 'tablet' ? 'force-tablet-layout' : ''}`}>
            <PreviewProvider previewMode={previewMode} isPreviewMode={true}>
              <Header />
              <main className="flex-1">
                {renderPageContent()}
              </main>
              <Footer />
            </PreviewProvider>
          </div>
        </div>
      </div>
    </div>
  )
}