import { logger } from './logger'

// Performance monitoring interfaces
export interface PerformanceMetric {
  name: string
  value: number
  unit: 'ms' | 'bytes' | 'count' | 'percent'
  timestamp: number
  category: 'performance' | 'error' | 'user' | 'business'
  tags?: Record<string, string>
}

export interface DatabaseMetric {
  query: string
  duration: number
  table: string
  operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE'
  rowsAffected?: number
  error?: string
}

export interface APIMetric {
  endpoint: string
  method: string
  statusCode: number
  duration: number
  userId?: string
  userAgent?: string
  ip?: string
  error?: string
}

export interface ErrorMetric {
  type: 'client' | 'server' | 'database' | 'external'
  message: string
  stack?: string
  userId?: string
  url?: string
  component?: string
}

// Performance thresholds
export const PERFORMANCE_THRESHOLDS = {
  API_RESPONSE_TIME: 1000, // 1 second
  DATABASE_QUERY_TIME: 500, // 500ms
  PAGE_LOAD_TIME: 3000, // 3 seconds
  MEMORY_USAGE: 512 * 1024 * 1024, // 512MB
  ERROR_RATE: 0.05 // 5%
} as const

// Metrics collector class
class MetricsCollector {
  private metrics: PerformanceMetric[] = []
  private flushInterval?: NodeJS.Timeout
  private errorCounts = new Map<string, number>()
  private requestCounts = new Map<string, number>()

  constructor() {
    // Flush metrics every 30 seconds
    this.flushInterval = setInterval(() => this.flush(), 30000)
  }

  // Record a performance metric
  recordMetric(metric: Omit<PerformanceMetric, 'timestamp'>): void {
    const fullMetric: PerformanceMetric = {
      ...metric,
      timestamp: Date.now()
    }

    this.metrics.push(fullMetric)

    // Log performance issues
    this.checkThresholds(fullMetric)

    // Prevent memory leaks by limiting stored metrics
    if (this.metrics.length > 1000) {
      this.metrics.splice(0, 500) // Remove oldest 500 metrics
    }
  }

  // Record API call metrics
  recordAPICall(metric: APIMetric): void {
    const key = `${metric.method}:${metric.endpoint}`
    
    this.recordMetric({
      name: 'api_request_duration',
      value: metric.duration,
      unit: 'ms',
      category: 'performance',
      tags: {
        endpoint: metric.endpoint,
        method: metric.method,
        statusCode: metric.statusCode.toString()
      }
    })

    // Track request counts
    const currentCount = this.requestCounts.get(key) || 0
    this.requestCounts.set(key, currentCount + 1)

    // Track error rates
    if (metric.statusCode >= 400) {
      const errorKey = `${key}:error`
      const currentErrors = this.errorCounts.get(errorKey) || 0
      this.errorCounts.set(errorKey, currentErrors + 1)

      // Record error metric
      this.recordMetric({
        name: 'api_error_count',
        value: 1,
        unit: 'count',
        category: 'error',
        tags: {
          endpoint: metric.endpoint,
          method: metric.method,
          statusCode: metric.statusCode.toString()
        }
      })

      // Log API errors
      logger.warn('API Error', {
        endpoint: metric.endpoint,
        method: metric.method,
        statusCode: metric.statusCode,
        duration: metric.duration,
        error: metric.error
      })
    }
  }

  // Record database metrics
  recordDatabaseQuery(metric: DatabaseMetric): void {
    this.recordMetric({
      name: 'database_query_duration',
      value: metric.duration,
      unit: 'ms',
      category: 'performance',
      tags: {
        table: metric.table,
        operation: metric.operation
      }
    })

    if (metric.error) {
      this.recordMetric({
        name: 'database_error_count',
        value: 1,
        unit: 'count',
        category: 'error',
        tags: {
          table: metric.table,
          operation: metric.operation
        }
      })

      logger.error('Database Error', new Error(metric.error), {
        query: metric.query,
        table: metric.table,
        operation: metric.operation
      })
    }
  }

  // Record client-side errors
  recordClientError(metric: ErrorMetric): void {
    this.recordMetric({
      name: 'client_error_count',
      value: 1,
      unit: 'count',
      category: 'error',
      tags: {
        type: metric.type,
        component: metric.component || 'unknown'
      }
    })

    logger.error('Client Error', new Error(metric.message), {
      type: metric.type,
      userId: metric.userId,
      url: metric.url,
      component: metric.component,
      stack: metric.stack
    })
  }

