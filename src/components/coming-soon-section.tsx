'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { ChevronDown } from 'lucide-react'

export default function ComingSoonSection() {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [comingSoonImage, setComingSoonImage] = useState('/uploads/Technology_background.png')
  
  useEffect(() => {
    const fetchComingSoonImage = async () => {
      try {
        const response = await fetch('/api/homepage-content')
        if (response.ok) {
          const data = await response.json()
          if (data.comingSoonImage) {
            setComingSoonImage(data.comingSoonImage)
          }
        }
      } catch (error) {
        console.error('Error fetching coming soon image:', error)
        // Keep default image if fetch fails
      }
    }

    fetchComingSoonImage()
  }, [])

  const comingSoonImageAlt = 'EVTL Commercial Trucks - Coming Soon'

  const scrollToNext = () => {
    const nextSection = document.getElementById('PremiumCommercial')
    nextSection?.scrollIntoView({ behavior: 'smooth' })
  }

  return (

    <section id="commingSoon" className="relative w-full h-screen overflow-hidden pt-20">
      {/* Image container - Full screen behind navigation, accounting for header */}
      <div className="absolute inset-0 w-full h-full top-20">
        {/* Show static image */}
        <>
          <div className={`transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}>
            <Image
              src={comingSoonImage}
              alt={comingSoonImageAlt}
              fill
              className="object-contain"
              priority
              sizes="100vw"
              quality={90}
              onLoad={() => setImageLoaded(true)}
            />
          </div>
          {/* Enhanced responsive overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/50 z-10" />
        </>
      </div>


      {/* Content Container - Always show since we have static image */}
      <div className="relative z-40 w-full h-full flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="text-center text-white max-w-4xl mx-auto">
          {/* The COMING SOON text is in your image, so we don't add it here */}
        </div>
      </div>

      {/* Scroll indicator - Always show since we have static image */}
      <div className="absolute bottom-8 sm:bottom-12 md:bottom-16 left-1/2 transform -translate-x-1/2 z-40">
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