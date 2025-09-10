import { NextRequest } from 'next/server'

// In-memory store for development/simple deployments
class MemoryStore {
  private store = new Map<string, { count: number; resetTime: number }>()

  async get(key: string): Promise<{ count: number; resetTime: number } | null> {
    const data = this.store.get(key)
    if (!data || Date.now() > data.resetTime) {
      this.store.delete(key)
      return null
    }
    return data
  }

  async set(key: string, count: number, windowMs: number): Promise<void> {
    this.store.set(key, {
      count,
      resetTime: Date.now() + windowMs
    })
  }

  async increment(key: string, windowMs: number): Promise<{ count: number; resetTime: number }> {
    const existing = await this.get(key)
    if (!existing) {
      const data = { count: 1, resetTime: Date.now() + windowMs }
      this.store.set(key, data)
      return data
    }

    existing.count++
    this.store.set(key, existing)
    return existing
  }

  // Cleanup old entries
  cleanup(): void {
    const now = Date.now()
    for (const [key, data] of this.store.entries()) {
      if (now > data.resetTime) {
        this.store.delete(key)
      }
    }
  }
}

// Redis store for production (optional)
class RedisStore {
  private redis: any

  constructor(redisClient: any) {
    this.redis = redisClient
  }

  async get(key: string): Promise<{ count: number; resetTime: number } | null> {
    try {
      const data = await this.redis.get(key)
      if (!data) return null

      const parsed = JSON.parse(data)
      if (Date.now() > parsed.resetTime) {
        await this.redis.del(key)
        return null
      }
      return parsed
    } catch {
      return null
    }
  }

  async set(key: string, count: number, windowMs: number): Promise<void> {
    const data = { count, resetTime: Date.now() + windowMs }
    await this.redis.setex(key, Math.ceil(windowMs / 1000), JSON.stringify(data))
  }

  async increment(key: string, windowMs: number): Promise<{ count: number; resetTime: number }> {
    const existing = await this.get(key)
    if (!existing) {
      const data = { count: 1, resetTime: Date.now() + windowMs }
      await this.redis.setex(key, Math.ceil(windowMs / 1000), JSON.stringify(data))
      return data
    }

    existing.count++
    await this.redis.setex(key, Math.ceil(windowMs / 1000), JSON.stringify(existing))
    return existing
  }
}

export interface RateLimitOptions {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum number of requests per window
  message?: string // Error message when rate limit is exceeded
  standardHeaders?: boolean // Add standard rate limit headers
  skipSuccessfulRequests?: boolean // Don't count successful requests
  skipFailedRequests?: boolean // Don't count failed requests
  keyGenerator?: (req: NextRequest) => string // Custom key generator
  store?: MemoryStore | RedisStore // Custom store
}

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  resetTime: number
  retryAfter?: number
  message?: string
}

// Default configurations for different endpoints
export const RATE_LIMIT_CONFIGS = {
  // General API endpoints
  api: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
    message: 'Too many requests, please try again later'
  },
  
  // Authentication endpoints
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
    message: 'Too many login attempts, please try again later'
  },
  
  // Contact form
  contact: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3,
    message: 'Too many contact form submissions, please try again later'
  },
  
  // File uploads
  upload: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10,
    message: 'Too many file uploads, please try again later'
  },
  
  // Admin operations
  admin: {
    windowMs: 5 * 60 * 1000, // 5 minutes
    maxRequests: 50,
    message: 'Too many admin requests, please try again later'
  },
  
  // Search endpoints
  search: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 20,
    message: 'Too many search requests, please try again later'
  },
  
  // Password reset
  passwordReset: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3,
    message: 'Too many password reset attempts, please try again later'
  }
} as const

// Global store instance
const globalStore = new MemoryStore()

// Cleanup interval for memory store
setInterval(() => {
  if (globalStore instanceof MemoryStore) {
    globalStore.cleanup()
  }
}, 5 * 60 * 1000) // Cleanup every 5 minutes

// Default key generator
function defaultKeyGenerator(req: NextRequest): string {
  // Try to get real IP from various headers
  const forwarded = req.headers.get('x-forwarded-for')
  const realIp = req.headers.get('x-real-ip')
  const clientIp = req.headers.get('x-client-ip')
  
  let ip = forwarded?.split(',')[0] || realIp || clientIp || 'unknown'
  
  // Remove IPv6 prefix if present
  if (ip.startsWith('::ffff:')) {
    ip = ip.substring(7)
  }
  
  return ip
}

// Main rate limiting function
export async function rateLimit(
  req: NextRequest,
  options: RateLimitOptions
): Promise<RateLimitResult> {
  const {
    windowMs,
    maxRequests,
    message = 'Too many requests',
    keyGenerator = defaultKeyGenerator,
    store = globalStore
  } = options

  const key = keyGenerator(req)
  
  try {
    const result = await store.increment(key, windowMs)
    const remaining = Math.max(0, maxRequests - result.count)
    
    if (result.count > maxRequests) {
      const retryAfter = Math.ceil((result.resetTime - Date.now()) / 1000)
      return {
        success: false,
        limit: maxRequests,
        remaining: 0,
        resetTime: result.resetTime,
        retryAfter,
        message
      }
    }

    return {
      success: true,
      limit: maxRequests,
      remaining,
      resetTime: result.resetTime
    }
  } catch (error) {
    console.error('Rate limiting error:', error)
    // Fail open - allow request if rate limiting fails
    return {
      success: true,
      limit: maxRequests,
      remaining: maxRequests - 1,
      resetTime: Date.now() + windowMs
    }
  }
}

