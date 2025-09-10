// Advanced code splitting and lazy loading utilities
import { lazy, ComponentType, ReactNode } from 'react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

// Type for lazy loading options
interface LazyLoadOptions {
  fallback?: ReactNode
  retryDelay?: number
  maxRetries?: number
  chunkName?: string
}

// Type for dynamic import function
type DynamicImportFunction<T = any> = () => Promise<{ default: T }>

/**
 * Enhanced lazy loading with error boundary and retry logic
 */
export function createLazyComponent<T extends ComponentType<any>>(
  importFn: DynamicImportFunction<T>,
  options: LazyLoadOptions = {}
): ComponentType<any> {
  const {
    fallback = null,
    retryDelay = 1000,
    maxRetries = 3
  } = options

  // Create a wrapper that handles retries
  const lazyImportWithRetry = () => {
    let retryCount = 0

    const attemptImport = (): Promise<{ default: T }> => {
      return importFn().catch((error) => {
        // Check if we should retry
        if (retryCount < maxRetries && error.name === 'ChunkLoadError') {
          retryCount++
          console.warn(`Chunk load failed, retrying... (${retryCount}/${maxRetries})`)
          
          return new Promise(resolve => {
            setTimeout(() => {
              resolve(attemptImport())
            }, retryDelay * retryCount) // Exponential backoff
          })
        }
        
        // If max retries exceeded or different error, throw
        throw error
      })
    }

    return attemptImport()
  }

  return lazy(lazyImportWithRetry)
}

/**
 * Pre-defined lazy loaded components for common UI elements
 */
export const LazyComponents = {
  // Admin components (heavy, only load when needed)
  AdminDashboard: createLazyComponent(
    () => import('@/app/admin/page'),
    { chunkName: 'admin-dashboard' }
  ),
  
  VehicleManagement: createLazyComponent(
    () => import('@/app/admin/vehicles/page'),
    { chunkName: 'vehicle-management' }
  ),
  
  VehicleForm: createLazyComponent(
    () => import('@/app/admin/vehicles/create/page'),
    { chunkName: 'vehicle-form' }
  ),

  // Chart components (heavy dependencies)
  Chart: createLazyComponent(
    () => import('@/components/ui/chart').then(mod => ({ default: mod.Chart })),
    { chunkName: 'chart-components' }
  ),

  // Map components (heavy Google Maps API)
  LocationMap: createLazyComponent(
    () => import('@/components/ui/location-map'),
    { chunkName: 'map-components' }
  ),

  // Rich text editor (heavy)
  RichTextEditor: createLazyComponent(
    () => import('@/components/ui/rich-text-editor').catch(() => 
      // Fallback to simple textarea if editor fails to load
      import('@/components/ui/textarea').then(mod => ({ default: mod.Textarea }))
    ),
    { chunkName: 'rich-text-editor' }
  ),

  // Data visualization (heavy)
  DataVisualization: createLazyComponent(
    () => import('@/components/ui/data-visualization'),
    { chunkName: 'data-viz' }
  )
}

/**
 * Route-based code splitting utilities
 */
export class RouteBasedSplitting {
  private static preloadedRoutes = new Set<string>()

  /**
   * Preload a route chunk
   */
  static preloadRoute(routePath: string): void {
    if (this.preloadedRoutes.has(routePath)) return

    // Use Next.js router prefetch functionality
    if (typeof window !== 'undefined') {
      import('next/router').then(({ default: Router }) => {
        Router.prefetch(routePath)
        this.preloadedRoutes.add(routePath)
      }).catch(console.warn)
    }
  }

  /**
   * Preload multiple routes
   */
  static preloadRoutes(routePaths: string[]): void {
    routePaths.forEach(route => this.preloadRoute(route))
  }

  /**
   * Preload critical routes based on user role
   */
  static preloadCriticalRoutes(userRole?: string): void {
    const commonRoutes = ['/vehicles', '/about', '/contact']
    
    if (userRole === 'ADMIN' || userRole === 'MANAGER') {
      const adminRoutes = ['/admin', '/admin/vehicles', '/admin/inquiries']
      this.preloadRoutes([...commonRoutes, ...adminRoutes])
    } else {
      this.preloadRoutes(commonRoutes)
    }
  }
}

/**
 * Bundle size analyzer utilities
 */
export class BundleAnalyzer {
  /**
   * Log bundle information for debugging
   */
  static logBundleInfo(): void {
    if (typeof window === 'undefined' || process.env.NODE_ENV === 'production') return

    console.group('🔍 Bundle Analysis')
    console.log('Current route chunks loaded:', this.getLoadedChunks())
    console.log('Memory usage:', this.getMemoryUsage())
    console.log('Performance metrics:', this.getPerformanceMetrics())
    console.groupEnd()
  }

