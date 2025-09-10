// Advanced caching system for database queries and API responses
import { prisma } from '@/lib/prisma'

// Cache configuration types
interface CacheConfig {
  ttl: number // Time to live in milliseconds
  maxSize?: number // Maximum number of entries
  tags?: string[] // Cache tags for invalidation
}

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
  tags: string[]
  hits: number
}

/**
 * In-memory cache for database queries and API responses
 * Optimized for high-performance scenarios
 */
export class QueryCache {
  private static cache = new Map<string, CacheEntry<any>>()
  private static tagIndex = new Map<string, Set<string>>() // tag -> cache keys
  private static maxSize = 2000
  
  // Default TTL configurations for different data types
  static readonly TTL = {
    SHORT: 5 * 60 * 1000,      // 5 minutes - for frequently changing data
    MEDIUM: 30 * 60 * 1000,    // 30 minutes - for moderately stable data
    LONG: 2 * 60 * 60 * 1000,  // 2 hours - for stable data
    VERY_LONG: 24 * 60 * 60 * 1000, // 24 hours - for rarely changing data
  } as const

  /**
   * Generate cache key from parameters
   */
  static generateKey(prefix: string, params: Record<string, any> = {}): string {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((result, key) => {
        result[key] = params[key]
        return result
      }, {} as Record<string, any>)
    
    return `${prefix}:${JSON.stringify(sortedParams)}`
  }

  /**
   * Get cached value
   */
  static get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    
    if (!entry) return null
    
    // Check if cache is expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.delete(key)
      return null
    }
    
    // Increment hit counter
    entry.hits++
    
    return entry.data
  }

  /**
   * Set cached value
   */
  static set<T>(key: string, data: T, config: CacheConfig): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: config.ttl,
      tags: config.tags || [],
      hits: 0
    }
    
    this.cache.set(key, entry)
    
    // Update tag index
    entry.tags.forEach(tag => {
      if (!this.tagIndex.has(tag)) {
        this.tagIndex.set(tag, new Set())
      }
      this.tagIndex.get(tag)!.add(key)
    })
    
    // Clean up if cache is getting too large
    if (this.cache.size > this.maxSize) {
      this.cleanup()
    }
  }

  /**
   * Delete cached value
   */
  static delete(key: string): boolean {
    const entry = this.cache.get(key)
    if (!entry) return false
    
    // Remove from tag index
    entry.tags.forEach(tag => {
      const tagSet = this.tagIndex.get(tag)
      if (tagSet) {
        tagSet.delete(key)
        if (tagSet.size === 0) {
          this.tagIndex.delete(tag)
        }
      }
    })
    
    return this.cache.delete(key)
  }

  /**
   * Invalidate cache by tags
   */
  static invalidateByTag(tag: string): number {
    const keys = this.tagIndex.get(tag)
    if (!keys) return 0
    
    let deleted = 0
    for (const key of keys) {
      if (this.delete(key)) deleted++
    }
    
    return deleted
  }

  /**
   * Invalidate multiple tags
   */
  static invalidateByTags(tags: string[]): number {
    let totalDeleted = 0
    tags.forEach(tag => {
      totalDeleted += this.invalidateByTag(tag)
    })
    return totalDeleted
  }

  /**
   * Clean up expired entries and enforce size limits
   */
  static cleanup(): void {
    const now = Date.now()
    const entries = Array.from(this.cache.entries())
    
    // Remove expired entries
    let expiredCount = 0
    for (const [key, entry] of entries) {
      if (now - entry.timestamp > entry.ttl) {
        this.delete(key)
        expiredCount++
      }
    }
    
    // If still too large, remove least recently used entries
    if (this.cache.size > this.maxSize) {
      const sortedByHits = entries
        .filter(([key]) => this.cache.has(key)) // Only existing entries
        .sort(([, a], [, b]) => a.hits - b.hits) // Sort by hit count (LRU)
      
      const toRemove = this.cache.size - Math.floor(this.maxSize * 0.8) // Remove to 80% capacity
      for (let i = 0; i < toRemove && i < sortedByHits.length; i++) {
        this.delete(sortedByHits[i][0])
      }
    }
    
    console.log(`Cache cleanup: removed ${expiredCount} expired entries, cache size: ${this.cache.size}`)
  }

  /**
   * Get cache statistics
   */
  static getStats(): {
    size: number
    maxSize: number
    tagCount: number
    hitRatio: number
    oldestEntry: number | null
    newestEntry: number | null
  } {
    const entries = Array.from(this.cache.values())
    const totalHits = entries.reduce((sum, entry) => sum + entry.hits, 0)
    const totalEntries = entries.length
    
    const timestamps = entries.map(entry => entry.timestamp)
    const oldestEntry = timestamps.length > 0 ? Math.min(...timestamps) : null
    const newestEntry = timestamps.length > 0 ? Math.max(...timestamps) : null
    
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      tagCount: this.tagIndex.size,
      hitRatio: totalEntries > 0 ? totalHits / totalEntries : 0,
      oldestEntry,
      newestEntry
    }
  }

  /**
   * Clear all cache
   */
  static clear(): void {
    this.cache.clear()
    this.tagIndex.clear()
  }
}

