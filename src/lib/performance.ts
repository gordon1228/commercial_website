import { logger } from './logger'
import { metricsCollector, startTimer, recordMetric, PerformanceTimer } from './monitoring'

// Performance optimization utilities
export interface OptimizationConfig {
  enableImageOptimization: boolean
  enableCodeSplitting: boolean
  enableCaching: boolean
  enablePreloading: boolean
  enableLazyLoading: boolean
  compressionLevel: 'none' | 'low' | 'medium' | 'high'
  cacheStrategy: 'none' | 'static' | 'dynamic' | 'hybrid'
}

// Default performance configuration
const DEFAULT_CONFIG: OptimizationConfig = {
  enableImageOptimization: true,
  enableCodeSplitting: true,
  enableCaching: true,
  enablePreloading: true,
  enableLazyLoading: true,
  compressionLevel: 'medium',
  cacheStrategy: 'hybrid'
}

// Cache management
class CacheManager {
  private cache = new Map<string, { data: any; expires: number; hits: number }>()
  private maxSize = 1000
  private defaultTTL = 5 * 60 * 1000 // 5 minutes

  set(key: string, data: any, ttl: number = this.defaultTTL): void {
    // Prevent cache overflow
    if (this.cache.size >= this.maxSize) {
      this.evictOldest()
    }

    this.cache.set(key, {
      data,
      expires: Date.now() + ttl,
      hits: 0
    })

    recordMetric('cache_set', 1, 'count', 'performance', { key })
  }

  get(key: string): any | null {
    const entry = this.cache.get(key)
    
    if (!entry) {
      recordMetric('cache_miss', 1, 'count', 'performance', { key })
      return null
    }

    if (Date.now() > entry.expires) {
      this.cache.delete(key)
      recordMetric('cache_expired', 1, 'count', 'performance', { key })
      return null
    }

    entry.hits++
    recordMetric('cache_hit', 1, 'count', 'performance', { key })
    return entry.data
  }

  has(key: string): boolean {
    const entry = this.cache.get(key)
    return entry !== undefined && Date.now() <= entry.expires
  }

  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
    recordMetric('cache_clear', 1, 'count', 'performance')
  }

  private evictOldest(): void {
    // Find the entry with the oldest expiration time or lowest hit count
    let oldestKey: string | null = null
    let oldestScore = Infinity

    for (const [key, entry] of this.cache.entries()) {
      const score = entry.expires / 1000000 + entry.hits // Prioritize by expiration and hits
      if (score < oldestScore) {
        oldestScore = score
        oldestKey = key
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey)
      recordMetric('cache_eviction', 1, 'count', 'performance', { key: oldestKey })
    }
  }

  getStats(): { size: number; hitRate: number; totalHits: number; totalMisses: number } {
    let totalHits = 0
    let totalMisses = 0

    // This is a simplified version - in production you'd track these separately
    for (const entry of this.cache.values()) {
      totalHits += entry.hits
    }

    const hitRate = totalHits > 0 ? totalHits / (totalHits + totalMisses) : 0

    return {
      size: this.cache.size,
      hitRate: Math.round(hitRate * 100) / 100,
      totalHits,
      totalMisses
    }
  }
}

// Global cache instance
export const cache = new CacheManager()

// Resource loading optimization
export class ResourceLoader {
  private loadedResources = new Set<string>()
  private failedResources = new Set<string>()

  async loadScript(src: string, priority: 'high' | 'normal' | 'low' = 'normal'): Promise<void> {
    if (this.loadedResources.has(src)) {
      return Promise.resolve()
    }

    if (this.failedResources.has(src)) {
      return Promise.reject(new Error(`Previously failed to load: ${src}`))
    }

    const timer = startTimer('script_load', { src, priority })

    return new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = src
      script.async = true
      
      if (priority === 'high') {
        script.setAttribute('fetchpriority', 'high')
      }

      script.onload = () => {
        this.loadedResources.add(src)
        timer.end('performance')
        recordMetric('script_load_success', 1, 'count', 'performance', { src })
        resolve()
      }

      script.onerror = (error) => {
        this.failedResources.add(src)
        timer.end('error')
        recordMetric('script_load_error', 1, 'count', 'error', { src })
        logger.error('Failed to load script', new Error(`Script load failed: ${src}`))
        reject(error)
      }

      document.head.appendChild(script)
    })
  }

  preloadResource(href: string, as: string, crossorigin?: boolean): void {
    if (typeof document === 'undefined') return

    const existing = document.querySelector(`link[href="${href}"]`)
    if (existing) return

    const link = document.createElement('link')
    link.rel = 'preload'
    link.href = href
    link.as = as

    if (crossorigin) {
      link.crossOrigin = 'anonymous'
    }

    document.head.appendChild(link)

    recordMetric('resource_preload', 1, 'count', 'performance', { href, as })
  }

  prefetchResource(href: string): void {
    if (typeof document === 'undefined') return

    const existing = document.querySelector(`link[href="${href}"]`)
    if (existing) return

    const link = document.createElement('link')
    link.rel = 'prefetch'
    link.href = href

    document.head.appendChild(link)

    recordMetric('resource_prefetch', 1, 'count', 'performance', { href })
  }
}