  // Check performance thresholds
  private checkThresholds(metric: PerformanceMetric): void {
    switch (metric.name) {
      case 'api_request_duration':
        if (metric.value > PERFORMANCE_THRESHOLDS.API_RESPONSE_TIME) {
          logger.warn('Slow API Response', {
            endpoint: metric.tags?.endpoint,
            duration: metric.value,
            threshold: PERFORMANCE_THRESHOLDS.API_RESPONSE_TIME
          })
        }
        break

      case 'database_query_duration':
        if (metric.value > PERFORMANCE_THRESHOLDS.DATABASE_QUERY_TIME) {
          logger.warn('Slow Database Query', {
            table: metric.tags?.table,
            operation: metric.tags?.operation,
            duration: metric.value,
            threshold: PERFORMANCE_THRESHOLDS.DATABASE_QUERY_TIME
          })
        }
        break

      case 'page_load_time':
        if (metric.value > PERFORMANCE_THRESHOLDS.PAGE_LOAD_TIME) {
          logger.warn('Slow Page Load', {
            page: metric.tags?.page,
            duration: metric.value,
            threshold: PERFORMANCE_THRESHOLDS.PAGE_LOAD_TIME
          })
        }
        break
    }
  }

  // Get current metrics summary
  getMetricsSummary(): Record<string, any> {
    const now = Date.now()
    const last5Minutes = now - 5 * 60 * 1000
    const recentMetrics = this.metrics.filter(m => m.timestamp > last5Minutes)

    const summary: Record<string, any> = {
      totalMetrics: this.metrics.length,
      recentMetrics: recentMetrics.length,
      errorCounts: Object.fromEntries(this.errorCounts),
      requestCounts: Object.fromEntries(this.requestCounts)
    }

    // Group by category
    const byCategory = recentMetrics.reduce((acc, metric) => {
      if (!acc[metric.category]) {
        acc[metric.category] = []
      }
      acc[metric.category].push(metric)
      return acc
    }, {} as Record<string, PerformanceMetric[]>)

    // Calculate averages
    Object.entries(byCategory).forEach(([category, metrics]) => {
      const avgValue = metrics.reduce((sum, m) => sum + m.value, 0) / metrics.length
      summary[`${category}_avg`] = Math.round(avgValue * 100) / 100
    })

    return summary
  }

  // Calculate error rates
  getErrorRates(): Record<string, number> {
    const rates: Record<string, number> = {}

    this.requestCounts.forEach((requests, endpoint) => {
      const errorKey = `${endpoint}:error`
      const errors = this.errorCounts.get(errorKey) || 0
      const rate = requests > 0 ? errors / requests : 0
      
      if (rate > 0) {
        rates[endpoint] = Math.round(rate * 10000) / 100 // Convert to percentage
      }

      // Alert on high error rates
      if (rate > PERFORMANCE_THRESHOLDS.ERROR_RATE) {
        logger.warn('High Error Rate', {
          endpoint,
          errorRate: rate,
          errors,
          requests,
          threshold: PERFORMANCE_THRESHOLDS.ERROR_RATE
        })
      }
    })

    return rates
  }

  // Flush metrics (implement actual flushing logic here)
  private async flush(): Promise<void> {
    if (this.metrics.length === 0) return

    try {
      // In a real implementation, you would send metrics to your monitoring service
      // For now, we'll just log a summary
      const summary = this.getMetricsSummary()
      const errorRates = this.getErrorRates()

      logger.debug('Metrics Summary', { summary, errorRates })

      // Keep only recent metrics after flush
      const oneHourAgo = Date.now() - 60 * 60 * 1000
      this.metrics = this.metrics.filter(m => m.timestamp > oneHourAgo)

      // Reset old error counts
      const fiveMinutesAgo = Date.now() - 5 * 60 * 1000
      this.errorCounts.clear()
      this.requestCounts.clear()

    } catch (error) {
      logger.error('Failed to flush metrics', error as Error)
    }
  }

  // Cleanup resources
  cleanup(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval)
    }
    this.flush()
  }
}

// Global metrics collector instance
export const metricsCollector = new MetricsCollector()

// Performance timing utilities
export class PerformanceTimer {
  private startTime: number
  private name: string
  private tags?: Record<string, string>

  constructor(name: string, tags?: Record<string, string>) {
    this.name = name
    this.tags = tags
    this.startTime = performance.now()
  }

  end(category: PerformanceMetric['category'] = 'performance'): number {
    const duration = performance.now() - this.startTime
    
    metricsCollector.recordMetric({
      name: this.name,
      value: Math.round(duration),
      unit: 'ms',
      category,
      tags: this.tags
    })

    return duration
  }
}

// Utility functions
export function startTimer(name: string, tags?: Record<string, string>): PerformanceTimer {
  return new PerformanceTimer(name, tags)
}

export function recordMetric(
  name: string,
  value: number,
  unit: PerformanceMetric['unit'] = 'count',
  category: PerformanceMetric['category'] = 'performance',
  tags?: Record<string, string>
): void {
  metricsCollector.recordMetric({
    name,
    value,
    unit,
    category,
    tags
  })
}