/**
 * Cached query wrapper for database operations
 */
export class CachedQueries {
  /**
   * Cached vehicle queries
   */
  static async getVehicles(
    params: Record<string, any> = {},
    ttl: number = QueryCache.TTL.MEDIUM
  ) {
    const cacheKey = QueryCache.generateKey('vehicles', params)
    const cached = QueryCache.get(cacheKey)
    
    if (cached) return cached
    
    // Import the optimized queries
    const { VehicleQueries } = await import('./database-queries')
    const result = await VehicleQueries.getVehicles(params)
    
    QueryCache.set(cacheKey, result, {
      ttl,
      tags: ['vehicles', 'vehicle-listings']
    })
    
    return result
  }

  /**
   * Cached featured vehicles
   */
  static async getFeaturedVehicles(
    limit: number = 10,
    ttl: number = QueryCache.TTL.MEDIUM
  ) {
    const cacheKey = QueryCache.generateKey('featured-vehicles', { limit })
    const cached = QueryCache.get(cacheKey)
    
    if (cached) return cached
    
    const { VehicleQueries } = await import('./database-queries')
    const result = await VehicleQueries.getFeaturedVehicles(limit)
    
    QueryCache.set(cacheKey, result, {
      ttl,
      tags: ['vehicles', 'featured-vehicles']
    })
    
    return result
  }

  /**
   * Cached vehicle by slug
   */
  static async getVehicleBySlug(
    slug: string,
    ttl: number = QueryCache.TTL.LONG
  ) {
    const cacheKey = QueryCache.generateKey('vehicle-by-slug', { slug })
    const cached = QueryCache.get(cacheKey)
    
    if (cached) return cached
    
    const { VehicleQueries } = await import('./database-queries')
    const result = await VehicleQueries.getVehicleBySlug(slug)
    
    if (result) {
      QueryCache.set(cacheKey, result, {
        ttl,
        tags: ['vehicles', `vehicle-${result.id}`]
      })
    }
    
    return result
  }

  /**
   * Cached categories with vehicle counts
   */
  static async getCategories(ttl: number = QueryCache.TTL.LONG) {
    const cacheKey = QueryCache.generateKey('categories')
    const cached = QueryCache.get(cacheKey)
    
    if (cached) return cached
    
    const { CategoryQueries } = await import('./database-queries')
    const result = await CategoryQueries.getActiveCategories()
    
    QueryCache.set(cacheKey, result, {
      ttl,
      tags: ['categories', 'vehicles'] // Depends on both categories and vehicles
    })
    
    return result
  }

  /**
   * Cached filter options
   */
  static async getFilterOptions(ttl: number = QueryCache.TTL.VERY_LONG) {
    const cacheKey = QueryCache.generateKey('filter-options')
    const cached = QueryCache.get(cacheKey)
    
    if (cached) return cached
    
    const { FilterOptionQueries } = await import('./database-queries')
    const result = await FilterOptionQueries.getFilterOptions()
    
    QueryCache.set(cacheKey, result, {
      ttl,
      tags: ['filter-options']
    })
    
    return result
  }

  /**
   * Cached company info
   */
  static async getCompanyInfo(ttl: number = QueryCache.TTL.VERY_LONG) {
    const cacheKey = QueryCache.generateKey('company-info')
    const cached = QueryCache.get(cacheKey)
    
    if (cached) return cached
    
    const result = await prisma.companyInfo.findFirst()
    
    if (result) {
      QueryCache.set(cacheKey, result, {
        ttl,
        tags: ['company-info']
      })
    }
    
    return result
  }

  /**
   * Cached contact info
   */
  static async getContactInfo(ttl: number = QueryCache.TTL.VERY_LONG) {
    const cacheKey = QueryCache.generateKey('contact-info')
    const cached = QueryCache.get(cacheKey)
    
    if (cached) return cached
    
    const result = await prisma.contactInfo.findFirst()
    
    if (result) {
      QueryCache.set(cacheKey, result, {
        ttl,
        tags: ['contact-info']
      })
    }
    
    return result
  }