// Global resource loader
export const resourceLoader = new ResourceLoader()

// Image optimization utilities
export interface ImageOptimizationOptions {
  width?: number
  height?: number
  quality?: number
  format?: 'webp' | 'avif' | 'jpeg' | 'png'
  loading?: 'lazy' | 'eager'
  priority?: boolean
}

export function generateOptimizedImageUrl(
  src: string, 
  options: ImageOptimizationOptions = {}
): string {
  if (typeof window === 'undefined') return src

  const url = new URL(src, window.location.origin)
  const params = new URLSearchParams()

  if (options.width) params.set('w', options.width.toString())
  if (options.height) params.set('h', options.height.toString())
  if (options.quality) params.set('q', options.quality.toString())
  if (options.format) params.set('f', options.format)

  // For Next.js Image optimization
  if (url.pathname.startsWith('/_next/image')) {
    return `${url.pathname}?${params.toString()}`
  }

  // For custom image optimization endpoint
  return `/api/image?url=${encodeURIComponent(src)}&${params.toString()}`
}

// Lazy loading utilities
export class LazyLoader {
  private observer?: IntersectionObserver
  private loadedElements = new WeakSet()

  constructor() {
    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      this.observer = new IntersectionObserver(
        this.handleIntersection.bind(this),
        {
          rootMargin: '50px 0px',
          threshold: 0.1
        }
      )
    }
  }

  private handleIntersection(entries: IntersectionObserverEntry[]): void {
    entries.forEach(entry => {
      if (entry.isIntersecting && !this.loadedElements.has(entry.target)) {
        this.loadElement(entry.target as HTMLElement)
        this.loadedElements.add(entry.target)
        this.observer?.unobserve(entry.target)
      }
    })
  }

  private loadElement(element: HTMLElement): void {
    const timer = startTimer('lazy_load', { type: element.tagName.toLowerCase() })

    if (element.tagName === 'IMG') {
      const img = element as HTMLImageElement
      const dataSrc = img.dataset.src
      
      if (dataSrc) {
        img.src = dataSrc
        img.onload = () => {
          timer.end('performance')
          recordMetric('lazy_load_success', 1, 'count', 'performance', { type: 'image' })
        }
        img.onerror = () => {
          timer.end('error')
          recordMetric('lazy_load_error', 1, 'count', 'error', { type: 'image' })
        }
      }
    } else if (element.dataset.component) {
      // Load lazy components
      this.loadLazyComponent(element)
    }

    timer.end('performance')
  }

  private async loadLazyComponent(element: HTMLElement): Promise<void> {
    const componentName = element.dataset.component
    if (!componentName) return

    try {
      const timer = startTimer('component_lazy_load', { component: componentName })
      
      // Dynamic import based on component name
      const module = await import(`@/components/${componentName}`)
      const Component = module.default || module[componentName]

      if (Component && typeof window !== 'undefined') {
        // This would integrate with your React rendering system
        recordMetric('component_lazy_load_success', 1, 'count', 'performance', { component: componentName })
      }

      timer.end('performance')
    } catch (error) {
      recordMetric('component_lazy_load_error', 1, 'count', 'error', { component: componentName })
      logger.error('Failed to lazy load component', error as Error, { component: componentName })
    }
  }

  observe(element: Element): void {
    if (this.observer && !this.loadedElements.has(element)) {
      this.observer.observe(element)
    }
  }

  unobserve(element: Element): void {
    if (this.observer) {
      this.observer.unobserve(element)
    }
  }

  disconnect(): void {
    if (this.observer) {
      this.observer.disconnect()
    }
  }
}

// Global lazy loader
export const lazyLoader = new LazyLoader()

// Performance monitoring for Core Web Vitals
export class WebVitalsMonitor {
  private vitals: Record<string, number> = {}

  constructor() {
    if (typeof window !== 'undefined') {
      this.setupWebVitalsTracking()
    }
  }

