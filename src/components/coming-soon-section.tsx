'use client'

import { useState, useEffect } from 'react'
// import { ChevronDown } from 'lucide-react'
import ResponsiveImage from '@/components/ui/responsive-image'

export default function ComingSoonSection() {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [dataLoaded, setDataLoaded] = useState(false)
  const [comingSoonImage, setComingSoonImage] = useState('')
  const [comingSoonImageMobile, setComingSoonImageMobile] = useState('')
  
  useEffect(() => {
    const fetchComingSoonImage = async () => {
      try {
        const response = await fetch('/api/homepage-content?t=' + Date.now())
        if (response.ok) {
          const data = await response.json()
          const imageUrl = data.comingSoonImage || '/uploads/ComingSoon.jpg'
          const mobileImageUrl = data.comingSoonImageMobile || '/uploads/ComingSoon-mobile.jpg'
          setComingSoonImage(imageUrl)
          setComingSoonImageMobile(mobileImageUrl)
          setDataLoaded(true)
        } else {
          // Fallback to default images
          setComingSoonImage('/uploads/ComingSoon.jpg')
          setComingSoonImageMobile('/uploads/ComingSoon-mobile.jpg')
          setDataLoaded(true)
        }
      } catch (error) {
        console.error('Error fetching coming soon image:', error)
        // Use fallback images if fetch fails
        setComingSoonImage('/uploads/ComingSoon.jpg')
        setComingSoonImageMobile('/uploads/ComingSoon-mobile.jpg')
        setDataLoaded(true)
      }
    }

    fetchComingSoonImage()
  }, [])

  const comingSoonImageAlt = 'EVTL Commercial Trucks - Coming Soon'

  // const scrollToNext = () => {
  //   const nextSection = document.getElementById('PremiumCommercial')
  //   nextSection?.scrollIntoView({ behavior: 'smooth' })
  // }

  // Don't render the image until we have the correct URL from the API
  if (!dataLoaded || !comingSoonImage) {
    return (
      <section id="commingSoon" className="relative w-full h-screen overflow-hidden pt-20">
        <div className="absolute inset-0 w-full h-full top-20 flex items-center justify-center bg-gray-900">
          <div className="animate-pulse text-white text-lg">Loading Coming Soon Section...</div>
        </div>
      </section>
    )
  }

  return (
    <section id="commingSoon" className="relative w-full h-screen overflow-hidden pt-20">
      {/* Image container - Full screen behind navigation, accounting for header */}
      <div className="absolute inset-0 w-full h-full top-20">
        <div className={`transition-opacity duration-700 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}>
          <ResponsiveImage
            desktopSrc={comingSoonImage}
            mobileSrc={comingSoonImageMobile}
            alt={comingSoonImageAlt}
            fill
            className="object-cover"
            priority
            sizes="100vw"
            quality={90}
            unoptimized
            onLoad={() => setImageLoaded(true)}
            onError={(e) => {
              console.error('Failed to load coming soon image:', e)
              // Try fallback image if we haven't already
              if (comingSoonImage !== '/uploads/ComingSoon.jpg') {
                setComingSoonImage('/uploads/ComingSoon.jpg')
                setComingSoonImageMobile('/uploads/ComingSoon-mobile.jpg')
              } else {
                // If even the fallback fails, show a placeholder
                setImageLoaded(true)
              }
            }}
          />
        </div>
        {!imageLoaded && (
          <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-gray-900 z-20">
            <div className="animate-pulse text-white text-lg">Loading Image...</div>
          </div>
        )}
        {/* Enhanced responsive overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/50 z-10" />
      </div>


      {/* Content Container - Always show since we have static image */}
      <div className="relative z-40 w-full h-full flex items-start justify-center px-4 sm:px-6 lg:px-8 pt-32 sm:pt-40 md:pt-48 lg:pt-56">
        <div className="text-center text-white max-w-4xl mx-auto animate-pulse">
          {/* The COMING SOON text is in your image, so we don't add it here */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold text-white mb-4 leading-tight tracking-wide">
            COMING SOON
          </h1>
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold mb-6">
            <span className="block text-white">
              NEW TRUCK LAUNCHING
            </span>
          </h2>
        </div>
      </div>

      {/* Scroll indicator - Always show since we have static image */}
      {/* <div className="absolute bottom-8 sm:bottom-12 md:bottom-16 left-1/2 transform -translate-x-1/2 z-40">
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
      </div> */}
    </section>
  )
}