  /**
   * Cached homepage content
   */
  static async getHomepageContent(ttl: number = QueryCache.TTL.LONG) {
    const cacheKey = QueryCache.generateKey('homepage-content')
    const cached = QueryCache.get(cacheKey)
    
    if (cached) return cached
    
    const result = await prisma.homepageContent.findFirst()
    
    if (result) {
      QueryCache.set(cacheKey, result, {
        ttl,
        tags: ['homepage-content']
      })
    }
    
    return result
  }
}

/**
 * Cache invalidation helpers for different operations
 */
export class CacheInvalidator {
  /**
   * Invalidate caches when a vehicle is created/updated/deleted
   */
  static onVehicleChange(vehicleId?: string): void {
    const tags = ['vehicles', 'vehicle-listings', 'featured-vehicles', 'categories']
    
    if (vehicleId) {
      tags.push(`vehicle-${vehicleId}`)
    }
    
    QueryCache.invalidateByTags(tags)
  }

  /**
   * Invalidate caches when a category is created/updated/deleted
   */
  static onCategoryChange(): void {
    QueryCache.invalidateByTags(['categories', 'vehicles', 'vehicle-listings'])
  }

  /**
   * Invalidate caches when filter options are changed
   */
  static onFilterOptionChange(): void {
    QueryCache.invalidateByTags(['filter-options'])
  }

  /**
   * Invalidate caches when company info is updated
   */
  static onCompanyInfoChange(): void {
    QueryCache.invalidateByTags(['company-info'])
  }

  /**
   * Invalidate caches when contact info is updated
   */
  static onContactInfoChange(): void {
    QueryCache.invalidateByTags(['contact-info'])
  }

  /**
   * Invalidate caches when homepage content is updated
   */
  static onHomepageContentChange(): void {
    QueryCache.invalidateByTags(['homepage-content'])
  }

  /**
   * Clear all caches (use with caution)
   */
  static clearAll(): void {
    QueryCache.clear()
  }
}

/**
 * Automatic cache warming for frequently accessed data
 */
export class CacheWarmer {
  /**
   * Warm up frequently accessed caches
   */
  static async warmupCaches(): Promise<void> {
    console.log('Starting cache warmup...')
    
    try {
      // Warm up critical data in parallel
      await Promise.all([
        CachedQueries.getCategories(),
        CachedQueries.getFeaturedVehicles(10),
        CachedQueries.getFilterOptions(),
        CachedQueries.getCompanyInfo(),
        CachedQueries.getContactInfo(),
        CachedQueries.getHomepageContent(),
        // Warm up first page of vehicles with common filters
        CachedQueries.getVehicles({ page: 1, limit: 10, isAdmin: false }),
      ])
      
      console.log('Cache warmup completed successfully')
    } catch (error) {
      console.error('Cache warmup failed:', error)
    }
  }

  /**
   * Schedule periodic cache warmup
   */
  static startPeriodicWarmup(intervalMinutes: number = 30): NodeJS.Timer {
    const intervalMs = intervalMinutes * 60 * 1000
    
    return setInterval(async () => {
      await this.warmupCaches()
    }, intervalMs)
  }
}

/**
 * Enhanced caching with compression and persistence
 */
export class AdvancedCache {
  private static compressionEnabled = true
  private static persistenceEnabled = typeof window !== 'undefined'

  /**
   * Compress data using simple string compression
   */
  private static compress(data: string): string {
    if (!this.compressionEnabled) return data
    
    // Simple LZ-style compression for repeated patterns
    const dict: Record<string, string> = {}
    let dictSize = 256
    let result = []
    let w = ''

    for (let i = 0; i < data.length; i++) {
      const c = data[i]
      const wc = w + c
      
      if (dict[wc]) {
        w = wc
      } else {
        result.push(dict[w] || w.charCodeAt(0))
        dict[wc] = String.fromCharCode(dictSize++)
        w = c
      }
    }

    if (w) {
      result.push(dict[w] || w.charCodeAt(0))
    }

    return JSON.stringify(result)
  }

  /**
   * Decompress data
   */
  private static decompress(compressed: string): string {
    if (!this.compressionEnabled) return compressed

    try {
      const data = JSON.parse(compressed)
      if (!Array.isArray(data)) return compressed

      // Simple decompression (placeholder - would need proper implementation)
      return data.join('')
    } catch {
      return compressed
    }
  }

  /**
   * Save cache to localStorage for persistence
   */
  static persistCache(): void {
    if (!this.persistenceEnabled) return

    try {
      const cacheData = {
        timestamp: Date.now(),
        data: Object.fromEntries(QueryCache.cache.entries())
      }
      
      const compressed = this.compress(JSON.stringify(cacheData))
      localStorage.setItem('app-cache', compressed)
    } catch (error) {
      console.warn('Failed to persist cache:', error)
    }
  }

