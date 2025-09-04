'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'


interface HomepageContent {
  vehiclesSold: number;
  happyClients: number;
  yearsExperience: number;
  satisfactionRate: number;
  partnersTitle: string;
  partnersDescription: string;
  feature1Title: string;
  feature1Description: string;
  feature2Title: string;
  feature2Description: string;
  feature3Title: string;
  feature3Description: string;
}

interface Partner {
  id: string;
  name: string;
  logo: string;
  website?: string;
  active: boolean;
  order: number;
}

function AnimatedCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const duration = 2000
    const steps = 60
    const increment = value / steps
    const stepDuration = duration / steps

    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= value) {
        setCount(value)
        clearInterval(timer)
      } else {
        setCount(Math.floor(current))
      }
    }, stepDuration)

    return () => clearInterval(timer)
  }, [value])

  return (
    <span className="text-4xl md:text-5xl font-bold text-white">
      {count.toLocaleString()}{suffix}
    </span>
  )
}

export default function TrustSection() {
  const [content, setContent] = useState<HomepageContent | null>(null)
  const [partners, setPartners] = useState<Partner[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch both homepage content and partners in parallel
        const [contentResponse, partnersResponse] = await Promise.all([
          fetch('/api/homepage-content'),
          fetch('/api/partners')
        ])

        if (contentResponse.ok) {
          const contentData = await contentResponse.json()
          setContent(contentData)
        }

        if (partnersResponse.ok) {
          const partnersData = await partnersResponse.json()
          setPartners(partnersData.partners || [])
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  // Auto-slide carousel every 3 seconds
  useEffect(() => {
    if (!isAutoPlaying || partners.length <= 4) return // Don't auto-play if 4 or fewer partners
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const nextIndex = prev + 1
        // Reset to 0 when we reach the end to create seamless loop
        if (nextIndex >= partners.length) {
          // Use setTimeout to reset without animation
          setTimeout(() => setCurrentIndex(0), 0)
          return partners.length - 1
        }
        return nextIndex
      })
    }, 3000) // Change every 3 seconds

    return () => clearInterval(interval)
  }, [isAutoPlaying, partners.length])

  if (isLoading || !content) {
    return (
      <section className="py-24 bg-gray-950">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white"></div>
          </div>
        </div>
      </section>
    )
  }

  const displayStats = [
    { label: 'Vehicles Available', value: content.vehiclesSold, suffix: '+' },
    { label: 'Happy Clients', value: content.happyClients, suffix: '+' },
    { label: 'Years Experience', value: content.yearsExperience, suffix: '' },
    { label: 'Satisfaction Rate', value: content.satisfactionRate, suffix: '%' }
  ]

  return (
    <section className="py-24 bg-gray-950">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
          {displayStats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="mb-2">
                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              </div>
              <p className="text-muted-foreground text-lg">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Partners */}
        <div className="text-center mb-12">
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
            {content.partnersTitle}
          </h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {content.partnersDescription}
          </p>
        </div>

        {partners.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            No partners configured
          </div>
        ) : partners.length <= 4 ? (
          // Static display for 4 or fewer partners
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 justify-items-center">
            {partners.map((partner) => {
              const content = (
                <div className="text-center px-2">
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-32 h-32 flex items-center justify-center">
                      <Image
                        src={partner.logo}
                        alt={partner.name}
                        width={128}
                        height={128}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-white">
                    {partner.name}
                  </h3>
                </div>
              )

              return (
                <div key={partner.id}>
                  {partner.website ? (
                    <a 
                      href={partner.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block"
                    >
                      {content}
                    </a>
                  ) : (
                    content
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          // Carousel for more than 4 partners - shows 4 at a time with sliding window
          <div className="relative overflow-hidden">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ 
                transform: `translateX(-${currentIndex * (100 / 4)}%)`
              }}
              onMouseEnter={() => setIsAutoPlaying(false)}
              onMouseLeave={() => setIsAutoPlaying(true)}
            >
              {/* Create an extended array for seamless infinite scroll */}
              {[...partners, ...partners.slice(0, 4)].map((partner, index) => {
                const content = (
                  <div className="text-center px-2">
                    <div className="flex items-center justify-center mb-4">
                      <div className="w-32 h-32 flex items-center justify-center">
                        <Image
                          src={partner.logo}
                          alt={partner.name}
                          width={128}
                          height={128}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold text-white">
                      {partner.name}
                    </h3>
                  </div>
                )

                return (
                  <div key={`${partner.id}-${index}`} className="flex-shrink-0" style={{ width: '25%' }}>
                    {partner.website ? (
                      <a 
                        href={partner.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block"
                      >
                        {content}
                      </a>
                    ) : (
                      content
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Trust indicators */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h4 className="text-xl font-semibold text-white mb-2">{content.feature1Title}</h4>
            <p className="text-muted-foreground">
              {content.feature1Description}
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h4 className="text-xl font-semibold text-white mb-2">{content.feature2Title}</h4>
            <p className="text-muted-foreground">
              {content.feature2Description}
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 11-9.75 9.75A9.75 9.75 0 0112 2.25z" />
              </svg>
            </div>
            <h4 className="text-xl font-semibold text-white mb-2">{content.feature3Title}</h4>
            <p className="text-muted-foreground">
              {content.feature3Description}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}