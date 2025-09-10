// Advanced performance monitoring and analytics
import { getCLS, getFID, getFCP, getLCP, getTTFB, onCLS, onFID, onFCP, onLCP, onTTFB } from 'web-vitals'

// Performance metrics types
export interface PerformanceMetric {
  name: string
  value: number
  id: string
  delta: number
  rating: 'good' | 'needs-improvement' | 'poor'
  timestamp: number
  url: string
  userAgent: string
}

export interface ResourceTiming {
  name: string
  duration: number
  transferSize: number
  encodedBodySize: number
  decodedBodySize: number
  initiatorType: string
}

export interface PerformanceAnalytics {
  coreWebVitals: PerformanceMetric[]
  customMetrics: Record<string, number>
  resourceTimings: ResourceTiming[]
  navigationTiming: Record<string, number>
  memoryUsage?: {
    used: number
    total: number
    limit: number
  }
}

/**
 * Core Web Vitals monitoring and reporting
 */
export class WebVitalsMonitor {
  private static metrics: PerformanceMetric[] = []
  private static isInitialized = false

  /**
   * Initialize Web Vitals monitoring
   */
  static initialize(): void {
    if (this.isInitialized || typeof window === 'undefined') return

    // Monitor Core Web Vitals
    onCLS(this.handleMetric.bind(this))
    onFID(this.handleMetric.bind(this))
    onFCP(this.handleMetric.bind(this))
    onLCP(this.handleMetric.bind(this))
    onTTFB(this.handleMetric.bind(this))

    // Monitor page visibility changes for more accurate metrics
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.sendAnalytics()
      }
    })

    this.isInitialized = true
    console.log('📊 Web Vitals monitoring initialized')
  }

  /**
   * Handle individual metric
   */
  private static handleMetric(metric: any): void {
    const performanceMetric: PerformanceMetric = {
      name: metric.name,
      value: metric.value,
      id: metric.id,
      delta: metric.delta,
      rating: metric.rating,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent
    }

    this.metrics.push(performanceMetric)

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      this.logMetric(performanceMetric)
    }

    // Send to analytics immediately for poor ratings
    if (metric.rating === 'poor') {
      this.sendMetricToAnalytics(performanceMetric)
    }
  }

  /**
   * Log metric to console (development only)
   */
  private static logMetric(metric: PerformanceMetric): void {
    const emoji = {
      good: '✅',
      'needs-improvement': '⚠️',
      poor: '❌'
    }[metric.rating]

    console.log(
      `${emoji} ${metric.name}: ${metric.value.toFixed(2)}${metric.name === 'CLS' ? '' : 'ms'} (${metric.rating})`
    )
  }

  /**
   * Send metric to analytics service
   */
  private static sendMetricToAnalytics(metric: PerformanceMetric): void {
    // Send to Google Analytics 4
    if (typeof gtag !== 'undefined') {
      gtag('event', metric.name, {
        event_category: 'Web Vitals',
        event_label: metric.id,
        value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
        custom_map: {
          metric_rating: metric.rating,
          page_url: metric.url
        }
      })
    }

    // Send to custom analytics endpoint
    if (process.env.NODE_ENV === 'production') {
      fetch('/api/analytics/web-vitals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(metric)
      }).catch(console.warn)
    }
  }

  /**
   * Send all collected analytics
   */
  private static sendAnalytics(): void {
    if (this.metrics.length === 0) return

    const analytics: PerformanceAnalytics = {
      coreWebVitals: this.metrics,
      customMetrics: CustomMetrics.getAllMetrics(),
      resourceTimings: ResourceMonitor.getResourceTimings(),
      navigationTiming: this.getNavigationTiming(),
      memoryUsage: this.getMemoryUsage()
    }

    // Send to analytics endpoint
    if (process.env.NODE_ENV === 'production') {
      navigator.sendBeacon('/api/analytics/performance', JSON.stringify(analytics))
    }
  }

  /**
   * Get navigation timing data
   */
  private static getNavigationTiming(): Record<string, number> {
    if (!performance.getEntriesByType) return {}

    const [navigation] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[]
    if (!navigation) return {}

    return {
      dnsLookup: navigation.domainLookupEnd - navigation.domainLookupStart,
      tcpConnect: navigation.connectEnd - navigation.connectStart,
      request: navigation.responseStart - navigation.requestStart,
      response: navigation.responseEnd - navigation.responseStart,
      domProcessing: navigation.domComplete - navigation.domLoading,
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      pageLoad: navigation.loadEventEnd - navigation.loadEventStart
    }
  }

  /**
   * Get memory usage information
   */
  private static getMemoryUsage() {
    if (!(performance as any).memory) return undefined

    const memory = (performance as any).memory
    return {
      used: memory.usedJSHeapSize,
      total: memory.totalJSHeapSize,
      limit: memory.jsHeapSizeLimit
    }
  }

  /**
   * Get current metrics
   */
  static getMetrics(): PerformanceMetric[] {
    return [...this.metrics]
  }

  /**
   * Clear metrics
   */
  static clearMetrics(): void {
    this.metrics = []
  }
}

