'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { usePreview } from '@/contexts/preview-context'

interface ResponsiveImageProps {
  desktopSrc: string
  mobileSrc?: string
  alt: string
  fill?: boolean
  className?: string
  priority?: boolean
  quality?: number
  unoptimized?: boolean
  sizes?: string
  onLoad?: () => void
  onError?: (error: React.SyntheticEvent<HTMLImageElement>) => void
  forceMode?: 'desktop' | 'tablet' | 'mobile' // For preview mode
}

export default function ResponsiveImage({
  desktopSrc,
  mobileSrc,
  alt,
  fill = false,
  className = '',
  priority = false,
  quality = 90,
  unoptimized = false,
  sizes = '100vw',
  onLoad,
  onError,
  forceMode
}: ResponsiveImageProps) {
  const [isMobile, setIsMobile] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { previewMode } = usePreview()

  useEffect(() => {
    setMounted(true)
    
    // If forceMode is provided directly, use that
    if (forceMode) {
      setIsMobile(forceMode === 'mobile')
      return
    }
    
    // If we're in preview mode, use the preview context
    if (previewMode) {
      setIsMobile(previewMode === 'mobile')
      return
    }
    
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768) // Tailwind md breakpoint
    }

    // Check on mount
    checkIsMobile()

    // Listen for resize events
    window.addEventListener('resize', checkIsMobile)
    return () => window.removeEventListener('resize', checkIsMobile)
  }, [forceMode, previewMode])

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className={`bg-gray-200 animate-pulse ${fill ? 'absolute inset-0' : 'w-full h-64'}`} />
    )
  }

  // Use mobile image if available and we're on mobile, otherwise use desktop
  const imageSrc = isMobile && mobileSrc ? mobileSrc : desktopSrc

  // Optimize sizes attribute for responsive images
  const responsiveSizes = isMobile 
    ? '(max-width: 768px) 100vw, 50vw' 
    : sizes

  return (
    <Image
      src={imageSrc}
      alt={alt}
      fill={fill}
      className={className}
      priority={priority}
      quality={quality}
      unoptimized={unoptimized}
      sizes={responsiveSizes}
      onLoad={onLoad}
      onError={onError}
    />
  )
}