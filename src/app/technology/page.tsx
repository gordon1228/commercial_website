'use client'

import { useState, useEffect } from 'react'

export default function TechnologyPage() {
  const [, setLoading] = useState(true)

  useEffect(() => {
    const fetchTechFeatures = async () => {
      try {
        // For now, use fallback data. API endpoint can be added later if needed
      } catch (error) {
        console.error('Error loading technology features:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTechFeatures()
  }, [])

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center text-white overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-contain bg-center bg-no-repeat"
          style={{ backgroundImage: 'url(/uploads/Technology_background.png)' }}
        />
        
        <div className="relative z-20 text-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Next-Generation Electric Truck Technology
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
            Advanced electric vehicle technology designed for commercial success and environmental sustainability
          </p>
        </div>
      </section>

    </div>
  )
}