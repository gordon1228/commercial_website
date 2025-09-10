// Advanced image optimization utilities for Next.js
import { ImageLoader, ImageLoaderProps } from 'next/image'

// Image optimization configuration
export interface ImageConfig {
  quality?: number
  format?: 'webp' | 'avif' | 'auto'
  blur?: boolean
  priority?: boolean
  sizes?: string
  placeholder?: 'blur' | 'empty' | 'data:image/...'
}

// Default image sizes for different use cases
export const IMAGE_SIZES = {
  // Vehicle images
  VEHICLE_THUMBNAIL: { width: 400, height: 300 },
  VEHICLE_CARD: { width: 600, height: 400 },
  VEHICLE_DETAIL: { width: 1200, height: 800 },
  VEHICLE_GALLERY: { width: 1600, height: 1067 },
  
  // UI images
  HERO_DESKTOP: { width: 1920, height: 1080 },
  HERO_MOBILE: { width: 768, height: 1024 },
  LOGO: { width: 200, height: 100 },
  AVATAR: { width: 128, height: 128 },
  ICON: { width: 64, height: 64 },
  
  // Content images
  BLOG_THUMBNAIL: { width: 400, height: 250 },
  BLOG_HERO: { width: 1200, height: 630 },
  COMPANY_PHOTO: { width: 800, height: 600 }
} as const

// Responsive image sizes strings for different breakpoints
export const RESPONSIVE_SIZES = {
  FULL_WIDTH: '100vw',
  HALF_WIDTH: '50vw',
  CARD_RESPONSIVE: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  HERO_RESPONSIVE: '(max-width: 768px) 100vw, (max-width: 1200px) 85vw, 75vw',
  GALLERY_RESPONSIVE: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  THUMBNAIL_RESPONSIVE: '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw'
} as const

/**
 * Custom image loader for optimized delivery
 * Supports multiple image providers and formats
 */
export const optimizedImageLoader: ImageLoader = ({ src, width, quality = 75 }: ImageLoaderProps) => {
  // Handle external URLs (return as-is)
  if (src.startsWith('http')) {
    return src
  }
  
  // Handle Vercel Blob Storage URLs
  if (src.includes('vercel-storage.com')) {
    const url = new URL(src)
    url.searchParams.set('w', width.toString())
    url.searchParams.set('q', quality.toString())
    return url.toString()
  }
  
  // Handle local images with Next.js optimization
  const params = new URLSearchParams({
    url: src,
    w: width.toString(),
    q: quality.toString()
  })
  
  return `/_next/image?${params.toString()}`
}

/**
 * Generate blur placeholder for images
 */
export function generateBlurDataURL(width: number = 10, height: number = 10): string {
  const canvas = typeof window !== 'undefined' ? document.createElement('canvas') : null
  if (!canvas) {
    // Fallback blur placeholder for SSR
    return `data:image/svg+xml;base64,${Buffer.from(
      `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f3f4f6"/>
      </svg>`
    ).toString('base64')}`
  }
  
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!
  
  // Create gradient blur effect
  const gradient = ctx.createLinearGradient(0, 0, width, height)
  gradient.addColorStop(0, '#f3f4f6')
  gradient.addColorStop(0.5, '#e5e7eb')
  gradient.addColorStop(1, '#d1d5db')
  
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)
  
  return canvas.toDataURL('image/jpeg', 0.1)
}

/**
 * Image optimization utilities
 */
export class ImageOptimizer {
  /**
   * Get optimized image props for Next.js Image component
   */
  static getOptimizedProps(
    src: string,
    alt: string,
    size: keyof typeof IMAGE_SIZES,
    config: ImageConfig = {}
  ) {
    const dimensions = IMAGE_SIZES[size]
    const {
      quality = 85,
      format = 'auto',
      blur = true,
      priority = false,
      sizes = RESPONSIVE_SIZES.CARD_RESPONSIVE,
      placeholder = 'blur'
    } = config

    const props: any = {
      src,
      alt,
      width: dimensions.width,
      height: dimensions.height,
      quality,
      priority,
      sizes,
      loader: optimizedImageLoader,
      style: { objectFit: 'cover' }
    }

    // Add placeholder if blur is enabled
    if (blur && placeholder === 'blur') {
      props.placeholder = 'blur'
      props.blurDataURL = generateBlurDataURL(dimensions.width / 10, dimensions.height / 10)
    }

    return props
  }

