import { NextRequest, NextResponse } from 'next/server'

// Content Security Policy configuration
export interface CSPConfig {
  defaultSrc?: string[]
  scriptSrc?: string[]
  styleSrc?: string[]
  imgSrc?: string[]
  fontSrc?: string[]
  connectSrc?: string[]
  mediaSrc?: string[]
  frameSrc?: string[]
  childSrc?: string[]
  workerSrc?: string[]
  manifestSrc?: string[]
  formAction?: string[]
  frameAncestors?: string[]
  baseUri?: string[]
  upgradeInsecureRequests?: boolean
  blockAllMixedContent?: boolean
  reportUri?: string
  reportTo?: string
}

// Default CSP configuration
const DEFAULT_CSP: CSPConfig = {
  defaultSrc: ["'self'"],
  scriptSrc: [
    "'self'",
    "'unsafe-inline'", // Required for Next.js in development
    "'unsafe-eval'", // Required for Next.js development
    "https://cdn.jsdelivr.net",
    "https://unpkg.com",
    "https://www.googletagmanager.com",
    "https://www.google-analytics.com"
  ],
  styleSrc: [
    "'self'",
    "'unsafe-inline'", // Required for styled-components and CSS-in-JS
    "https://fonts.googleapis.com",
    "https://cdn.jsdelivr.net"
  ],
  imgSrc: [
    "'self'",
    "data:",
    "blob:",
    "https://images.unsplash.com",
    "https://res.cloudinary.com",
    "https://www.google-analytics.com",
    "https://www.googletagmanager.com"
  ],
  fontSrc: [
    "'self'",
    "https://fonts.gstatic.com",
    "https://cdn.jsdelivr.net"
  ],
  connectSrc: [
    "'self'",
    "https://api.cloudinary.com",
    "https://www.google-analytics.com",
    "https://www.googletagmanager.com"
  ],
  mediaSrc: ["'self'", "blob:", "data:"],
  frameSrc: [
    "'self'",
    "https://www.youtube.com",
    "https://player.vimeo.com",
    "https://www.google.com" // For reCAPTCHA
  ],
  childSrc: ["'self'"],
  workerSrc: ["'self'", "blob:"],
  manifestSrc: ["'self'"],
  formAction: ["'self'"],
  frameAncestors: ["'none'"],
  baseUri: ["'self'"],
  upgradeInsecureRequests: true,
  blockAllMixedContent: true
}

// Production CSP (more restrictive)
const PRODUCTION_CSP: CSPConfig = {
  ...DEFAULT_CSP,
  scriptSrc: [
    "'self'",
    "https://cdn.jsdelivr.net",
    "https://www.googletagmanager.com",
    "https://www.google-analytics.com"
  ],
  styleSrc: [
    "'self'",
    "https://fonts.googleapis.com",
    "https://cdn.jsdelivr.net"
  ]
}

// Generate CSP header string
export function generateCSPHeader(config: CSPConfig = DEFAULT_CSP): string {
  const directives: string[] = []

  Object.entries(config).forEach(([key, value]) => {
    if (key === 'upgradeInsecureRequests' && value) {
      directives.push('upgrade-insecure-requests')
    } else if (key === 'blockAllMixedContent' && value) {
      directives.push('block-all-mixed-content')
    } else if (key === 'reportUri' && value) {
      directives.push(`report-uri ${value}`)
    } else if (key === 'reportTo' && value) {
      directives.push(`report-to ${value}`)
    } else if (Array.isArray(value) && value.length > 0) {
      const directive = key.replace(/([A-Z])/g, '-$1').toLowerCase()
      directives.push(`${directive} ${value.join(' ')}`)
    }
  })

  return directives.join('; ')
}