  /**
   * Load cache from localStorage
   */
  static loadPersistedCache(): void {
    if (!this.persistenceEnabled) return

    try {
      const compressed = localStorage.getItem('app-cache')
      if (!compressed) return

      const decompressed = this.decompress(compressed)
      const cacheData = JSON.parse(decompressed)
      
      // Check if cache is not too old (1 hour)
      if (Date.now() - cacheData.timestamp > 60 * 60 * 1000) {
        localStorage.removeItem('app-cache')
        return
      }

      // Restore cache entries that are still valid
      for (const [key, entry] of Object.entries(cacheData.data)) {
        const cacheEntry = entry as CacheEntry<any>
        if (Date.now() - cacheEntry.timestamp < cacheEntry.ttl) {
          QueryCache.cache.set(key, cacheEntry)
        }
      }

      console.log('✅ Cache restored from localStorage')
    } catch (error) {
      console.warn('Failed to load persisted cache:', error)
      localStorage.removeItem('app-cache')
    }
  }

  /**
   * Get cache analytics
   */
  static getCacheAnalytics() {
    const stats = QueryCache.getStats()
    const entries = Array.from(QueryCache.cache.entries())
    
    const analytics = {
      ...stats,
      averageEntrySize: entries.length > 0 
        ? entries.reduce((sum, [key, entry]) => sum + JSON.stringify(entry).length, 0) / entries.length 
        : 0,
      mostAccessedEntries: entries
        .sort(([, a], [, b]) => b.hits - a.hits)
        .slice(0, 10)
        .map(([key, entry]) => ({ key, hits: entry.hits })),
      expiringSoon: entries
        .filter(([, entry]) => {
          const timeLeft = entry.ttl - (Date.now() - entry.timestamp)
          return timeLeft > 0 && timeLeft < 5 * 60 * 1000 // Expiring in 5 minutes
        })
        .map(([key]) => key),
      tagDistribution: this.getTagDistribution(entries)
    }

    return analytics
  }

  /**
   * Get distribution of cache entries by tag
   */
  private static getTagDistribution(entries: Array<[string, CacheEntry<any>]>) {
    const distribution: Record<string, number> = {}
    
    entries.forEach(([, entry]) => {
      entry.tags.forEach(tag => {
        distribution[tag] = (distribution[tag] || 0) + 1
      })
    })

    return Object.entries(distribution)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 20)
      .reduce((acc, [tag, count]) => {
        acc[tag] = count
        return acc
      }, {} as Record<string, number>)
  }
}

// Enhanced cache warmer with priority system
export class EnhancedCacheWarmer extends CacheWarmer {
  private static priorityRoutes = [
    { path: '/', priority: 'critical' },
    { path: '/vehicles', priority: 'high' },
    { path: '/about', priority: 'medium' },
    { path: '/contact', priority: 'medium' }
  ]

  /**
   * Warm cache with priority system
   */
  static async warmCacheByPriority(): Promise<void> {
    console.log('🔥 Starting priority-based cache warming...')

    // Critical data first
    const criticalTasks = [
      CachedQueries.getCompanyInfo(),
      CachedQueries.getContactInfo(),
      CachedQueries.getCategories()
    ]

    await Promise.all(criticalTasks)
    console.log('✅ Critical cache warming completed')

    // High priority data
    const highPriorityTasks = [
      CachedQueries.getFeaturedVehicles(10),
      CachedQueries.getVehicles({ page: 1, limit: 12, isAdmin: false }),
      CachedQueries.getFilterOptions()
    ]

    await Promise.all(highPriorityTasks)
    console.log('✅ High priority cache warming completed')

    // Medium priority data (background)
    setTimeout(async () => {
      const mediumPriorityTasks = [
        CachedQueries.getVehicles({ page: 2, limit: 12, isAdmin: false }),
        CachedQueries.getHomepageContent()
      ]

      await Promise.allSettled(mediumPriorityTasks)
      console.log('✅ Medium priority cache warming completed')
    }, 2000)
  }
}

// Start periodic cleanup and warmup in production
if (process.env.NODE_ENV === 'production') {
  // Load persisted cache on startup
  AdvancedCache.loadPersistedCache()

  // Clean up cache every 10 minutes
  setInterval(() => {
    QueryCache.cleanup()
    AdvancedCache.persistCache()
  }, 10 * 60 * 1000)
  
  // Initial cache warmup with priority
  setTimeout(() => {
    EnhancedCacheWarmer.warmCacheByPriority()
  }, 1000)

  // Persist cache before page unload
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
      AdvancedCache.persistCache()
    })
  }
}