  private setupWebVitalsTracking(): void {
    // LCP (Largest Contentful Paint)
    this.observePerformanceEntries('largest-contentful-paint', (entries) => {
      const lcpEntry = entries[entries.length - 1]
      this.vitals.lcp = lcpEntry.startTime
      recordMetric('web_vitals_lcp', lcpEntry.startTime, 'ms', 'performance')
      
      if (lcpEntry.startTime > 2500) {
        logger.warn('Poor LCP performance', { lcp: lcpEntry.startTime, threshold: 2500 })
      }
    })

    // FID (First Input Delay) - Modern replacement: INP
    this.observePerformanceEntries('first-input', (entries) => {
      const fidEntry = entries[0]
      this.vitals.fid = fidEntry.processingStart - fidEntry.startTime
      recordMetric('web_vitals_fid', this.vitals.fid, 'ms', 'performance')
      
      if (this.vitals.fid > 100) {
        logger.warn('Poor FID performance', { fid: this.vitals.fid, threshold: 100 })
      }
    })

    // CLS (Cumulative Layout Shift)
    let clsValue = 0
    this.observePerformanceEntries('layout-shift', (entries) => {
      entries.forEach(entry => {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value
        }
      })
      
      this.vitals.cls = clsValue
      recordMetric('web_vitals_cls', clsValue, 'count', 'performance')
      
      if (clsValue > 0.1) {
        logger.warn('Poor CLS performance', { cls: clsValue, threshold: 0.1 })
      }
    })

    // TTFB (Time to First Byte)
    if (window.performance && window.performance.timing) {
      const ttfb = window.performance.timing.responseStart - window.performance.timing.navigationStart
      this.vitals.ttfb = ttfb
      recordMetric('web_vitals_ttfb', ttfb, 'ms', 'performance')
    }
  }

  private observePerformanceEntries(type: string, callback: (entries: PerformanceEntry[]) => void): void {
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          callback(list.getEntries())
        })
        observer.observe({ type, buffered: true })
      } catch (error) {
        logger.error('Failed to observe performance entries', error as Error, { type })
      }
    }
  }

  getVitals(): Record<string, number> {
    return { ...this.vitals }
  }

  reportVitals(): void {
    const vitals = this.getVitals()
    logger.info('Web Vitals Report', vitals)
    
    // Send to analytics service
    if (typeof gtag !== 'undefined') {
      Object.entries(vitals).forEach(([name, value]) => {
        gtag('event', name, {
          value: Math.round(value),
          event_category: 'Web Vitals',
        })
      })
    }
  }
}

// Global web vitals monitor
export const webVitalsMonitor = new WebVitalsMonitor()

// Performance optimization hooks for React
export function usePerformanceOptimization() {
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const optimizeComponent = React.useCallback(async (componentName: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const timer = startTimer('component_optimization', { component: componentName })
      
      // Simulate optimization process
      await new Promise(resolve => setTimeout(resolve, 100))
      
      timer.end('performance')
      recordMetric('component_optimization_success', 1, 'count', 'performance', { component: componentName })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Optimization failed'
      setError(errorMessage)
      recordMetric('component_optimization_error', 1, 'count', 'error', { component: componentName })
      logger.error('Component optimization failed', err as Error, { component: componentName })
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    isLoading,
    error,
    optimizeComponent
  }
}

// Compression utilities
export function compressData(data: string, level: OptimizationConfig['compressionLevel'] = 'medium'): string {
  if (typeof window === 'undefined') return data

  // Simple compression simulation - in production, use proper compression libraries
  const compressionRatios = {
    none: 1,
    low: 0.9,
    medium: 0.7,
    high: 0.5
  }

  const ratio = compressionRatios[level]
  const compressed = data.substring(0, Math.floor(data.length * ratio))
  
  recordMetric('data_compression', data.length - compressed.length, 'bytes', 'performance', { level })
  
  return compressed
}

// Bundle analysis utilities
export function analyzeBundleSize(): Promise<{ total: number; chunks: Array<{ name: string; size: number }> }> {
  return new Promise((resolve) => {
    // This would integrate with webpack-bundle-analyzer or similar
    const mockAnalysis = {
      total: 1024 * 1024, // 1MB
      chunks: [
        { name: 'main', size: 512 * 1024 },
        { name: 'vendor', size: 256 * 1024 },
        { name: 'components', size: 256 * 1024 }
      ]
    }

    recordMetric('bundle_analysis', mockAnalysis.total, 'bytes', 'performance')
    resolve(mockAnalysis)
  })
}

// Cleanup function
export function cleanupPerformanceMonitoring(): void {
  lazyLoader.disconnect()
  cache.clear()
}

// Initialize performance monitoring
if (typeof window !== 'undefined') {
  // Report vitals when the page is about to be unloaded
  window.addEventListener('beforeunload', () => {
    webVitalsMonitor.reportVitals()
    cleanupPerformanceMonitoring()
  })

  // Report vitals on page visibility change
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      webVitalsMonitor.reportVitals()
    }
  })
}

export {
  CacheManager,
  ResourceLoader,
  LazyLoader,
  WebVitalsMonitor,
  DEFAULT_CONFIG as defaultOptimizationConfig
}