/**
 * Custom performance metrics tracking
 */
export class CustomMetrics {
  private static metrics: Record<string, number> = {}
  private static startTimes: Record<string, number> = {}

  /**
   * Start timing a custom metric
   */
  static startTiming(name: string): void {
    this.startTimes[name] = performance.now()
  }

  /**
   * End timing a custom metric
   */
  static endTiming(name: string): number {
    const startTime = this.startTimes[name]
    if (!startTime) {
      console.warn(`No start time found for metric: ${name}`)
      return 0
    }

    const duration = performance.now() - startTime
    this.metrics[name] = duration
    delete this.startTimes[name]

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`⏱️ ${name}: ${duration.toFixed(2)}ms`)
    }

    return duration
  }

  /**
   * Set a custom metric value
   */
  static setMetric(name: string, value: number): void {
    this.metrics[name] = value
  }

  /**
   * Increment a counter metric
   */
  static incrementMetric(name: string, amount: number = 1): void {
    this.metrics[name] = (this.metrics[name] || 0) + amount
  }

  /**
   * Get all custom metrics
   */
  static getAllMetrics(): Record<string, number> {
    return { ...this.metrics }
  }

  /**
   * Get specific metric
   */
  static getMetric(name: string): number | undefined {
    return this.metrics[name]
  }

  /**
   * Clear all metrics
   */
  static clearMetrics(): void {
    this.metrics = {}
    this.startTimes = {}
  }
}

/**
 * Resource loading performance monitoring
 */
export class ResourceMonitor {
  private static observer: PerformanceObserver | null = null
  private static resourceTimings: ResourceTiming[] = []

