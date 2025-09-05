import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
// import type { NextRequest } from 'next/server'
// import { getSecureHeaders } from '@/lib/security'

// Rate limiting store (in production, use Redis)
const rateLimit = new Map()

function rateLimiter(ip: string, limit: number = 10, windowMs: number = 60000) {
  const now = Date.now()
  const windowStart = now - windowMs
  
  if (!rateLimit.has(ip)) {
    rateLimit.set(ip, [])
  }
  
  const requests = rateLimit.get(ip).filter((timestamp: number) => timestamp > windowStart)
  
  if (requests.length >= limit) {
    return false
  }
  
  requests.push(now)
  rateLimit.set(ip, requests)
  
  return true
}

export default withAuth(
  function middleware(req) {

    console.log('Middleware:', {
      pathname: req.nextUrl.pathname,
      token: req.nextauth.token ? 'exists' : 'none',
      role: req.nextauth.token?.role
    })
    
    const response = NextResponse.next()
    
    // Apply security headers to all responses
    response.headers.set('X-DNS-Prefetch-Control', 'off')
    response.headers.set('X-Frame-Options', 'SAMEORIGIN')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('X-XSS-Protection', '1; mode=block')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
    
    // Add HSTS in production
    if (process.env.NODE_ENV === 'production') {
      response.headers.set(
        'Strict-Transport-Security',
        'max-age=31536000; includeSubDomains'
      )
    }

    // Rate limiting for API routes
    const pathname = req.nextUrl.pathname
    if (pathname.startsWith('/api/')) {
      const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
      
      // Stricter rate limiting for auth endpoints
      if (pathname === '/api/auth/signin') {
        if (!rateLimiter(ip, 5, 15 * 60 * 1000)) { // 5 attempts per 15 minutes
          return new NextResponse('Too many login attempts', { status: 429 })
        }
      } else if (pathname.startsWith('/api/')) {
        if (!rateLimiter(ip, 100, 60000)) { // 100 requests per minute for other APIs
          return new NextResponse('Rate limit exceeded', { status: 429 })
        }
      }
    }

    return response
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl
        
        // Public routes - always allow
        if (!pathname.startsWith('/admin')) {
          return true
        }
        
        // Allow access to login page
        if (pathname === '/admin/login') {
          return true
        }
        
        // For other admin routes, require authentication
        if (!token) {
          return false
        }
        
        // Check role-based access
        // ADMIN and MANAGER: full access to all admin routes
        // USER: only access to inquiries page
        if (token.role === 'ADMIN' || token.role === 'MANAGER') {
          return true
        }
        
        if (token.role === 'USER' && (pathname === '/admin/inquiries' || pathname.startsWith('/admin/profile'))) {
          return true
        }
        
        return false
      },
    },
    pages: {
      signIn: '/admin/login',
    }
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}
