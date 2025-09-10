'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Activity, TrendingUp, TrendingDown, Zap, 
  Clock, Eye, Gauge, AlertTriangle 
} from 'lucide-react'
import { webVitalsMonitor, cache } from '@/lib/performance'
import { metricsCollector } from '@/lib/monitoring'

interface PerformanceMetrics {
  lcp?: number
  fid?: number
  cls?: number
  ttfb?: number
  cacheHitRate?: number
  errorRate?: number
  responseTime?: number
}

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({})
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const updateMetrics = () => {
      const vitals = webVitalsMonitor.getVitals()
      const cacheStats = cache.getStats()
      const summary = metricsCollector.getMetricsSummary()

      setMetrics({
        ...vitals,
        cacheHitRate: cacheStats.hitRate,
        errorRate: summary.errorRate || 0,
        responseTime: summary.performance_avg || 0
      })
    }

    updateMetrics()
    const interval = setInterval(updateMetrics, 5000) // Update every 5 seconds

    return () => clearInterval(interval)
  }, [])

  const getScoreColor = (score: number, thresholds: { good: number; needs: number }): string => {
    if (score <= thresholds.good) return 'text-green-600'
    if (score <= thresholds.needs) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreLabel = (score: number, thresholds: { good: number; needs: number }): string => {
    if (score <= thresholds.good) return 'Good'
    if (score <= thresholds.needs) return 'Needs Improvement'
    return 'Poor'
  }

  const formatTime = (time: number): string => {
    if (time > 1000) return `${(time / 1000).toFixed(1)}s`
    return `${Math.round(time)}ms`
  }

  if (!isVisible && process.env.NODE_ENV === 'production') {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 z-50 bg-white shadow-lg border"
        title="Show Performance Monitor"
      >
        <Activity className="h-4 w-4" />
      </Button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80">
      <Card className="shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center">
              <Activity className="h-4 w-4 mr-2" />
              Performance Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(false)}
              className="h-6 w-6 p-0"
            >
              ×
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-xs">
          {/* Core Web Vitals */}
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">Core Web Vitals</h4>
            
            {/* LCP */}
            {metrics.lcp && (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Eye className="h-3 w-3 mr-1 text-gray-400" />
                  <span>LCP</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={getScoreColor(metrics.lcp, { good: 2500, needs: 4000 })}>
                    {formatTime(metrics.lcp)}
                  </span>
                  <Badge 
                    variant={metrics.lcp <= 2500 ? 'default' : metrics.lcp <= 4000 ? 'secondary' : 'destructive'}
                    className="text-xs"
                  >
                    {getScoreLabel(metrics.lcp, { good: 2500, needs: 4000 })}
                  </Badge>
                </div>
              </div>
            )}

            {/* FID */}
            {metrics.fid && (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Zap className="h-3 w-3 mr-1 text-gray-400" />
                  <span>FID</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={getScoreColor(metrics.fid, { good: 100, needs: 300 })}>
                    {formatTime(metrics.fid)}
                  </span>
                  <Badge 
                    variant={metrics.fid <= 100 ? 'default' : metrics.fid <= 300 ? 'secondary' : 'destructive'}
                    className="text-xs"
                  >
                    {getScoreLabel(metrics.fid, { good: 100, needs: 300 })}
                  </Badge>
                </div>
              </div>
            )}

            {/* CLS */}
            {metrics.cls !== undefined && (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1 text-gray-400" />
                  <span>CLS</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={getScoreColor(metrics.cls, { good: 0.1, needs: 0.25 })}>
                    {metrics.cls.toFixed(3)}
                  </span>
                  <Badge 
                    variant={metrics.cls <= 0.1 ? 'default' : metrics.cls <= 0.25 ? 'secondary' : 'destructive'}
                    className="text-xs"
                  >
                    {getScoreLabel(metrics.cls, { good: 0.1, needs: 0.25 })}
                  </Badge>
                </div>
              </div>
            )}
          </div>

          {/* Additional Metrics */}
          <div className="space-y-2 border-t pt-3">
            <h4 className="font-medium text-gray-900">Performance</h4>
            
            {/* TTFB */}
            {metrics.ttfb && (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Clock className="h-3 w-3 mr-1 text-gray-400" />
                  <span>TTFB</span>
                </div>
                <span className="text-gray-600">{formatTime(metrics.ttfb)}</span>
              </div>
            )}

            {/* Response Time */}
            {metrics.responseTime && (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Gauge className="h-3 w-3 mr-1 text-gray-400" />
                  <span>Response Time</span>
                </div>
                <span className="text-gray-600">{formatTime(metrics.responseTime)}</span>
              </div>
            )}

            {/* Cache Hit Rate */}
            {metrics.cacheHitRate !== undefined && (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Activity className="h-3 w-3 mr-1 text-gray-400" />
                  <span>Cache Hit Rate</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className={metrics.cacheHitRate > 0.8 ? 'text-green-600' : 'text-yellow-600'}>
                    {(metrics.cacheHitRate * 100).toFixed(1)}%
                  </span>
                  {metrics.cacheHitRate > 0.8 ? 
                    <TrendingUp className="h-3 w-3 text-green-600" /> : 
                    <TrendingDown className="h-3 w-3 text-yellow-600" />
                  }
                </div>
              </div>
            )}

            {/* Error Rate */}
            {metrics.errorRate !== undefined && (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <AlertTriangle className="h-3 w-3 mr-1 text-gray-400" />
                  <span>Error Rate</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className={metrics.errorRate < 5 ? 'text-green-600' : 'text-red-600'}>
                    {metrics.errorRate.toFixed(1)}%
                  </span>
                  {metrics.errorRate < 5 ? 
                    <TrendingDown className="h-3 w-3 text-green-600" /> : 
                    <TrendingUp className="h-3 w-3 text-red-600" />
                  }
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="border-t pt-3 space-y-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs"
              onClick={() => webVitalsMonitor.reportVitals()}
            >
              Report Vitals
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs"
              onClick={() => window.location.reload()}
            >
              Clear Cache & Reload
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Performance alert component
interface PerformanceAlertProps {
  threshold: number
  current: number
  metric: string
}

export function PerformanceAlert({ threshold, current, metric }: PerformanceAlertProps) {
  const [dismissed, setDismissed] = useState(false)

  if (current <= threshold || dismissed) return null

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-red-800">Performance Warning</h4>
                <p className="text-xs text-red-600 mt-1">
                  {metric} is {current > 1000 ? `${(current / 1000).toFixed(1)}s` : `${Math.round(current)}ms`}, 
                  exceeding the {threshold > 1000 ? `${threshold / 1000}s` : `${threshold}ms`} threshold.
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDismissed(true)}
              className="h-6 w-6 p-0 text-red-600 hover:text-red-800"
            >
              ×
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// React hook for performance monitoring
export function usePerformanceMonitoring() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({})
  const [alerts, setAlerts] = useState<Array<{ metric: string; value: number; threshold: number }>>([])

  useEffect(() => {
    const updateMetrics = () => {
      const vitals = webVitalsMonitor.getVitals()
      const cacheStats = cache.getStats()
      
      setMetrics({
        ...vitals,
        cacheHitRate: cacheStats.hitRate
      })

      // Check for performance alerts
      const newAlerts: Array<{ metric: string; value: number; threshold: number }> = []
      
      if (vitals.lcp && vitals.lcp > 2500) {
        newAlerts.push({ metric: 'LCP', value: vitals.lcp, threshold: 2500 })
      }
      
      if (vitals.fid && vitals.fid > 100) {
        newAlerts.push({ metric: 'FID', value: vitals.fid, threshold: 100 })
      }

      setAlerts(newAlerts)
    }

    updateMetrics()
    const interval = setInterval(updateMetrics, 5000)

    return () => clearInterval(interval)
  }, [])

  return {
    metrics,
    alerts,
    reportVitals: () => webVitalsMonitor.reportVitals()
  }
}

export default PerformanceMonitor