// Advanced pagination utilities for better performance and user experience
import type { PaginationInfo } from '@/types/vehicle'

// Cursor-based pagination for infinite scroll scenarios
export interface CursorPaginationParams {
  cursor?: string
  limit?: number
  direction?: 'forward' | 'backward'
}

export interface CursorPaginationResult<T> {
  items: T[]
  hasMore: boolean
  hasPrevious: boolean
  nextCursor?: string
  previousCursor?: string
  totalCount?: number
}

// Traditional offset-based pagination
export interface OffsetPaginationParams {
  page?: number
  limit?: number
}

export interface OffsetPaginationResult<T> {
  items: T[]
  pagination: PaginationInfo & {
    hasNext: boolean
    hasPrevious: boolean
    totalPages: number
  }
}

/**
 * Enhanced pagination utilities for better performance
 */
export class PaginationHelper {
  /**
   * Calculate offset-based pagination metadata
   */
  static calculateOffsetPagination(
    page: number,
    limit: number,
    totalCount: number
  ): PaginationInfo & { hasNext: boolean; hasPrevious: boolean; totalPages: number } {
    const totalPages = Math.ceil(totalCount / limit)
    const hasNext = page < totalPages
    const hasPrevious = page > 1

    return {
      page,
      limit,
      total: totalCount,
      pages: totalPages,
      totalPages,
      hasNext,
      hasPrevious
    }
  }

  /**
   * Generate cursor for cursor-based pagination
   */
  static generateCursor(item: any, field: string = 'createdAt'): string {
    const value = item[field]
    if (value instanceof Date) {
      return Buffer.from(value.toISOString()).toString('base64')
    }
    return Buffer.from(String(value)).toString('base64')
  }

  /**
   * Parse cursor for cursor-based pagination
   */
  static parseCursor(cursor: string): string {
    try {
      return Buffer.from(cursor, 'base64').toString('utf-8')
    } catch (error) {
      throw new Error('Invalid cursor format')
    }
  }

  /**
   * Build cursor-based where clause for Prisma
   */
  static buildCursorWhere(
    cursor: string | undefined,
    direction: 'forward' | 'backward' = 'forward',
    field: string = 'createdAt'
  ): any {
    if (!cursor) return {}

    const cursorValue = this.parseCursor(cursor)
    const operator = direction === 'forward' ? 'lt' : 'gt'

    // Handle different field types
    let parsedValue: any = cursorValue
    
    // Try to parse as date
    const dateValue = new Date(cursorValue)
    if (!isNaN(dateValue.getTime())) {
      parsedValue = dateValue
    } else if (!isNaN(Number(cursorValue))) {
      // Try to parse as number
      parsedValue = Number(cursorValue)
    }

    return {
      [field]: {
        [operator]: parsedValue
      }
    }
  }

  /**
   * Validate pagination parameters
   */
  static validatePaginationParams(params: {
    page?: number
    limit?: number
    maxLimit?: number
  }): { page: number; limit: number } {
    const { page = 1, limit = 10, maxLimit = 100 } = params

    // Validate page
    if (page < 1) {
      throw new Error('Page must be greater than 0')
    }

    // Validate limit
    if (limit < 1) {
      throw new Error('Limit must be greater than 0')
    }

    if (limit > maxLimit) {
      throw new Error(`Limit cannot exceed ${maxLimit}`)
    }

    return { page, limit }
  }

  /**
   * Generate pagination links for API responses
   */
  static generatePaginationLinks(
    baseUrl: string,
    currentPage: number,
    totalPages: number,
    queryParams: Record<string, any> = {}
  ) {
    const createUrl = (page: number) => {
      const params = new URLSearchParams({
        ...queryParams,
        page: page.toString()
      })
      return `${baseUrl}?${params.toString()}`
    }

    const links: Record<string, string | null> = {
      first: currentPage > 1 ? createUrl(1) : null,
      previous: currentPage > 1 ? createUrl(currentPage - 1) : null,
      next: currentPage < totalPages ? createUrl(currentPage + 1) : null,
      last: currentPage < totalPages ? createUrl(totalPages) : null
    }

    return links
  }

  /**
   * Calculate optimal limit based on performance considerations
   */
  static getOptimalLimit(requestedLimit?: number, defaultLimit: number = 10): number {
    // Performance considerations:
    // - Small limits (1-10): Good for real-time updates, mobile
    // - Medium limits (10-50): Good balance for most use cases
    // - Large limits (50-100): Good for bulk operations, reduce requests
    
    const limit = requestedLimit || defaultLimit
    
    // Cap at reasonable maximum to prevent performance issues
    return Math.min(limit, 100)
  }

