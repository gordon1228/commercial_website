'use client'

import Image from 'next/image'
import { ChevronDown } from 'lucide-react'

export default function ComingSoonSection() {

  const scrollToNext = () => {
    const nextSection = document.getElementById('PremiumCommercial')
    nextSection?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section id="commingSoon" className="relative w-full min-h-screen h-screen max-h-screen bg-gray-900 overflow-hidden">
      {/* Image Container */}
      <div className="absolute inset-0 w-full h-full">
        <Image
          src="/images/comming soon.jpg"
          alt="Coming Soon"
          fill
          className="object-cover"
          priority
          sizes="100vw"
          style={{
            objectFit: 'cover',
            objectPosition: 'center center'
          }}
          quality={90}
        />
        {/* Responsive overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40 z-10" />
      </div>

      {/* Content Container - ensures proper centering */}
      <div className="relative z-20 w-full h-full flex items-center justify-center">
        <div className="text-center text-white">
          {/* You can add coming soon text here if needed */}
        </div>
      </div>

      {/* Scroll indicator - Perfectly centered */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30">
        <div 
          className="cursor-pointer animate-bounce flex flex-col items-center"
          onClick={scrollToNext}
        >
          <div className="text-center text-white hover:text-gray-200 transition-all duration-300">
            <div className="text-sm sm:text-base mb-2 drop-shadow-lg font-medium tracking-wide">
              Scroll to explore
            </div>
            <div className="flex justify-center">
              <ChevronDown className="h-6 w-6 sm:h-7 sm:w-7 drop-shadow-lg" />
            </div>
          </div>
        </div>
      </div>

    </section>
  )
}