// Middleware helper for rate limiting
export function createRateLimitMiddleware(config: keyof typeof RATE_LIMIT_CONFIGS | RateLimitOptions) {
  const options = typeof config === 'string' ? RATE_LIMIT_CONFIGS[config] : config

  return async (req: NextRequest) => {
    const result = await rateLimit(req, options)
    
    // Create response with rate limit headers
    const response = result.success 
      ? new Response(null, { status: 200 })
      : new Response(JSON.stringify({ error: result.message }), { 
          status: 429,
          headers: { 'Content-Type': 'application/json' }
        })

    // Add rate limit headers
    response.headers.set('X-RateLimit-Limit', result.limit.toString())
    response.headers.set('X-RateLimit-Remaining', result.remaining.toString())
    response.headers.set('X-RateLimit-Reset', result.resetTime.toString())
    
    if (result.retryAfter) {
      response.headers.set('Retry-After', result.retryAfter.toString())
    }

    return { result, response }
  }
}

// Specific rate limiters for different use cases
export const rateLimiters = {
  api: (req: NextRequest) => rateLimit(req, RATE_LIMIT_CONFIGS.api),
  auth: (req: NextRequest) => rateLimit(req, RATE_LIMIT_CONFIGS.auth),
  contact: (req: NextRequest) => rateLimit(req, RATE_LIMIT_CONFIGS.contact),
  upload: (req: NextRequest) => rateLimit(req, RATE_LIMIT_CONFIGS.upload),
  admin: (req: NextRequest) => rateLimit(req, RATE_LIMIT_CONFIGS.admin),
  search: (req: NextRequest) => rateLimit(req, RATE_LIMIT_CONFIGS.search),
  passwordReset: (req: NextRequest) => rateLimit(req, RATE_LIMIT_CONFIGS.passwordReset)
}

// Utility function to add rate limit headers to any response
export function addRateLimitHeaders(
  response: Response,
  result: RateLimitResult
): Response {
  const newResponse = new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers
  })

  newResponse.headers.set('X-RateLimit-Limit', result.limit.toString())
  newResponse.headers.set('X-RateLimit-Remaining', result.remaining.toString())
  newResponse.headers.set('X-RateLimit-Reset', result.resetTime.toString())
  
  if (result.retryAfter) {
    newResponse.headers.set('Retry-After', result.retryAfter.toString())
  }

  return newResponse
}

// Progressive rate limiting based on user behavior
export class ProgressiveRateLimit {
  private suspiciousIPs = new Map<string, number>()

  async checkAndLimit(req: NextRequest): Promise<RateLimitResult> {
    const ip = defaultKeyGenerator(req)
    const suspicionLevel = this.suspiciousIPs.get(ip) || 0

    // Adjust limits based on suspicion level
    let config = RATE_LIMIT_CONFIGS.api
    if (suspicionLevel > 5) {
      config = {
        ...config,
        maxRequests: Math.max(1, config.maxRequests / 4),
        windowMs: config.windowMs * 2
      }
    } else if (suspicionLevel > 2) {
      config = {
        ...config,
        maxRequests: Math.max(5, config.maxRequests / 2)
      }
    }

    const result = await rateLimit(req, config)
    
    // Increase suspicion for rate limited IPs
    if (!result.success) {
      this.suspiciousIPs.set(ip, suspicionLevel + 1)
    } else if (suspicionLevel > 0) {
      // Gradually reduce suspicion for good behavior
      this.suspiciousIPs.set(ip, suspicionLevel - 0.1)
    }

    return result
  }

  // Reset suspicion for an IP
  resetSuspicion(ip: string): void {
    this.suspiciousIPs.delete(ip)
  }

  // Get current suspicion level
  getSuspicionLevel(ip: string): number {
    return this.suspiciousIPs.get(ip) || 0
  }
}

export const progressiveRateLimit = new ProgressiveRateLimit()

// DDoS protection helper
export function isDDoSAttack(req: NextRequest): boolean {
  const userAgent = req.headers.get('user-agent') || ''
  const referer = req.headers.get('referer') || ''
  
  // Check for suspicious patterns
  const suspiciousPatterns = [
    /bot|crawler|spider|scraper/i,
    /automated|script|tool/i,
    /attack|ddos|flood/i
  ]
  
  const hasSuspiciousUserAgent = suspiciousPatterns.some(pattern => 
    pattern.test(userAgent)
  )
  
  // Check for missing common headers
  const hasNormalHeaders = req.headers.get('accept') && 
                          req.headers.get('accept-language')
  
  // Very basic heuristics - in production, use more sophisticated detection
  return hasSuspiciousUserAgent || !hasNormalHeaders
}

// Export store instances for advanced usage
export { MemoryStore, RedisStore, globalStore }