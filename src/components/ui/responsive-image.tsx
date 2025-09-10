'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { usePreview } from '@/contexts/preview-context'
import { useImageOptimization, useLazyLoading } from '@/hooks/use-image-optimization'
import { ImageOptimizer, IMAGE_SIZES, RESPONSIVE_SIZES, type ImageConfig } from '@/lib/image-optimization'

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
  forceMode?: 'desktop' | 'tablet' | 'mobile'
  // New optimization props
  optimizeSize?: keyof typeof IMAGE_SIZES
  lazy?: boolean
  blur?: boolean
  autoFormat?: boolean
}

export default function ResponsiveImage({
  desktopSrc,
  mobileSrc,
  alt,
  fill = false,
  className = '',
  priority = false,
  quality = 85,
  unoptimized = false,
  sizes = '100vw',
  onLoad,
  onError,
  forceMode,
  optimizeSize,
  lazy = false,
  blur = true,
  autoFormat = true
}: ResponsiveImageProps) {
  const [isMobile, setIsMobile] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [hasError, setHasError] = useState(false)
  const { previewMode } = usePreview()
  const { validateImageUrl, supportsWebP, supportsAVIF } = useImageOptimization()
  const { observeImage } = useLazyLoading()
  const imageRef = useRef<HTMLImageElement>(null)

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

  // Set up lazy loading observer
  useEffect(() => {
    if (lazy && imageRef.current && !priority) {
      observeImage(imageRef.current)
    }
  }, [lazy, priority, observeImage])

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className={`bg-gray-200 animate-pulse ${fill ? 'absolute inset-0' : 'w-full h-64'}`} />
    )
  }

  // Use mobile image if available and we're on mobile, otherwise use desktop
  const rawSrc = isMobile && mobileSrc ? mobileSrc : desktopSrc
  
  // Validate and potentially provide fallback
  const imageSrc = validateImageUrl(rawSrc, '/images/placeholder.jpg')

  // Get optimized props if optimizeSize is provided
  let imageProps: any = {
    src: imageSrc,
    alt,
    fill,
    className,
    priority: priority && !lazy, // Don't use priority with lazy loading
    quality,
    unoptimized,
    sizes: isMobile ? '(max-width: 768px) 100vw, 50vw' : sizes,
    onLoad,
    onError: (error: React.SyntheticEvent<HTMLImageElement>) => {
      setHasError(true)
      onError?.(error)
    }
  }

  if (optimizeSize && !unoptimized) {
    const optimizedProps = ImageOptimizer.getOptimizedProps(
      imageSrc,
      alt,
      optimizeSize,
      {
        quality,
        blur: blur && !hasError,
        priority: priority && !lazy,
        sizes: imageProps.sizes
      }
    )
    imageProps = { ...imageProps, ...optimizedProps }
  }

  // Add lazy loading data attributes if enabled
  if (lazy && !priority) {
    imageProps.loading = 'lazy'
    imageProps['data-src'] = imageSrc
  }

  // Error state
  if (hasError) {
    return (
      <div className={`bg-gray-200 flex items-center justify-center ${fill ? 'absolute inset-0' : 'w-full h-64'} ${className}`}>
        <div className="text-gray-500 text-center">
          <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-sm">Image not available</p>
        </div>
      </div>
    )
  }

  return (
    <Image
      ref={imageRef}
      {...imageProps}
    />
  )
}