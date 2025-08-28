'use client'

import Image from 'next/image'
import { ChevronDown } from 'lucide-react'

export default function ComingSoonSection() {

  const scrollToNext = () => {
    const nextSection = document.getElementById('PremiumCommercial')
    nextSection?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section id="commingSoon" className="relative h-screen flex items-center justify-center bg-white overflow-hidden">
      <div className="relative w-full h-full flex items-center justify-center">
        <Image
          src="/images/comming soon.jpg"
          alt="Coming Soon"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Scroll indicator */}
      <div 
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 cursor-pointer animate-bounce"
        onClick={scrollToNext}
      >
        <div className="flex flex-col items-center text-gray-600 hover:text-gray-800 transition-colors">
          <span className="text-sm mb-2">Scroll to explore</span>
          <ChevronDown className="h-6 w-6" />
        </div>
      </div>

    </section>
  )
}