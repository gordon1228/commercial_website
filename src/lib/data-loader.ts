import { useState, useEffect } from 'react'
import type { DataLoaderResult } from '@/types/data-config'

// Simple in-memory cache with TTL (Time To Live)
interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

class DataCache {
  private cache = new Map<string, CacheEntry<unknown>>()
  private defaultTTL = 5 * 60 * 1000 // 5 minutes

  set<T>(key: string, data: T, ttl?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL
    })
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    const now = Date.now()
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }

    return entry.data as T
  }

  clear(): void {
    this.cache.clear()
  }

  delete(key: string): void {
    this.cache.delete(key)
  }
}

// Global cache instance
const dataCache = new DataCache()

// Data loader function
export async function loadJsonData<T>(path: string): Promise<T> {
  const cacheKey = `json-data-${path}`
  
  // Check cache first
  const cached = dataCache.get<T>(cacheKey)
  if (cached) {
    return cached
  }

  try {
    // In Next.js, we need to import JSON files dynamically in the browser
    let data: T

    if (typeof window === 'undefined') {
      // Server-side: use dynamic import
      const importedModule = await import(`@/data/${path}`)
      data = importedModule.default
    } else {
      // Client-side: fetch the JSON file from public directory
      // We'll need to move JSON files to public/data/ for client-side access
      const response = await fetch(`/data/${path}`)
      if (!response.ok) {
        throw new Error(`Failed to load data: ${response.statusText}`)
      }
      data = await response.json()
    }

    // Cache the data
    dataCache.set(cacheKey, data)
    return data

  } catch (error) {
    console.error(`Error loading JSON data from ${path}:`, error)
    throw error
  }
}

// React hook for loading JSON data
export function useJsonData<T>(path: string, fallbackData?: T): DataLoaderResult<T> {
  const [state, setState] = useState<DataLoaderResult<T>>({
    data: fallbackData || null,
    error: null,
    loading: true
  })

  useEffect(() => {
    let isMounted = true

    const loadData = async () => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }))
        
        const data = await loadJsonData<T>(path)
        
        if (isMounted) {
          setState({
            data,
            error: null,
            loading: false
          })
        }
      } catch (error) {
        if (isMounted) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error'
          setState({
            data: fallbackData || null,
            error: errorMessage,
            loading: false
          })
        }
      }
    }

    loadData()

    return () => {
      isMounted = false
    }
  }, [path, fallbackData])

  return state
}

// Utility function to preload data (useful for critical data)
export function preloadJsonData<T>(path: string): Promise<T> {
  return loadJsonData<T>(path)
}

// Clear cache function (useful for development/testing)
export function clearDataCache(): void {
  dataCache.clear()
}

// Specific hooks for our data types
export function useVehicleFilters() {
  return useJsonData('vehicle-filters.json')
}

export function useCompanyInfoFallback() {
  return useJsonData('fallback/company-info.json')
}

export function useContactInfoFallback() {
  return useJsonData('fallback/contact-info.json')
}