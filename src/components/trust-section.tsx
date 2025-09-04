'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'


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
  const [isTransitioning, setIsTransitioning] = useState(true)

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

  // Get responsive slides per view
  const getSlidesPerView = () => {
    if (typeof window === 'undefined') return 4
    if (window.innerWidth < 768) return 1 // mobile
    if (window.innerWidth < 1024) return 2 // tablet
    return 4 // desktop
  }

  const [slidesPerView, setSlidesPerView] = useState(4)

  useEffect(() => {
    const handleResize = () => {
      setSlidesPerView(getSlidesPerView())
    }
    
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Auto-slide carousel every 3 seconds
  useEffect(() => {
    if (!isAutoPlaying || partners.length === 0) return
    
    const interval = setInterval(() => {
      goToNext()
    }, 3000)

    return () => clearInterval(interval)
  }, [isAutoPlaying, partners.length])

  // Navigation functions
  const goToNext = () => {
    setCurrentIndex((prev) => {
      const nextIndex = prev + 1
      // For seamless infinite loop, when we reach the end of first duplicate set,
      // jump back to the beginning without animation
      if (nextIndex >= partners.length) {
        setTimeout(() => {
          setIsTransitioning(false)
          setCurrentIndex(0)
          setTimeout(() => setIsTransitioning(true), 50)
        }, 500)
      }
      return nextIndex
    })
  }

  const goToPrev = () => {
    setCurrentIndex((prev) => {
      if (prev <= 0) {
        // Jump to the end of original items for seamless loop
        setIsTransitioning(false)
        const lastIndex = partners.length - 1
        setCurrentIndex(partners.length + lastIndex)
        setTimeout(() => {
          setIsTransitioning(true)
          setCurrentIndex(lastIndex)
        }, 50)
        return lastIndex
      }
      return prev - 1
    })
  }

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
        ) : (
          // Responsive carousel with navigation
          <div className="relative max-w-6xl mx-auto">
            {/* Carousel container */}
            <div className="overflow-hidden">
              <div 
                className={`flex ${isTransitioning ? 'transition-transform duration-500 ease-in-out' : ''}`}
                style={{ 
                  transform: `translateX(-${currentIndex * (100 / slidesPerView)}%)`
                }}
                onMouseEnter={() => setIsAutoPlaying(false)}
                onMouseLeave={() => setIsAutoPlaying(true)}
              >
                {/* Create extended array for seamless infinite loop */}
                {[...partners, ...partners, ...partners].map((partner, index) => {
                  const content = (
                    <div className="text-center px-4">
                      <div className="flex items-center justify-center mb-4">
                        <div className="w-24 h-24 md:w-32 md:h-32 bg-white/10 rounded-lg p-3 backdrop-blur-sm flex items-center justify-center">
                          <div className="w-full h-full relative">
                            <Image
                              src={partner.logo}
                              alt={partner.name}
                              fill
                              sizes="(max-width: 768px) 96px, 128px"
                              className="object-contain"
                            />
                          </div>
                        </div>
                      </div>
                      <h3 className="text-sm md:text-lg font-semibold text-white">
                        {partner.name}
                      </h3>
                    </div>
                  )

                  return (
                    <div 
                      key={`${partner.id}-${index}`} 
                      className="flex-shrink-0 flex justify-center items-center"
                      style={{ width: `${100 / slidesPerView}%` }}
                    >
                      {partner.website ? (
                        <a 
                          href={partner.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="block hover:transform hover:scale-105 transition-transform duration-200"
                        >
                          {content}
                        </a>
                      ) : (
                        <div className="hover:transform hover:scale-105 transition-transform duration-200">
                          {content}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Navigation buttons */}
            <button
              onClick={goToPrev}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-all duration-200 hover:scale-110"
              aria-label="Previous partners"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <button
              onClick={goToNext}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-all duration-200 hover:scale-110"
              aria-label="Next partners"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Dots indicator */}
            <div className="flex justify-center mt-6 space-x-2">
              {Array.from({ length: partners.length }, (_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setCurrentIndex(i)
                    setIsAutoPlaying(false)
                    setTimeout(() => setIsAutoPlaying(true), 5000)
                  }}
                  className={`w-2 h-2 rounded-full transition-all duration-200 ${
                    i === currentIndex % partners.length
                      ? 'bg-white scale-125' 
                      : 'bg-white/30 hover:bg-white/60'
                  }`}
                  aria-label={`Go to partner ${i + 1}`}
                />
              ))}
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