  /**
   * Get currently loaded chunks
   */
  private static getLoadedChunks(): string[] {
    if (typeof window === 'undefined') return []
    
    const scripts = Array.from(document.querySelectorAll('script[src]'))
    return scripts
      .map(script => (script as HTMLScriptElement).src)
      .filter(src => src.includes('/_next/static/chunks/'))
      .map(src => src.split('/').pop() || '')
  }

  /**
   * Get memory usage information
   */
  private static getMemoryUsage(): any {
    if (typeof window === 'undefined' || !(performance as any).memory) {
      return 'Not available'
    }

    const memory = (performance as any).memory
    return {
      used: `${Math.round(memory.usedJSHeapSize / 1048576 * 100) / 100} MB`,
      total: `${Math.round(memory.totalJSHeapSize / 1048576 * 100) / 100} MB`,
      limit: `${Math.round(memory.jsHeapSizeLimit / 1048576 * 100) / 100} MB`
    }
  }

  /**
   * Get performance metrics
   */
  private static getPerformanceMetrics(): any {
    if (typeof window === 'undefined') return 'Not available'

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    return {
      FCP: this.getMetric('first-contentful-paint'),
      LCP: this.getMetric('largest-contentful-paint'),
      FID: this.getMetric('first-input-delay'),
      CLS: this.getMetric('cumulative-layout-shift'),
      domContentLoaded: navigation ? `${Math.round(navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart)}ms` : 'N/A'
    }
  }

  /**
   * Get specific performance metric
   */
  private static getMetric(metricName: string): string {
    try {
      const entries = performance.getEntriesByName(metricName)
      return entries.length > 0 ? `${Math.round(entries[0].startTime)}ms` : 'Not measured'
    } catch {
      return 'Not available'
    }
  }
}

/**
 * Dynamic component loader with caching
 */
export class DynamicComponentLoader {
  private static componentCache = new Map<string, ComponentType<any>>()
  private static loadingPromises = new Map<string, Promise<ComponentType<any>>>()

  /**
   * Load component dynamically with caching
   */
  static async loadComponent<T extends ComponentType<any>>(
    componentPath: string,
    importFn: DynamicImportFunction<T>
  ): Promise<T> {
    // Check cache first
    if (this.componentCache.has(componentPath)) {
      return this.componentCache.get(componentPath) as T
    }

    // Check if already loading
    if (this.loadingPromises.has(componentPath)) {
      return this.loadingPromises.get(componentPath) as Promise<T>
    }

    // Start loading
    const loadingPromise = importFn()
      .then(module => {
        const component = module.default
        this.componentCache.set(componentPath, component)
        this.loadingPromises.delete(componentPath)
        return component
      })
      .catch(error => {
        this.loadingPromises.delete(componentPath)
        throw error
      })

    this.loadingPromises.set(componentPath, loadingPromise)
    return loadingPromise
  }

  /**
   * Preload components
   */
  static preloadComponent<T extends ComponentType<any>>(
    componentPath: string,
    importFn: DynamicImportFunction<T>
  ): void {
    if (!this.componentCache.has(componentPath) && !this.loadingPromises.has(componentPath)) {
      this.loadComponent(componentPath, importFn).catch(console.warn)
    }
  }

  /**
   * Clear component cache
   */
  static clearCache(): void {
    this.componentCache.clear()
    this.loadingPromises.clear()
  }

  /**
   * Get cache statistics
   */
  static getCacheStats(): { cached: number; loading: number } {
    return {
      cached: this.componentCache.size,
      loading: this.loadingPromises.size
    }
  }
}

/**
 * Intersection Observer based lazy loading for any content
 */
export class LazyContentLoader {
  private static observers = new Map<string, IntersectionObserver>()

  /**
   * Create lazy loader for content sections
   */
  static createContentLoader(
    options: {
      rootMargin?: string
      threshold?: number
      onVisible?: (element: Element) => void
      onHidden?: (element: Element) => void
    } = {}
  ): IntersectionObserver {
    const {
      rootMargin = '100px 0px',
      threshold = 0.1,
      onVisible,
      onHidden
    } = options

    const observerId = `loader-${Date.now()}-${Math.random()}`
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('lazy-loaded')
            onVisible?.(entry.target)
          } else {
            entry.target.classList.remove('lazy-loaded')
            onHidden?.(entry.target)
          }
        })
      },
      { rootMargin, threshold }
    )

    this.observers.set(observerId, observer)
    return observer
  }

  /**
   * Clean up all observers
   */
  static cleanup(): void {
    this.observers.forEach(observer => observer.disconnect())
    this.observers.clear()
  }
}

// Initialize bundle analyzer in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // Log bundle info after initial load
  setTimeout(() => {
    BundleAnalyzer.logBundleInfo()
  }, 2000)

  // Log bundle info on route changes
  if (typeof window !== 'undefined') {
    let currentPath = window.location.pathname
    setInterval(() => {
      if (window.location.pathname !== currentPath) {
        currentPath = window.location.pathname
        setTimeout(() => BundleAnalyzer.logBundleInfo(), 1000)
      }
    }, 1000)
  }
}