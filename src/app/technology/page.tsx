'use client'

import { useState, useEffect } from 'react'
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Battery, Zap, Truck, Leaf, Shield, Gauge } from 'lucide-react'

interface TechFeature {
  id: string
  title: string
  description: string
  icon: string
  category: string
}

const fallbackTechFeatures = [
  {
    id: '1',
    title: 'Advanced Battery Technology',
    description: 'High-capacity lithium-ion batteries with fast charging capabilities and extended range for commercial operations.',
    icon: 'Battery',
    category: 'Power Systems'
  },
  {
    id: '2',
    title: 'Smart Fleet Management',
    description: 'Integrated IoT sensors and AI-powered analytics for real-time vehicle monitoring and predictive maintenance.',
    icon: 'Gauge',
    category: 'Software'
  },
  {
    id: '3',
    title: 'Rapid Charging Infrastructure',
    description: 'Compatible with multiple charging standards and optimized for commercial fleet operations.',
    icon: 'Zap',
    category: 'Infrastructure'
  },
  {
    id: '4',
    title: 'Zero Emission Drive',
    description: 'Completely electric powertrain with zero direct emissions for sustainable urban logistics.',
    icon: 'Leaf',
    category: 'Environment'
  },
  {
    id: '5',
    title: 'Commercial Grade Safety',
    description: 'Enhanced safety systems designed specifically for commercial vehicle operations and driver protection.',
    icon: 'Shield',
    category: 'Safety'
  },
  {
    id: '6',
    title: 'Heavy Duty Performance',
    description: 'Engineered for commercial payloads with robust construction and reliable performance in demanding conditions.',
    icon: 'Truck',
    category: 'Performance'
  }
]

/*
const getIcon = (iconName: string) => {
  switch (iconName) {
    case 'Battery': return <Battery className="h-8 w-8" />
    case 'Gauge': return <Gauge className="h-8 w-8" />
    case 'Zap': return <Zap className="h-8 w-8" />
    case 'Leaf': return <Leaf className="h-8 w-8" />
    case 'Shield': return <Shield className="h-8 w-8" />
    case 'Truck': return <Truck className="h-8 w-8" />
    default: return <Battery className="h-8 w-8" />
  }
}
*/

export default function TechnologyPage() {
  const [techFeatures, setTechFeatures] = useState<TechFeature[]>([])
  const [, setLoading] = useState(true)

  useEffect(() => {
    const fetchTechFeatures = async () => {
      try {
        // For now, use fallback data. API endpoint can be added later if needed
        setTechFeatures(fallbackTechFeatures)
      } catch (error) {
        console.error('Error loading technology features:', error)
        setTechFeatures(fallbackTechFeatures)
      } finally {
        setLoading(false)
      }
    }

    fetchTechFeatures()
  }, [])

  // const categories = [...new Set(techFeatures.map(feature => feature.category))]

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