// Security headers configuration
export interface SecurityHeadersConfig {
  contentSecurityPolicy?: string | CSPConfig
  strictTransportSecurity?: {
    maxAge: number
    includeSubDomains: boolean
    preload: boolean
  }
  xFrameOptions?: 'DENY' | 'SAMEORIGIN' | string
  xContentTypeOptions?: boolean
  referrerPolicy?: 'no-referrer' | 'no-referrer-when-downgrade' | 'origin' | 'origin-when-cross-origin' | 'same-origin' | 'strict-origin' | 'strict-origin-when-cross-origin' | 'unsafe-url'
  xXSSProtection?: boolean
  permissionsPolicy?: Record<string, string[]>
  crossOriginEmbedderPolicy?: 'unsafe-none' | 'require-corp' | 'credentialless'
  crossOriginOpenerPolicy?: 'unsafe-none' | 'same-origin-allow-popups' | 'same-origin'
  crossOriginResourcePolicy?: 'same-site' | 'same-origin' | 'cross-origin'
}

// Default security headers
const DEFAULT_SECURITY_HEADERS: Required<SecurityHeadersConfig> = {
  contentSecurityPolicy: process.env.NODE_ENV === 'production' ? PRODUCTION_CSP : DEFAULT_CSP,
  strictTransportSecurity: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  },
  xFrameOptions: 'DENY',
  xContentTypeOptions: true,
  referrerPolicy: 'strict-origin-when-cross-origin',
  xXSSProtection: true,
  permissionsPolicy: {
    camera: ['()'],
    microphone: ['()'],
    geolocation: ['()'],
    payment: ['()'],
    usb: ['()'],
    'interest-cohort': ['()'] // Disable FLoC
  },
  crossOriginEmbedderPolicy: 'unsafe-none',
  crossOriginOpenerPolicy: 'same-origin-allow-popups',
  crossOriginResourcePolicy: 'same-origin'
}

// Apply security headers to response
export function applySecurityHeaders(
  response: NextResponse,
  config: SecurityHeadersConfig = DEFAULT_SECURITY_HEADERS
): NextResponse {
  const mergedConfig = { ...DEFAULT_SECURITY_HEADERS, ...config }

  // Content Security Policy
  if (mergedConfig.contentSecurityPolicy) {
    const cspValue = typeof mergedConfig.contentSecurityPolicy === 'string'
      ? mergedConfig.contentSecurityPolicy
      : generateCSPHeader(mergedConfig.contentSecurityPolicy)
    
    response.headers.set('Content-Security-Policy', cspValue)
  }

  // Strict Transport Security
  if (mergedConfig.strictTransportSecurity && process.env.NODE_ENV === 'production') {
    const { maxAge, includeSubDomains, preload } = mergedConfig.strictTransportSecurity
    let hsts = `max-age=${maxAge}`
    if (includeSubDomains) hsts += '; includeSubDomains'
    if (preload) hsts += '; preload'
    response.headers.set('Strict-Transport-Security', hsts)
  }

  // X-Frame-Options
  if (mergedConfig.xFrameOptions) {
    response.headers.set('X-Frame-Options', mergedConfig.xFrameOptions)
  }

  // X-Content-Type-Options
  if (mergedConfig.xContentTypeOptions) {
    response.headers.set('X-Content-Type-Options', 'nosniff')
  }

  // Referrer Policy
  if (mergedConfig.referrerPolicy) {
    response.headers.set('Referrer-Policy', mergedConfig.referrerPolicy)
  }

  // X-XSS-Protection (deprecated but still useful for older browsers)
  if (mergedConfig.xXSSProtection) {
    response.headers.set('X-XSS-Protection', '1; mode=block')
  }

  // Permissions Policy
  if (mergedConfig.permissionsPolicy) {
    const permissions = Object.entries(mergedConfig.permissionsPolicy)
      .map(([feature, allowlist]) => `${feature}=(${allowlist.join(' ')})`)
      .join(', ')
    response.headers.set('Permissions-Policy', permissions)
  }

  // Cross-Origin headers
  if (mergedConfig.crossOriginEmbedderPolicy) {
    response.headers.set('Cross-Origin-Embedder-Policy', mergedConfig.crossOriginEmbedderPolicy)
  }

  if (mergedConfig.crossOriginOpenerPolicy) {
    response.headers.set('Cross-Origin-Opener-Policy', mergedConfig.crossOriginOpenerPolicy)
  }

  if (mergedConfig.crossOriginResourcePolicy) {
    response.headers.set('Cross-Origin-Resource-Policy', mergedConfig.crossOriginResourcePolicy)
  }

  // Additional security headers
  response.headers.set('X-DNS-Prefetch-Control', 'off')
  response.headers.set('X-Download-Options', 'noopen')
  response.headers.set('X-Permitted-Cross-Domain-Policies', 'none')

  return response
}

