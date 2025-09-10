'use client'

import { useState, useEffect } from 'react'
// import { ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface HomepageContent {
  heroTitle: string
  heroSubtitle: string
  heroDescription: string
  heroButtonPrimary: string
  heroButtonSecondary: string
}

export default function HeroSection() {
  const [content, setContent] = useState<HomepageContent | null>(null)

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
      }
    }
    fetchContent()
  }, [])

  const scrollToNext = () => {
    const nextSection = document.getElementById('categories')
    nextSection?.scrollIntoView({ behavior: 'smooth' })
  }

  // Default content while loading or if fetch fails
  const heroTitle = content?.heroTitle || 'Premium Commercial'
  const heroSubtitle = content?.heroSubtitle || 'Trucks'
  const heroDescription = content?.heroDescription || 'Discover elite truck solutions built for businesses that demand excellence, reliability, and uncompromising performance.'
  const heroButtonPrimary = content?.heroButtonPrimary || 'Explore Trucks'
  const heroButtonSecondary = content?.heroButtonSecondary || 'Get Quote'

  return (
    <section id="PremiumCommercial" className="relative h-screen flex items-center justify-center hero-gradient overflow-hidden">
      {/* Background overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-100/30 to-gray-200/60 z-10" />
      
      {/* Background video placeholder - in real project you'd use a video */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300" />
      
      {/* Content */}
      <div className="relative z-20 text-center max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="animate-fade-in">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-6xl font-display font-bold text-gray-900 mb-6 leading-tight">
            {heroTitle}
            <span className="block text-gradient">{heroSubtitle}</span>
          </h1>
          
          <p className="text-xl sm:text-2xl text-gray-700 mb-12 max-w-3xl mx-auto leading-relaxed">
            {heroDescription}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Button size="lg" asChild className="text-lg px-8 py-4 h-14">
              <Link href="/">{heroButtonPrimary}</Link>
            </Button>
            <Button variant="secondary" size="lg" asChild className="text-lg px-8 py-4 h-14">
              <Link href="/contact">{heroButtonSecondary}</Link>
            </Button>
          </div>
        </div>
      </div>
      
      {/* Scroll indicator - Perfectly centered */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30">
        <div 
          className="cursor-pointer animate-bounce flex flex-col items-center"
          onClick={scrollToNext}
        >
          
        </div>
      </div>
    </section>
  )
}