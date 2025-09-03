'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { ChevronDown } from 'lucide-react'

interface HomepageContent {
  comingSoonImage: string
  comingSoonImageAlt: string
}

export default function ComingSoonSection() {
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
    const nextSection = document.getElementById('PremiumCommercial')
    nextSection?.scrollIntoView({ behavior: 'smooth' })
  }

  // Default values if content not loaded
  const comingSoonImage = content?.comingSoonImage || "/images/comming soon.jpg"
  const comingSoonImageAlt = content?.comingSoonImageAlt || "Coming Soon"

  return (
    <section id="commingSoon" className="relative w-full h-[100vh] h-[100dvh] overflow-hidden">
      {/* Solution 1: Object-contain to show full image (recommended for your case) */}
      <div className="absolute inset-0 w-full h-full">
        <Image
          src={comingSoonImage}
          alt={comingSoonImageAlt}
          fill
          className="object-contain"
          priority
          sizes="100vw"
          quality={90}
        />
        {/* Enhanced responsive overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/50 z-10" />
      </div>

      {/* Solution 2: Background with safe areas (alternative approach) */}
      {/* Uncomment this and comment out Solution 1 if you prefer this approach */}
      {/*
      <div 
        className="absolute inset-0 w-full h-full bg-center bg-no-repeat bg-cover"
        style={{
          backgroundImage: 'url("/images/comming soon.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: '50% 40%', // Adjust this to focus on the important part
        }}
      >
        <div className="absolute inset-0 bg-black/20" />
      </div>
      */}

      {/* Solution 3: Responsive object positioning (if you must use object-cover) */}
      {/* This adjusts the focal point based on screen size */}
      {/*
      <div className="absolute inset-0 w-full h-full">
        <Image
          src="/images/comming soon.jpg"
          alt="Coming Soon"
          fill
          className="object-cover object-[50%_40%] sm:object-[50%_45%] md:object-center"
          priority
          sizes="100vw"
          quality={90}
        />
      </div>
      */}

      {/* Content Container - Add safe padding for mobile */}
      <div className="relative z-20 w-full h-full flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="text-center text-white max-w-4xl mx-auto">
          {/* The COMING SOON text is in your image, so we don't add it here */}
        </div>
      </div>

      {/* Scroll indicator - Move up slightly to avoid overlap with car */}
      <div className="absolute bottom-12 sm:bottom-16 md:bottom-20 left-1/2 transform -translate-x-1/2 z-30">
        <button 
          className="cursor-pointer animate-bounce flex flex-col items-center group"
          onClick={scrollToNext}
          aria-label="Scroll to next section"
          type="button"
        >
          <div className="text-center text-white group-hover:text-gray-200 transition-all duration-300">
            <div className="text-xs sm:text-sm md:text-base mb-1 sm:mb-2 drop-shadow-lg font-medium tracking-wide">
              Scroll to explore
            </div>
            <div className="flex justify-center">
              <ChevronDown className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 drop-shadow-lg" />
            </div>
          </div>
        </button>
      </div>
    </section>
  )
}