  /**
   * Create search-friendly pagination metadata
   */
  static createSearchPaginationMeta(
    totalResults: number,
    page: number,
    limit: number,
    searchQuery?: string
  ) {
    const pagination = this.calculateOffsetPagination(page, limit, totalResults)
    
    return {
      ...pagination,
      searchQuery,
      resultRange: {
        start: (page - 1) * limit + 1,
        end: Math.min(page * limit, totalResults),
        total: totalResults
      },
      isEmpty: totalResults === 0,
      isFirstPage: page === 1,
      isLastPage: page >= pagination.totalPages
    }
  }
}

/**
 * Optimized pagination for different use cases
 */
export class PaginationStrategies {
  /**
   * For high-frequency queries (like vehicle listings)
   * Uses cursor-based pagination for better performance
   */
  static async cursorBasedPagination<T>(
    queryFn: (params: any) => Promise<T[]>,
    params: CursorPaginationParams & { where?: any; orderBy?: any },
    cursorField: string = 'createdAt'
  ): Promise<CursorPaginationResult<T>> {
    const { cursor, limit = 10, direction = 'forward', where = {}, orderBy } = params
    
    const cursorWhere = PaginationHelper.buildCursorWhere(cursor, direction, cursorField)
    const combinedWhere = { ...where, ...cursorWhere }
    
    // Fetch one extra item to check if there are more
    const items = await queryFn({
      where: combinedWhere,
      orderBy: orderBy || { [cursorField]: direction === 'forward' ? 'desc' : 'asc' },
      take: limit + 1
    })

    const hasMore = items.length > limit
    const resultItems = hasMore ? items.slice(0, limit) : items

    let nextCursor: string | undefined
    let previousCursor: string | undefined

    if (resultItems.length > 0) {
      if (hasMore) {
        nextCursor = PaginationHelper.generateCursor(
          resultItems[resultItems.length - 1],
          cursorField
        )
      }
      
      if (cursor) {
        previousCursor = PaginationHelper.generateCursor(
          resultItems[0],
          cursorField
        )
      }
    }

    return {
      items: resultItems,
      hasMore,
      hasPrevious: !!cursor,
      nextCursor,
      previousCursor
    }
  }

  /**
   * For admin interfaces with page numbers
   * Uses offset-based pagination with count optimization
   */
  static async offsetBasedPagination<T>(
    queryFn: (params: any) => Promise<T[]>,
    countFn: (where: any) => Promise<number>,
    params: OffsetPaginationParams & { where?: any; orderBy?: any }
  ): Promise<OffsetPaginationResult<T>> {
    const validatedParams = PaginationHelper.validatePaginationParams(params)
    const { page, limit } = validatedParams
    const { where = {}, orderBy } = params

    const skip = (page - 1) * limit

    // Execute queries in parallel for better performance
    const [items, totalCount] = await Promise.all([
      queryFn({
        where,
        orderBy,
        skip,
        take: limit
      }),
      countFn(where)
    ])

    const paginationMeta = PaginationHelper.calculateOffsetPagination(page, limit, totalCount)

    return {
      items,
      pagination: paginationMeta
    }
  }

  /**
   * For search results with relevance scoring
   * Includes search metadata and result statistics
   */
  static async searchPagination<T>(
    searchFn: (params: any) => Promise<{ items: T[]; total: number }>,
    params: OffsetPaginationParams & { 
      query: string
      where?: any
      orderBy?: any
      minScore?: number
    }
  ) {
    const validatedParams = PaginationHelper.validatePaginationParams(params)
    const { page, limit } = validatedParams
    const { query, where = {}, orderBy, minScore } = params

    const skip = (page - 1) * limit

    const { items, total } = await searchFn({
      query,
      where,
      orderBy,
      skip,
      take: limit,
      minScore
    })

    const paginationMeta = PaginationHelper.createSearchPaginationMeta(
      total,
      page,
      limit,
      query
    )

    return {
      items,
      pagination: paginationMeta,
      searchMeta: {
        query,
        totalResults: total,
        hasResults: total > 0,
        processingTime: Date.now() // Can be calculated more precisely
      }
    }
  }
}

/**
 * Pagination cache for frequently accessed data
 */
export class PaginationCache {
  private static cache = new Map<string, { data: any; timestamp: number }>()
  private static TTL = 5 * 60 * 1000 // 5 minutes

  static getCacheKey(params: Record<string, any>): string {
    return JSON.stringify(params, Object.keys(params).sort())
  }

  static get<T>(key: string): T | null {
    const cached = this.cache.get(key)
    
    if (!cached) return null
    
    // Check if cache is expired
    if (Date.now() - cached.timestamp > this.TTL) {
      this.cache.delete(key)
      return null
    }
    
    return cached.data
  }

  static set<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    })

    // Clean up old entries periodically
    if (this.cache.size > 1000) {
      this.cleanup()
    }
  }

  static cleanup(): void {
    const now = Date.now()
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.TTL) {
        this.cache.delete(key)
      }
    }
  }

  static clear(): void {
    this.cache.clear()
  }
}