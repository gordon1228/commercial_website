'use client'

import { useState, useEffect, useRef, ReactNode, ComponentType } from 'react'
import { LazyContentLoader } from '@/lib/code-splitting'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Skeleton } from '@/components/ui/skeleton'

interface LazySectionProps {
  children: ReactNode
  fallback?: ReactNode
  className?: string
  rootMargin?: string
  threshold?: number
  once?: boolean // Only trigger once
  fadeIn?: boolean // Fade in animation
  onVisible?: () => void
  onHidden?: () => void
}

/**
 * Lazy loading wrapper for content sections
 */
export function LazySection({
  children,
  fallback = <Skeleton className="w-full h-64" />,
  className = '',
  rootMargin = '50px 0px',
  threshold = 0.1,
  once = true,
  fadeIn = true,
  onVisible,
  onHidden
}: LazySectionProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [hasBeenVisible, setHasBeenVisible] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    if (!sectionRef.current) return

    const observer = LazyContentLoader.createContentLoader({
      rootMargin,
      threshold,
      onVisible: (element) => {
        setIsVisible(true)
        if (!hasBeenVisible) {
          setHasBeenVisible(true)
        }
        onVisible?.()
        
        // If once is true, stop observing after first visibility
        if (once && observerRef.current) {
          observerRef.current.unobserve(element)
        }
      },
      onHidden: (element) => {
        if (!once) {
          setIsVisible(false)
        }
        onHidden?.()
      }
    })

    observerRef.current = observer
    observer.observe(sectionRef.current)

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [rootMargin, threshold, once, onVisible, onHidden, hasBeenVisible])

  const shouldShowContent = once ? hasBeenVisible : isVisible
  const animationClass = fadeIn ? 'transition-opacity duration-500' : ''
  const opacityClass = shouldShowContent ? 'opacity-100' : 'opacity-0'

  return (
    <div
      ref={sectionRef}
      className={`${animationClass} ${fadeIn ? opacityClass : ''} ${className}`}
    >
      {shouldShowContent ? children : fallback}
    </div>
  )
}

/**
 * Lazy loading wrapper for heavy components
 */
interface LazyComponentProps {
  component: ComponentType<any>
  componentProps?: any
  fallback?: ReactNode
  className?: string
  errorFallback?: ReactNode
  retryButton?: boolean
}

export function LazyComponent({
  component: Component,
  componentProps = {},
  fallback = <LoadingSpinner size="lg" text="Loading..." />,
  errorFallback,
  className = '',
  retryButton = true
}: LazyComponentProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    // Simulate component loading (in real scenario, this would be dynamic import)
    const timer = setTimeout(() => {
      try {
        setIsLoading(false)
        setError(null)
      } catch (err) {
        setError(err as Error)
        setIsLoading(false)
      }
    }, 100)

    return () => clearTimeout(timer)
  }, [retryCount])

  const handleRetry = () => {
    setError(null)
    setIsLoading(true)
    setRetryCount(prev => prev + 1)
  }

  if (isLoading) {
    return <div className={className}>{fallback}</div>
  }

  if (error) {
    const defaultErrorFallback = (
      <div className={`flex flex-col items-center justify-center p-8 text-center ${className}`}>
        <div className="text-red-500 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Failed to load component
        </h3>
        <p className="text-gray-600 mb-4">
          {error.message || 'An unexpected error occurred'}
        </p>
        {retryButton && (
          <button
            onClick={handleRetry}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Try Again
          </button>
        )}
      </div>
    )

    return errorFallback || defaultErrorFallback
  }

  return (
    <div className={className}>
      <Component {...componentProps} />
    </div>
  )
}

/**
 * Progressive loading for image galleries or lists
 */
interface ProgressiveLoaderProps {
  items: any[]
  renderItem: (item: any, index: number) => ReactNode
  itemsPerBatch?: number
  loadDelay?: number
  className?: string
  showLoadMore?: boolean
  loadMoreText?: string
}

export function ProgressiveLoader({
  items,
  renderItem,
  itemsPerBatch = 6,
  loadDelay = 500,
  className = '',
  showLoadMore = true,
  loadMoreText = 'Load More'
}: ProgressiveLoaderProps) {
  const [visibleItems, setVisibleItems] = useState(itemsPerBatch)
  const [isLoading, setIsLoading] = useState(false)

  const loadMore = async () => {
    setIsLoading(true)
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, loadDelay))
    
    setVisibleItems(prev => Math.min(prev + itemsPerBatch, items.length))
    setIsLoading(false)
  }

  const hasMore = visibleItems < items.length

  return (
    <div className={className}>
      <div className="space-y-4">
        {items.slice(0, visibleItems).map((item, index) => (
          <LazySection key={index} once={true}>
            {renderItem(item, index)}
          </LazySection>
        ))}
      </div>

      {hasMore && showLoadMore && (
        <div className="flex justify-center mt-8">
          <button
            onClick={loadMore}
            disabled={isLoading}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <LoadingSpinner size="sm" />
                <span>Loading...</span>
              </div>
            ) : (
              loadMoreText
            )}
          </button>
        </div>
      )}

      {!hasMore && items.length > itemsPerBatch && (
        <div className="text-center mt-8 text-gray-600">
          <p>All {items.length} items loaded</p>
        </div>
      )}
    </div>
  )
}

/**
 * Viewport-based lazy loading trigger
 */
interface ViewportTriggerProps {
  onEnterViewport: () => void
  onExitViewport?: () => void
  threshold?: number
  rootMargin?: string
  triggerOnce?: boolean
  children?: ReactNode
  className?: string
}

export function ViewportTrigger({
  onEnterViewport,
  onExitViewport,
  threshold = 0.1,
  rootMargin = '0px',
  triggerOnce = true,
  children,
  className = ''
}: ViewportTriggerProps) {
  const elementRef = useRef<HTMLDivElement>(null)
  const [hasTriggered, setHasTriggered] = useState(false)

  useEffect(() => {
    if (!elementRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            if (!hasTriggered || !triggerOnce) {
              onEnterViewport()
              if (triggerOnce) {
                setHasTriggered(true)
              }
            }
          } else if (onExitViewport && !triggerOnce) {
            onExitViewport()
          }
        })
      },
      { threshold, rootMargin }
    )

    observer.observe(elementRef.current)

    return () => observer.disconnect()
  }, [onEnterViewport, onExitViewport, threshold, rootMargin, triggerOnce, hasTriggered])

  return (
    <div ref={elementRef} className={className}>
      {children}
    </div>
  )
}