  /**
   * Initialize resource monitoring
   */
  static initialize(): void {
    if (this.observer || typeof window === 'undefined') return

    if ('PerformanceObserver' in window) {
      this.observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'resource') {
            this.handleResourceEntry(entry as PerformanceResourceTiming)
          }
        }
      })

      this.observer.observe({ entryTypes: ['resource'] })
      console.log('📊 Resource monitoring initialized')
    }
  }

  /**
   * Handle resource performance entry
   */
  private static handleResourceEntry(entry: PerformanceResourceTiming): void {
    // Skip data URLs and blob URLs
    if (entry.name.startsWith('data:') || entry.name.startsWith('blob:')) return

    const timing: ResourceTiming = {
      name: entry.name,
      duration: entry.duration,
      transferSize: entry.transferSize || 0,
      encodedBodySize: entry.encodedBodySize || 0,
      decodedBodySize: entry.decodedBodySize || 0,
      initiatorType: entry.initiatorType
    }

    this.resourceTimings.push(timing)

    // Warn about slow resources in development
    if (process.env.NODE_ENV === 'development' && entry.duration > 1000) {
      console.warn(`🐌 Slow resource (${entry.duration.toFixed(0)}ms):`, entry.name)
    }

    // Warn about large resources
    if (entry.transferSize > 1000000) { // > 1MB
      console.warn(`📦 Large resource (${(entry.transferSize / 1024 / 1024).toFixed(1)}MB):`, entry.name)
    }
  }

  /**
   * Get resource timings
   */
  static getResourceTimings(): ResourceTiming[] {
    return [...this.resourceTimings]
  }

  /**
   * Get slow resources (> threshold ms)
   */
  static getSlowResources(threshold: number = 1000): ResourceTiming[] {
    return this.resourceTimings.filter(timing => timing.duration > threshold)
  }

  /**
   * Get large resources (> threshold bytes)
   */
  static getLargeResources(threshold: number = 500000): ResourceTiming[] {
    return this.resourceTimings.filter(timing => timing.transferSize > threshold)
  }

  /**
   * Clear resource timings
   */
  static clearResourceTimings(): void {
    this.resourceTimings = []
  }

  /**
   * Disconnect observer
   */
  static disconnect(): void {
    if (this.observer) {
      this.observer.disconnect()
      this.observer = null
    }
  }
}

/**
 * User interaction tracking for performance impact analysis
 */
export class InteractionMonitor {
  private static interactions: Array<{
    type: string
    target: string
    timestamp: number
    duration?: number
  }> = []

  /**
   * Initialize interaction monitoring
   */
  static initialize(): void {
    if (typeof window === 'undefined') return

    // Track long tasks that might affect user interactions
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) { // Tasks longer than 50ms
            console.warn(`🔴 Long task detected: ${entry.duration.toFixed(0)}ms`)
            CustomMetrics.incrementMetric('long_tasks')
          }
        }
      })

      try {
        observer.observe({ entryTypes: ['longtask'] })
      } catch (e) {
        // Longtask API not supported in all browsers
        console.log('Longtask monitoring not supported')
      }
    }

    // Track user interactions
    ['click', 'scroll', 'keydown', 'touchstart'].forEach(eventType => {
      document.addEventListener(eventType, this.handleInteraction.bind(this), { passive: true })
    })

    console.log('📊 Interaction monitoring initialized')
  }

  /**
   * Handle user interaction
   */
  private static handleInteraction(event: Event): void {
    const interaction = {
      type: event.type,
      target: this.getTargetSelector(event.target as Element),
      timestamp: performance.now()
    }

    this.interactions.push(interaction)

    // Keep only last 100 interactions to prevent memory leaks
    if (this.interactions.length > 100) {
      this.interactions = this.interactions.slice(-100)
    }
  }

  /**
   * Get CSS selector for target element
   */
  private static getTargetSelector(element: Element | null): string {
    if (!element) return 'unknown'

    if (element.id) {
      return `#${element.id}`
    }

    if (element.className && typeof element.className === 'string') {
      const classes = element.className.split(' ').filter(c => c.length > 0)
      if (classes.length > 0) {
        return `.${classes.join('.')}`
      }
    }

    return element.tagName.toLowerCase()
  }

  /**
   * Get interaction data
   */
  static getInteractions() {
    return [...this.interactions]
  }

  /**
   * Clear interaction data
   */
  static clearInteractions(): void {
    this.interactions = []
  }
}

/**
 * Performance budget monitoring
 */
export class PerformanceBudget {
  private static budgets = {
    FCP: 1800, // First Contentful Paint
    LCP: 2500, // Largest Contentful Paint
    FID: 100,  // First Input Delay
    CLS: 0.1,  // Cumulative Layout Shift
    TTFB: 600, // Time to First Byte
    bundleSize: 1000000, // 1MB
    imageSize: 500000    // 500KB per image
  }