// Memory monitoring
export function monitorMemoryUsage(): void {
  if (typeof process !== 'undefined' && process.memoryUsage) {
    const usage = process.memoryUsage()
    
    Object.entries(usage).forEach(([key, value]) => {
      metricsCollector.recordMetric({
        name: `memory_${key}`,
        value,
        unit: 'bytes',
        category: 'performance',
        tags: { type: key }
      })

      // Alert on high memory usage
      if (key === 'heapUsed' && value > PERFORMANCE_THRESHOLDS.MEMORY_USAGE) {
        logger.warn('High Memory Usage', {
          heapUsed: value,
          threshold: PERFORMANCE_THRESHOLDS.MEMORY_USAGE
        })
      }
    })
  }
}

// System health check
export async function getSystemHealth(): Promise<{
  status: 'healthy' | 'degraded' | 'unhealthy'
  checks: Record<string, boolean>
  metrics: Record<string, any>
}> {
  const checks: Record<string, boolean> = {}
  
  // Database check (implement actual database ping)
  try {
    // await pingDatabase()
    checks.database = true
  } catch {
    checks.database = false
  }

  // External services check
  try {
    // Check external APIs, file storage, etc.
    checks.externalServices = true
  } catch {
    checks.externalServices = false
  }

  // Memory check
  if (typeof process !== 'undefined' && process.memoryUsage) {
    const usage = process.memoryUsage()
    checks.memory = usage.heapUsed < PERFORMANCE_THRESHOLDS.MEMORY_USAGE
  } else {
    checks.memory = true
  }

  // Error rate check
  const errorRates = metricsCollector.getErrorRates()
  const hasHighErrorRate = Object.values(errorRates).some(rate => rate > PERFORMANCE_THRESHOLDS.ERROR_RATE * 100)
  checks.errorRate = !hasHighErrorRate

  // Determine overall status
  const healthyChecks = Object.values(checks).filter(Boolean).length
  const totalChecks = Object.keys(checks).length
  
  let status: 'healthy' | 'degraded' | 'unhealthy'
  if (healthyChecks === totalChecks) {
    status = 'healthy'
  } else if (healthyChecks >= totalChecks * 0.7) {
    status = 'degraded'
  } else {
    status = 'unhealthy'
  }

  const metrics = metricsCollector.getMetricsSummary()

  return {
    status,
    checks,
    metrics
  }
}

// React component performance monitoring
export function withPerformanceMonitoring<T extends {}>(
  WrappedComponent: React.ComponentType<T>,
  componentName?: string
) {
  return function PerformanceMonitoredComponent(props: T) {
    const timer = startTimer('component_render', {
      component: componentName || WrappedComponent.name || 'Unknown'
    })

    React.useEffect(() => {
      timer.end('performance')
    })

    return React.createElement(WrappedComponent, props)
  }
}

// API monitoring middleware
export function monitorAPICall(
  endpoint: string,
  method: string,
  statusCode: number,
  startTime: number,
  userId?: string,
  error?: string
): void {
  const duration = Date.now() - startTime

  metricsCollector.recordAPICall({
    endpoint,
    method,
    statusCode,
    duration,
    userId,
    error
  })
}

// Database monitoring wrapper
export function monitorDatabaseQuery<T>(
  query: string,
  table: string,
  operation: DatabaseMetric['operation'],
  queryFunction: () => Promise<T>
): Promise<T> {
  const startTime = Date.now()

  return queryFunction()
    .then(result => {
      const duration = Date.now() - startTime
      metricsCollector.recordDatabaseQuery({
        query,
        table,
        operation,
        duration
      })
      return result
    })
    .catch(error => {
      const duration = Date.now() - startTime
      metricsCollector.recordDatabaseQuery({
        query,
        table,
        operation,
        duration,
        error: error.message
      })
      throw error
    })
}

// Client-side error monitoring
if (typeof window !== 'undefined') {
  // Monitor unhandled errors
  window.addEventListener('error', (event) => {
    metricsCollector.recordClientError({
      type: 'client',
      message: event.message,
      url: event.filename,
      component: 'global'
    })
  })

  // Monitor unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    metricsCollector.recordClientError({
      type: 'client',
      message: event.reason?.message || 'Unhandled promise rejection',
      component: 'global'
    })
  })

  // Monitor page load performance
  window.addEventListener('load', () => {
    if (window.performance && window.performance.timing) {
      const timing = window.performance.timing
      const loadTime = timing.loadEventEnd - timing.navigationStart

      recordMetric('page_load_time', loadTime, 'ms', 'performance', {
        page: window.location.pathname
      })
    }
  })
}

// Cleanup on process exit
if (typeof process !== 'undefined') {
  process.on('exit', () => {
    metricsCollector.cleanup()
  })

  process.on('SIGINT', () => {
    metricsCollector.cleanup()
    process.exit(0)
  })

  process.on('SIGTERM', () => {
    metricsCollector.cleanup()
    process.exit(0)
  })
}

export {
  MetricsCollector,
  metricsCollector as metrics
}