// Middleware function for applying security headers
export function securityHeadersMiddleware(config?: SecurityHeadersConfig) {
  return (request: NextRequest) => {
    const response = NextResponse.next()
    return applySecurityHeaders(response, config)
  }
}

// HTTPS enforcement
export function enforceHTTPS(request: NextRequest): NextResponse | null {
  // Skip HTTPS enforcement in development
  if (process.env.NODE_ENV !== 'production') {
    return null
  }

  const url = request.nextUrl.clone()
  
  // Check if request is already HTTPS
  if (url.protocol === 'https:') {
    return null
  }

  // Check for forwarded protocol from load balancer/proxy
  const forwardedProto = request.headers.get('x-forwarded-proto')
  if (forwardedProto === 'https') {
    return null
  }

  // Redirect to HTTPS
  url.protocol = 'https:'
  return NextResponse.redirect(url, 301)
}

// Security headers for API routes
export function secureApiResponse(response: Response, config?: SecurityHeadersConfig): Response {
  const nextResponse = new NextResponse(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers
  })

  return applySecurityHeaders(nextResponse, {
    ...config,
    xFrameOptions: 'DENY', // API routes should never be framed
    crossOriginResourcePolicy: 'same-origin' // Restrict cross-origin access
  })
}

// CORS configuration for API routes
export interface CORSConfig {
  allowedOrigins: string[] | '*'
  allowedMethods: string[]
  allowedHeaders: string[]
  exposedHeaders?: string[]
  credentials?: boolean
  maxAge?: number
}

const DEFAULT_CORS_CONFIG: CORSConfig = {
  allowedOrigins: ['http://localhost:3000', 'https://yourdomain.com'], // Update with your domains
  allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-CSRF-Token'],
  exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
  credentials: true,
  maxAge: 86400 // 24 hours
}

export function applyCORSHeaders(
  request: NextRequest,
  response: NextResponse,
  config: CORSConfig = DEFAULT_CORS_CONFIG
): NextResponse {
  const origin = request.headers.get('origin')
  
  // Check if origin is allowed
  const isOriginAllowed = config.allowedOrigins === '*' || 
    (Array.isArray(config.allowedOrigins) && origin && config.allowedOrigins.includes(origin))

  if (isOriginAllowed) {
    response.headers.set('Access-Control-Allow-Origin', origin || '*')
  }

  response.headers.set('Access-Control-Allow-Methods', config.allowedMethods.join(', '))
  response.headers.set('Access-Control-Allow-Headers', config.allowedHeaders.join(', '))

  if (config.exposedHeaders) {
    response.headers.set('Access-Control-Expose-Headers', config.exposedHeaders.join(', '))
  }

  if (config.credentials) {
    response.headers.set('Access-Control-Allow-Credentials', 'true')
  }

  if (config.maxAge) {
    response.headers.set('Access-Control-Max-Age', config.maxAge.toString())
  }

  return response
}

// Utility to create secure response with all headers
export function createSecureResponse(
  body?: BodyInit | null,
  init?: ResponseInit,
  securityConfig?: SecurityHeadersConfig,
  corsConfig?: CORSConfig
): NextResponse {
  const response = new NextResponse(body, init)
  
  // Apply security headers
  applySecurityHeaders(response, securityConfig)
  
  return response
}

// Environment-specific configurations
export const getEnvironmentSecurityConfig = (): SecurityHeadersConfig => {
  if (process.env.NODE_ENV === 'production') {
    return {
      contentSecurityPolicy: PRODUCTION_CSP,
      strictTransportSecurity: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
      }
    }
  }

  return {
    contentSecurityPolicy: DEFAULT_CSP,
    strictTransportSecurity: {
      maxAge: 0,
      includeSubDomains: false,
      preload: false
    }
  }
}

// Export commonly used configurations
export {
  DEFAULT_CSP,
  PRODUCTION_CSP,
  DEFAULT_SECURITY_HEADERS,
  DEFAULT_CORS_CONFIG
}