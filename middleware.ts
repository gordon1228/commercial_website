import { NextRequest, NextResponse } from 'next/server'
import { applySecurityHeaders, enforceHTTPS, getEnvironmentSecurityConfig } from '@/lib/security-headers'
import { rateLimit, RATE_LIMIT_CONFIGS, isDDoSAttack, progressiveRateLimit } from '@/lib/rate-limit'

// Paths that require authentication
const PROTECTED_PATHS = ['/admin']

// Paths that require rate limiting
const RATE_LIMITED_PATHS = {
  '/api/auth': 'auth',
  '/api/contact': 'contact',
  '/api/upload': 'upload',
  '/api/admin': 'admin',
  '/api/search': 'search',
  '/api/auth/reset-password': 'passwordReset'
} as const

// Paths that should be publicly accessible
const PUBLIC_PATHS = ['/', '/about', '/contact', '/vehicles', '/technology']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // 1. Enforce HTTPS in production
  const httpsRedirect = enforceHTTPS(request)
  if (httpsRedirect) {
    return httpsRedirect
  }

  // 2. Check for DDoS patterns
  if (isDDoSAttack(request)) {
    return new NextResponse(JSON.stringify({ 
      error: 'Request blocked',
      code: 'SUSPICIOUS_ACTIVITY'
    }), {
      status: 429,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  // 3. Apply rate limiting
  let rateLimitResult = null
  
  // Check for API routes that need rate limiting
  for (const [path, configKey] of Object.entries(RATE_LIMITED_PATHS)) {
    if (pathname.startsWith(path)) {
      rateLimitResult = await rateLimit(
        request, 
        RATE_LIMIT_CONFIGS[configKey as keyof typeof RATE_LIMIT_CONFIGS]
      )
      break
    }
  }
  
  // Apply progressive rate limiting for general API routes
  if (!rateLimitResult && pathname.startsWith('/api/')) {
    rateLimitResult = await progressiveRateLimit.checkAndLimit(request)
  }
  
  // If rate limited, return error response
  if (rateLimitResult && !rateLimitResult.success) {
    const response = new NextResponse(JSON.stringify({ 
      error: rateLimitResult.message,
      retryAfter: rateLimitResult.retryAfter 
    }), {
      status: 429,
      headers: { 'Content-Type': 'application/json' }
    })
    
    // Add rate limit headers
    response.headers.set('X-RateLimit-Limit', rateLimitResult.limit.toString())
    response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString())
    response.headers.set('X-RateLimit-Reset', rateLimitResult.resetTime.toString())
    if (rateLimitResult.retryAfter) {
      response.headers.set('Retry-After', rateLimitResult.retryAfter.toString())
    }
    
    return response
  }

  // 4. Handle authentication for protected routes
  if (PROTECTED_PATHS.some(path => pathname.startsWith(path))) {
    // Check for authentication
    const token = request.cookies.get('auth-token')
    const sessionId = request.cookies.get('session-id')
    
    if (!token && !sessionId && pathname !== '/admin/login') {
      // Redirect to login page
      const loginUrl = new URL('/admin/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // 5. Handle CORS for API routes
  if (pathname.startsWith('/api/')) {
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      const response = new NextResponse(null, { status: 200 })
      
      // Apply CORS headers
      const origin = request.headers.get('origin')
      const allowedOrigins = process.env.NODE_ENV === 'production' 
        ? [process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com']
        : ['http://localhost:3000', 'http://127.0.0.1:3000']
      
      if (origin && allowedOrigins.includes(origin)) {
        response.headers.set('Access-Control-Allow-Origin', origin)
      }
      
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-CSRF-Token')
      response.headers.set('Access-Control-Allow-Credentials', 'true')
      response.headers.set('Access-Control-Max-Age', '86400')
      
      return response
    }
  }

  // 6. Create response and apply security headers
  const response = NextResponse.next()
  
  // Get environment-specific security configuration
  const securityConfig = getEnvironmentSecurityConfig()
  
  // Apply security headers
  applySecurityHeaders(response, securityConfig)
  
  // Add rate limit headers if we have rate limit info
  if (rateLimitResult) {
    response.headers.set('X-RateLimit-Limit', rateLimitResult.limit.toString())
    response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString())
    response.headers.set('X-RateLimit-Reset', rateLimitResult.resetTime.toString())
  }
  
  // Add CORS headers for API routes
  if (pathname.startsWith('/api/')) {
    const origin = request.headers.get('origin')
    const allowedOrigins = process.env.NODE_ENV === 'production' 
      ? [process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com']
      : ['http://localhost:3000', 'http://127.0.0.1:3000']
    
    if (origin && allowedOrigins.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin)
      response.headers.set('Access-Control-Allow-Credentials', 'true')
    }
  }
  
  // Add security-related headers for enhanced protection
  response.headers.set('X-Request-ID', crypto.randomUUID())
  response.headers.set('X-Robots-Tag', pathname.startsWith('/admin') ? 'noindex, nofollow' : 'index, follow')
  
  return response
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|manifest.json|sw.js|workbox-.*\\.js).*)',
  ],
}