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
  const [isLoading, setIsLoading] = useState(true)
  const [imageLoaded, setImageLoaded] = useState(false)

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

  const scrollToNext = () => {
    const nextSection = document.getElementById('PremiumCommercial')
    nextSection?.scrollIntoView({ behavior: 'smooth' })
  }


  const comingSoonImage = content?.comingSoonImage
  const comingSoonImageAlt = content?.comingSoonImageAlt || "Coming Soon"

  return (

    <section id="commingSoon" className="relative w-full h-screen overflow-hidden">
      {/* Solution 1: Object-contain to show full image - Account for fixed header */}
      <div className="absolute top-20 left-0 right-0 bottom-0 w-full">
        {isLoading ? (
          /* Loading state - show neutral background */
          <div className="w-full h-full bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 flex items-center justify-center">
            <div className="text-center text-gray-600">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600 mx-auto mb-4"></div>
              <p className="text-lg font-medium">Loading...</p>
            </div>
          </div>
        ) : comingSoonImage ? (
          /* Show database image when loaded */
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
        ) : (
          /* Fallback when no image is set */
          <div className="w-full h-full bg-gradient-to-br from-gray-800 via-gray-900 to-black flex items-center justify-center">
            <div className="text-center text-white">
              <div className="text-6xl mb-4">🚗</div>
              <h2 className="text-4xl md:text-6xl font-bold mb-4">Coming Soon</h2>
              <p className="text-xl md:text-2xl opacity-80">Exciting new vehicles on the way</p>
            </div>
          </div>
        )}
      </div>


      {/* Content Container - Only show when not loading */}
      {!isLoading && (
        <div className="relative z-20 w-full h-full flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-20">
          <div className="text-center text-white max-w-4xl mx-auto">
            {/* The COMING SOON text is in your image, so we don't add it here */}
          </div>
        </div>
      )}

      {/* Scroll indicator - Only show when content is loaded */}
      {!isLoading && (
        <div className="absolute bottom-8 sm:bottom-12 md:bottom-16 left-1/2 transform -translate-x-1/2 z-30">
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
      )}
    </section>
  )
}