// src/lib/api-handler.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'
import { RateLimiter, getSecureHeaders } from '@/lib/security'
import type { Session } from 'next-auth'

// Rate limiters for different endpoints
const rateLimiters = {
  auth: new RateLimiter(5, 15 * 60 * 1000), // 5 attempts per 15 minutes
  api: new RateLimiter(100, 60 * 1000), // 100 requests per minute
  upload: new RateLimiter(10, 60 * 1000), // 10 uploads per minute
}

interface ApiHandlerOptions {
  requireAuth?: boolean
  requireAdmin?: boolean
  rateLimit?: keyof typeof rateLimiters
  validateBody?: z.ZodSchema
  validateQuery?: z.ZodSchema
}

export function createApiHandler<T = unknown>(
  handler: (
    req: NextRequest,
    context: {
      params?: Record<string, string | string[]>
      session?: Session | null
      body?: T
      query?: Record<string, string>
    }
  ) => Promise<NextResponse>,
  options: ApiHandlerOptions = {}
) {
  return async (req: NextRequest, context?: { params?: Record<string, string | string[]> }) => {
    try {
      // Apply secure headers
      const headers = getSecureHeaders()
      
      // Rate limiting
      if (options.rateLimit) {
        const ip = req.headers.get('x-forwarded-for') || 
                   req.headers.get('x-real-ip') || 
                   'unknown'
        
        if (!rateLimiters[options.rateLimit].check(ip)) {
          return NextResponse.json(
            { error: 'Too many requests' },
            { status: 429, headers }
          )
        }
      }
      
      // Authentication check - always get session, but only require it if specified
      const session = await getServerSession(authOptions)
      
      if (options.requireAuth || options.requireAdmin) {
        if (!session) {
          return NextResponse.json(
            { error: 'Authentication required' },
            { status: 401, headers }
          )
        }
        
        if (options.requireAdmin && session.user?.role !== 'ADMIN') {
          return NextResponse.json(
            { error: 'Admin access required' },
            { status: 403, headers }
          )
        }
      }
      
      // Parse and validate request body
      let body: T | undefined
      if (options.validateBody && ['POST', 'PUT', 'PATCH'].includes(req.method)) {
        try {
          const rawBody = await req.json()
          body = options.validateBody.parse(rawBody) as T
        } catch (error) {
          if (error instanceof z.ZodError) {
            return NextResponse.json(
              { 
                error: 'Validation error',
                details: error.issues.map(e => ({
                  field: e.path.join('.'),
                  message: e.message
                }))
              },
              { status: 400, headers }
            )
          }
          return NextResponse.json(
            { error: 'Invalid request body' },
            { status: 400, headers }
          )
        }
      }
      
      // Parse and validate query parameters
      let query: Record<string, string> = {}
      if (options.validateQuery) {
        const searchParams = new URL(req.url).searchParams
        const rawQuery: Record<string, string> = {}
        searchParams.forEach((value, key) => {
          rawQuery[key] = value
        })
        
        try {
          query = options.validateQuery.parse(rawQuery) as Record<string, string>
        } catch (error) {
          if (error instanceof z.ZodError) {
            return NextResponse.json(
              { 
                error: 'Invalid query parameters',
                details: error.issues
              },
              { status: 400, headers }
            )
          }
        }
      }
      
      // Call the actual handler
      const response = await handler(req, {
        params: context?.params,
        session,
        body,
        query
      })
      
      // Apply secure headers to response
      Object.entries(headers).forEach(([key, value]) => {
        response.headers.set(key, value)
      })
      
      return response
      
    } catch (error) {
      console.error('API handler error:', error)
      
      // Don't expose internal errors in production
      const isDev = process.env.NODE_ENV === 'development'
      
      return NextResponse.json(
        { 
          error: 'Internal server error',
          ...(isDev && error instanceof Error && { details: error.message })
        },
        { status: 500 }
      )
    }
  }
}

// Helper to create typed API responses
export function apiResponse<T>(
  data: T,
  options: {
    status?: number
    headers?: Record<string, string>
  } = {}
) {
  return NextResponse.json(data, {
    status: options.status || 200,
    headers: {
      ...getSecureHeaders(),
      ...options.headers
    }
  })
}

// Error response helper
export function apiError(
  message: string,
  status: number = 400,
  details?: unknown
) {
  return NextResponse.json(
    {
      error: message,
      ...(details && typeof details === 'object' ? details : { details })
    },
    {
      status,
      headers: getSecureHeaders()
    }
  )
}