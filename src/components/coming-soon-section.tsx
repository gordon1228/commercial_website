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
  const comingSoonImage = content?.comingSoonImage
  const comingSoonImageAlt = content?.comingSoonImageAlt || "Coming Soon"

  return (
    <section id="commingSoon" className="relative w-full h-screen overflow-hidden bg-black">
      {/* Image always shows full image without cropping - accounting for header */}
      {comingSoonImage ? (
        <div className="absolute top-20 left-0 right-0 bottom-0 w-full">
          <Image
            src={comingSoonImage}
            alt={comingSoonImageAlt}
            fill
            className="object-contain object-center"
            priority
            sizes="100vw"
            quality={90}
          />
        </div>
      ) : (
        <div className="absolute top-20 left-0 right-0 bottom-0 w-full flex items-center justify-center bg-gray-100">
          <div className="text-center text-gray-500">
            <div className="text-6xl mb-4">📷</div>
            <div className="text-xl font-medium">No Image Available</div>
          </div>
        </div>
      )}

      {/* Alternative Solution 2: Background image approach - also shows full image */}
      {/* Replace the Image component above with this if you prefer background-image approach */}
      {/*
      <div 
        className="absolute top-20 left-0 right-0 bottom-0 w-full bg-center bg-no-repeat"
        style={{
          backgroundImage: `url("${comingSoonImage}")`,
          backgroundSize: 'contain', // Always shows full image without cropping
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />
      */}

      {/* Alternative Solution 3: If you want different behavior on mobile vs desktop */}
      {/* This shows full image on mobile, but can crop on larger screens if needed */}
      {/*
      <div className="absolute top-20 left-0 right-0 bottom-0 w-full">
        <Image
          src={comingSoonImage}
          alt={comingSoonImageAlt}
          fill
          className="object-contain object-center"
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