  /**
   * Get responsive image props for different screen sizes
   */
  static getResponsiveProps(
    src: string,
    alt: string,
    config: {
      desktop: keyof typeof IMAGE_SIZES
      mobile: keyof typeof IMAGE_SIZES
      sizes?: string
      quality?: number
      priority?: boolean
    }
  ) {
    const desktopSize = IMAGE_SIZES[config.desktop]
    const mobileSize = IMAGE_SIZES[config.mobile]
    
    return {
      src,
      alt,
      width: desktopSize.width,
      height: desktopSize.height,
      quality: config.quality || 85,
      priority: config.priority || false,
      sizes: config.sizes || RESPONSIVE_SIZES.HERO_RESPONSIVE,
      loader: optimizedImageLoader,
      style: { objectFit: 'cover' },
      placeholder: 'blur' as const,
      blurDataURL: generateBlurDataURL(mobileSize.width / 10, mobileSize.height / 10)
    }
  }

  /**
   * Validate image URL and provide fallback
   */
  static validateImageUrl(src: string, fallback: string = '/images/placeholder.jpg'): string {
    if (!src || src.trim() === '') return fallback
    
    try {
      new URL(src)
      return src
    } catch {
      // If not a valid URL, treat as relative path
      return src.startsWith('/') ? src : `/${src}`
    }
  }

  /**
   * Generate srcSet for responsive images
   */
  static generateSrcSet(src: string, widths: number[] = [400, 800, 1200, 1600], quality: number = 85): string {
    return widths
      .map(width => {
        const optimizedSrc = optimizedImageLoader({ src, width, quality })
        return `${optimizedSrc} ${width}w`
      })
      .join(', ')
  }

  /**
   * Preload critical images
   */
  static preloadImage(src: string, priority: 'high' | 'low' = 'high'): void {
    if (typeof window === 'undefined') return

    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = 'image'
    link.href = src
    link.fetchPriority = priority
    document.head.appendChild(link)
  }

  /**
   * Lazy load images with Intersection Observer
   */
  static createLazyLoader(): IntersectionObserver | null {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      return null
    }

    return new IntersectionObserver(
      (entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement
            if (img.dataset.src) {
              img.src = img.dataset.src
              img.classList.remove('lazy')
              observer.unobserve(img)
            }
          }
        })
      },
      {
        rootMargin: '50px 0px',
        threshold: 0.1
      }
    )
  }

  /**
   * Convert image to WebP format if supported
   */
  static supportsWebP(): Promise<boolean> {
    if (typeof window === 'undefined') return Promise.resolve(false)

    return new Promise(resolve => {
      const webP = new Image()
      webP.onload = webP.onerror = () => resolve(webP.height === 2)
      webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA'
    })
  }

  /**
   * Get optimal image format based on browser support
   */
  static async getOptimalFormat(fallback: 'jpeg' | 'png' = 'jpeg'): Promise<'webp' | 'avif' | 'jpeg' | 'png'> {
    if (typeof window === 'undefined') return fallback

    // Check AVIF support
    const avifSupported = await new Promise<boolean>(resolve => {
      const avif = new Image()
      avif.onload = () => resolve(true)
      avif.onerror = () => resolve(false)
      avif.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgABogQEAwgMg8f8D///8WfhwB8+ErK42A='
    })

    if (avifSupported) return 'avif'

    // Check WebP support
    const webpSupported = await this.supportsWebP()
    if (webpSupported) return 'webp'

    return fallback
  }

  /**
   * Image performance metrics
   */
  static measureImageLoadTime(src: string): Promise<number> {
    return new Promise((resolve, reject) => {
      const startTime = performance.now()
      const img = new Image()
      
      img.onload = () => {
        const loadTime = performance.now() - startTime
        resolve(loadTime)
      }
      
      img.onerror = reject
      img.src = src
    })
  }

  /**
   * Batch image preloader for critical images
   */
  static async preloadCriticalImages(images: string[]): Promise<void> {
    const promises = images.map(src => 
      new Promise<void>((resolve, reject) => {
        const img = new Image()
        img.onload = () => resolve()
        img.onerror = reject
        img.src = src
      })
    )

    try {
      await Promise.allSettled(promises)
    } catch (error) {
      console.warn('Some critical images failed to preload:', error)
    }
  }
}

/**
 * Image optimization hook for React components
 * Note: This needs to be imported in a React component file to use useState/useEffect
 */
export function createImageOptimizationHook() {
  // This will be implemented in a separate React hook file
  return {
    getOptimizedProps: ImageOptimizer.getOptimizedProps,
    getResponsiveProps: ImageOptimizer.getResponsiveProps,
    validateImageUrl: ImageOptimizer.validateImageUrl
  }
}