  /**
   * Check if metrics meet performance budget
   */
  static checkBudget(metrics: PerformanceMetric[]): {
    passed: boolean
    violations: Array<{
      metric: string
      actual: number
      budget: number
      severity: 'warning' | 'error'
    }>
  } {
    const violations: Array<{
      metric: string
      actual: number
      budget: number
      severity: 'warning' | 'error'
    }> = []

    metrics.forEach(metric => {
      const budget = this.budgets[metric.name as keyof typeof this.budgets]
      if (budget && metric.value > budget) {
        violations.push({
          metric: metric.name,
          actual: metric.value,
          budget,
          severity: metric.rating === 'poor' ? 'error' : 'warning'
        })
      }
    })

    return {
      passed: violations.length === 0,
      violations
    }
  }

  /**
   * Update performance budgets
   */
  static updateBudgets(newBudgets: Partial<typeof this.budgets>): void {
    Object.assign(this.budgets, newBudgets)
  }

  /**
   * Get current budgets
   */
  static getBudgets() {
    return { ...this.budgets }
  }
}

/**
 * Main performance monitoring class
 */
export class PerformanceMonitor {
  private static isInitialized = false

  /**
   * Initialize all performance monitoring
   */
  static initialize(): void {
    if (this.isInitialized || typeof window === 'undefined') return

    // Initialize all monitors
    WebVitalsMonitor.initialize()
    ResourceMonitor.initialize()
    InteractionMonitor.initialize()

    // Start custom metrics
    CustomMetrics.startTiming('app_initialization')

    // Monitor page load complete
    if (document.readyState === 'complete') {
      this.onPageLoadComplete()
    } else {
      window.addEventListener('load', this.onPageLoadComplete.bind(this))
    }

    this.isInitialized = true
    console.log('🚀 Performance monitoring fully initialized')
  }

  /**
   * Handle page load completion
   */
  private static onPageLoadComplete(): void {
    CustomMetrics.endTiming('app_initialization')
    CustomMetrics.setMetric('initial_bundle_size', this.estimateBundleSize())
    
    // Check performance budget after page load
    setTimeout(() => {
      const metrics = WebVitalsMonitor.getMetrics()
      const budgetCheck = PerformanceBudget.checkBudget(metrics)
      
      if (!budgetCheck.passed) {
        console.warn('🚨 Performance budget violations:', budgetCheck.violations)
      }
    }, 3000) // Wait 3 seconds for all metrics to be captured
  }

  /**
   * Estimate initial bundle size from loaded scripts
   */
  private static estimateBundleSize(): number {
    const scripts = Array.from(document.querySelectorAll('script[src]'))
    const jsFiles = scripts
      .map(s => (s as HTMLScriptElement).src)
      .filter(src => src.includes('/_next/static/chunks/'))

    // Estimate based on number of chunks (rough approximation)
    return jsFiles.length * 50000 // Assume ~50KB per chunk
  }

  /**
   * Get comprehensive performance report
   */
  static getPerformanceReport(): PerformanceAnalytics & {
    budgetCheck: ReturnType<typeof PerformanceBudget.checkBudget>
    slowResources: ResourceTiming[]
    largeResources: ResourceTiming[]
  } {
    const metrics = WebVitalsMonitor.getMetrics()
    
    return {
      coreWebVitals: metrics,
      customMetrics: CustomMetrics.getAllMetrics(),
      resourceTimings: ResourceMonitor.getResourceTimings(),
      navigationTiming: {},
      budgetCheck: PerformanceBudget.checkBudget(metrics),
      slowResources: ResourceMonitor.getSlowResources(),
      largeResources: ResourceMonitor.getLargeResources()
    }
  }

  /**
   * Cleanup all monitors
   */
  static cleanup(): void {
    ResourceMonitor.disconnect()
    WebVitalsMonitor.clearMetrics()
    CustomMetrics.clearMetrics()
    InteractionMonitor.clearInteractions()
    this.isInitialized = false
  }
}

// Auto-initialize in browser environment
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
  // Small delay to ensure app is ready
  setTimeout(() => {
    PerformanceMonitor.initialize()
  }, 100)
}