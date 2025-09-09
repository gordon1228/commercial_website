import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

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
    const pathname = req.nextUrl.pathname
    const token = req.nextauth.token
    
    console.log('Middleware:', {
      pathname,
      token: token ? 'exists' : 'none',
      role: token?.role,
      timestamp: new Date().toISOString()
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
        const sessionCookie = req.cookies.get('next-auth.session-token')?.value
        
        console.log('Authorization check:', { 
          pathname, 
          hasToken: !!token,
          role: token?.role,
          email: token?.email,
          sessionCookie: sessionCookie ? 'exists' : 'none',
          timestamp: new Date().toISOString()
        })
        
        // Allow all public pages (non-admin, non-protected-api)
        if (!pathname.startsWith('/admin') && !pathname.startsWith('/api/')) {
          return true
        }
        
        // Public API routes that don't require authentication
        const publicApiRoutes = [
          '/api/public/',
          '/api/company-info',
          '/api/company-values',
          '/api/team-members',
          '/api/certifications',
          '/api/contact-info',
          '/api/categories', // Allow categories for vehicle filters
          '/api/vehicles', // Allow vehicles listing for public
          '/api/vehicles/slug/',
          '/api/inquiries/vehicle',
          '/api/auth/'
        ]
        
        if (pathname.startsWith('/api/') && publicApiRoutes.some(route => pathname.startsWith(route))) {
          console.log('Public API access granted to:', pathname)
          return true
        }
        
        // Admin routes require authentication
        if (pathname.startsWith('/admin')) {
          // Allow access to login page without authentication
          if (pathname === '/admin/login') {
            return true
          }
          
          // For all other admin routes, require authentication
          if (!token) {
            // Check if there's a session cookie but no token yet (timing issue)
            if (sessionCookie) {
              console.log('Session cookie exists but no token yet, allowing access (timing):', pathname)
              return true // Temporary allow while session is being processed
            }
            console.log('No token found, denying access to:', pathname)
            return false
          }
          
          // Check role-based access
          // ADMIN and MANAGER: full access to all admin routes
          // USER: only access to inquiries page
          if (token.role === 'ADMIN' || token.role === 'MANAGER') {
            console.log('Admin/Manager access granted to:', pathname)
            return true
          }
          
          if (token.role === 'USER' && (pathname === '/admin/inquiries' || pathname.startsWith('/admin/profile'))) {
            console.log('User access granted to:', pathname)
            return true
          }
          
          console.log('Access denied for role:', token.role, 'to:', pathname)
          return false
        }
        
        // All other API routes require authentication
        if (pathname.startsWith('/api/')) {
          if (!token) {
            console.log('No token found, denying API access to:', pathname)
            return false
          }
          return true
        }
        
        // Default allow for any other routes
        return true
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
     * Apply middleware to admin routes and API routes that need protection
     * Exclude static files, images, favicon, and public assets
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'
  ],
}
