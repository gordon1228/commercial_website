'use client'

import { useState, useEffect } from 'react'
import HeroSection from '@/components/hero-section'
import ComingSoonSection from '@/components/coming-soon-section'
import FeaturedVehicles from '@/components/featured-vehicles'
import VehicleCategories from '@/components/vehicle-categories'
import TrustSection from '@/components/trust-section'

interface HomepageContent {
  showComingSoonSection: boolean
  showHeroSection: boolean
  showVehicleCategories: boolean
  showFeaturedVehicles: boolean
  showTrustSection: boolean
}

export default function Home() {
  const [content, setContent] = useState<HomepageContent | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch('/api/homepage-content')
        if (response.ok) {
          const data = await response.json()
          setContent(data)
        }
      } catch (error) {
        console.error('Error fetching homepage content:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchContent()
  }, [])

  // Show loading state while content is being fetched
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading homepage...</p>
        </div>
      </div>
    )
  }

  // If content fails to load, show all sections by default
  const sectionVisibility = content || {
    showComingSoonSection: true,
    showHeroSection: true,
    showVehicleCategories: true,
    showFeaturedVehicles: true,
    showTrustSection: true
  }

  return (
    <>
      {sectionVisibility.showComingSoonSection && <ComingSoonSection />}
      {sectionVisibility.showHeroSection && <HeroSection />}
      {sectionVisibility.showVehicleCategories && <VehicleCategories />}
      {sectionVisibility.showFeaturedVehicles && <FeaturedVehicles />}
      {sectionVisibility.showTrustSection && <TrustSection />}
    </>
  )
}
