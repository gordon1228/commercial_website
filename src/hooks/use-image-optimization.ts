'use client'

import { useState, useEffect } from 'react'
import { ImageOptimizer } from '@/lib/image-optimization'

/**
 * React hook for image optimization
 */
export function useImageOptimization() {
  const [supportsWebP, setSupportsWebP] = useState(false)
  const [supportsAVIF, setSupportsAVIF] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const checkFormats = async () => {
      try {
        const [webpSupported, optimalFormat] = await Promise.all([
          ImageOptimizer.supportsWebP(),
          ImageOptimizer.getOptimalFormat()
        ])

        if (mounted) {
          setSupportsWebP(webpSupported)
          setSupportsAVIF(optimalFormat === 'avif')
          setIsLoading(false)
        }
      } catch (error) {
        console.warn('Failed to check image format support:', error)
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    checkFormats()

    return () => {
      mounted = false
    }
  }, [])

  return {
    supportsWebP,
    supportsAVIF,
    isLoading,
    getOptimizedProps: ImageOptimizer.getOptimizedProps,
    getResponsiveProps: ImageOptimizer.getResponsiveProps,
    validateImageUrl: ImageOptimizer.validateImageUrl,
    preloadImage: ImageOptimizer.preloadImage,
    measureLoadTime: ImageOptimizer.measureImageLoadTime
  }
}

/**
 * Hook for lazy loading images
 */
export function useLazyLoading() {
  const [observer, setObserver] = useState<IntersectionObserver | null>(null)

  useEffect(() => {
    const lazyObserver = ImageOptimizer.createLazyLoader()
    setObserver(lazyObserver)

    return () => {
      if (lazyObserver) {
        lazyObserver.disconnect()
      }
    }
  }, [])

  const observeImage = (element: HTMLImageElement | null) => {
    if (element && observer) {
      observer.observe(element)
    }
  }

  const unobserveImage = (element: HTMLImageElement | null) => {
    if (element && observer) {
      observer.unobserve(element)
    }
  }

  return {
    observeImage,
    unobserveImage,
    isSupported: !!observer
  }
}

/**
 * Hook for preloading critical images
 */
export function useImagePreloader() {
  const [preloadedImages, setPreloadedImages] = useState<Set<string>>(new Set())
  const [isPreloading, setIsPreloading] = useState(false)

  const preloadImages = async (images: string[]) => {
    setIsPreloading(true)
    
    try {
      await ImageOptimizer.preloadCriticalImages(images)
      setPreloadedImages(prev => new Set([...prev, ...images]))
    } catch (error) {
      console.warn('Failed to preload some images:', error)
    } finally {
      setIsPreloading(false)
    }
  }

  const preloadSingleImage = async (src: string) => {
    if (preloadedImages.has(src)) return

    try {
      ImageOptimizer.preloadImage(src)
      setPreloadedImages(prev => new Set([...prev, src]))
    } catch (error) {
      console.warn(`Failed to preload image: ${src}`, error)
    }
  }

  const isPreloaded = (src: string) => preloadedImages.has(src)

  return {
    preloadImages,
    preloadSingleImage,
    isPreloaded,
    isPreloading,
    preloadedCount: preloadedImages.size
  }
}