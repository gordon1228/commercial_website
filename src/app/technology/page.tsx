'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { 
  Battery, 
  Zap, 
  Shield, 
  Truck, 
  Gauge, 
  Wifi,
  Wrench,
  Leaf
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface TechnologyContent {
  heroTitle: string
  heroSubtitle: string
  heroBackgroundImage: string
  heroBackgroundImageAlt: string
  section1Title: string
  section1Description: string
  section2Title: string
  section2Description: string
  section3Title: string
  section3Description: string
  section4Title: string
  section4Description: string
}

interface TechnologyFeature {
  id: string
  title: string
  description: string
  iconName: string
  order: number
}

// Icon mapping for dynamic rendering
const iconMap = {
  Battery,
  Zap,
  Shield,
  Truck,
  Gauge,
  Wifi,
  Wrench,
  Leaf
}

export default function TechnologyPage() {
  const [content, setContent] = useState<TechnologyContent | null>(null)
  const [features, setFeatures] = useState<TechnologyFeature[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [contentRes, featuresRes] = await Promise.all([
          fetch('/api/technology-content'),
          fetch('/api/technology-features')
        ])

        if (contentRes.ok) {
          const contentData = await contentRes.json()
          setContent(contentData)
        }

        if (featuresRes.ok) {
          const featuresData = await featuresRes.json()
          setFeatures(featuresData)
        }
      } catch (error) {
        console.error('Error loading technology data:', error)
        // Set fallback data
        setContent({
          heroTitle: 'Next-Generation Electric Truck Technology',
          heroSubtitle: 'Advanced electric vehicle technology designed for commercial success and environmental sustainability',
          heroBackgroundImage: '/uploads/Technology_background.png',
          heroBackgroundImageAlt: 'Electric Truck Technology Background',
          section1Title: 'Advanced Battery Technology',
          section1Description: 'Our cutting-edge battery systems provide exceptional range and durability for commercial applications.',
          section2Title: 'Smart Fleet Management',
          section2Description: 'Integrated IoT solutions for real-time monitoring, maintenance prediction, and route optimization.',
          section3Title: 'Rapid Charging Infrastructure',
          section3Description: 'Fast-charging capabilities designed to minimize downtime and maximize operational efficiency.',
          section4Title: 'Sustainable Manufacturing',
          section4Description: 'Eco-friendly production processes that reduce environmental impact while maintaining quality.'
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen pt-20 bg-background">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!content) {
    return (
      <div className="min-h-screen pt-20 bg-background">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <p className="text-xl text-gray-600">Unable to load technology information.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center text-white overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src={content.heroBackgroundImage}
            alt={content.heroBackgroundImageAlt}
            fill
            className="object-cover"
            priority
            sizes="100vw"
            quality={90}
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
        
        <div className="relative z-20 text-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            {content.heroTitle}
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 max-w-4xl mx-auto leading-relaxed">
            {content.heroSubtitle}
          </p>
          <div className="mt-12">
            <Button size="lg" asChild>
              <Link href="/vehicles">View Our Fleet</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Technology Sections */}
      <section className="py-20 bg-background">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Section 1 */}
            <div className="flex flex-col justify-center">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                {content.section1Title}
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-8">
                {content.section1Description}
              </p>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center">
                  <Battery className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Long-lasting Performance</h3>
                  <p className="text-sm text-gray-600">Up to 300 miles range on a single charge</p>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <Battery className="h-16 w-16 mx-auto mb-4 text-accent" />
                    <div className="text-lg font-medium">Battery Technology</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2 */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div className="relative order-2 lg:order-1">
              <div className="aspect-square rounded-lg overflow-hidden bg-white">
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <Wifi className="h-16 w-16 mx-auto mb-4 text-accent" />
                    <div className="text-lg font-medium">Fleet Management</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col justify-center order-1 lg:order-2">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                {content.section2Title}
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-8">
                {content.section2Description}
              </p>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center">
                  <Gauge className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Real-time Monitoring</h3>
                  <p className="text-sm text-gray-600">Track performance and efficiency metrics</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Features Grid */}
      {features.length > 0 && (
        <section className="py-20 bg-background">
          <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Key Features
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Innovative technology designed for the demands of modern commercial transportation
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature) => {
                const IconComponent = iconMap[feature.iconName as keyof typeof iconMap] || Zap
                return (
                  <Card key={feature.id} className="text-center">
                    <CardContent className="p-6">
                      <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <IconComponent className="h-8 w-8 text-accent" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* Additional Sections */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div className="flex flex-col justify-center">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                {content.section3Title}
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-8">
                {content.section3Description}
              </p>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-lg overflow-hidden bg-white">
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <Zap className="h-16 w-16 mx-auto mb-4 text-accent" />
                    <div className="text-lg font-medium">Rapid Charging</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div className="relative order-2 lg:order-1">
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <Leaf className="h-16 w-16 mx-auto mb-4 text-accent" />
                    <div className="text-lg font-medium">Sustainable Manufacturing</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col justify-center order-1 lg:order-2">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                {content.section4Title}
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-8">
                {content.section4Description}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-accent/10">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Ready to Experience the Future?
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Discover how our advanced electric truck technology can transform your business operations
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/vehicles">View Our Fleet</Link>
              </Button>
              <Button variant="secondary" size="lg" asChild>
                <Link href="/contact">Schedule a Demo</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}