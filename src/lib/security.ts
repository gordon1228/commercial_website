// src/lib/security.ts
import { z } from 'zod'
import DOMPurify from 'isomorphic-dompurify'

// Input validation schemas
export const validationSchemas = {
  email: z.string().email().toLowerCase().trim().max(255),
  password: z.string().min(8).max(100).regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    'Password must contain uppercase, lowercase, number and special character'
  ),
  createUser: z.object({
    email: z.string().email().toLowerCase().trim().max(255),
    password: z.string().min(8).max(100).regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain uppercase, lowercase, number and special character'
    ),
    role: z.enum(['ADMIN', 'MANAGER', 'USER']).optional()
  }),
  vehicleName: z.string().min(3).max(100).trim(),
  price: z.number().positive().max(10000000),
  phone: z.string().regex(/^[\d\s\-\+\(\)]+$/).max(20).optional(),
  message: z.string().max(1000).trim(),
  slug: z.string().regex(/^[a-z0-9-]+$/).max(100),
  id: z.string().uuid(),
}

// Sanitize HTML content
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href', 'title'],
    ALLOW_DATA_ATTR: false,
  })
}

// Sanitize user input for display
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .trim()
    .slice(0, 1000) // Limit length
}

// SQL injection protection for dynamic queries
export function escapeSqlIdentifier(identifier: string): string {
  // Only allow alphanumeric and underscore
  if (!/^[a-zA-Z0-9_]+$/.test(identifier)) {
    throw new Error('Invalid identifier')
  }
  return identifier
}

// Generate secure random tokens
export function generateSecureToken(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let token = ''
  const randomValues = new Uint8Array(length)
  
  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(randomValues)
  } else {
    // Node.js environment - use require for compatibility
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const crypto = require('crypto')
    crypto.randomFillSync(randomValues)
  }
  
  for (let i = 0; i < length; i++) {
    token += chars[randomValues[i] % chars.length]
  }
  
  return token
}

// CSRF token management
export const csrf = {
  generate(): string {
    const token = generateSecureToken(32)
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('csrf-token', token)
    }
    return token
  },
  
  validate(token: string): boolean {
    if (typeof window === 'undefined') return true // Skip on server
    const storedToken = sessionStorage.getItem('csrf-token')
    return storedToken === token && token.length > 0
  },
  
  getToken(): string | null {
    if (typeof window === 'undefined') return null
    return sessionStorage.getItem('csrf-token')
  }
}

// Rate limiting helper
export class RateLimiter {
  private attempts: Map<string, number[]> = new Map()
  
  constructor(
    private maxAttempts: number = 5,
    private windowMs: number = 15 * 60 * 1000 // 15 minutes
  ) {}
  
  check(identifier: string): boolean {
    const now = Date.now()
    const windowStart = now - this.windowMs
    
    const attempts = this.attempts.get(identifier) || []
    const recentAttempts = attempts.filter(time => time > windowStart)
    
    if (recentAttempts.length >= this.maxAttempts) {
      return false
    }
    
    recentAttempts.push(now)
    this.attempts.set(identifier, recentAttempts)
    
    return true
  }
  
  reset(identifier: string): void {
    this.attempts.delete(identifier)
  }
}

// Password strength checker
export function checkPasswordStrength(password: string): {
  score: number
  feedback: string[]
} {
  let score = 0
  const feedback: string[] = []
  
  if (password.length >= 8) score += 1
  else feedback.push('Use at least 8 characters')
  
  if (password.length >= 12) score += 1
  
  if (/[a-z]/.test(password)) score += 1
  else feedback.push('Include lowercase letters')
  
  if (/[A-Z]/.test(password)) score += 1
  else feedback.push('Include uppercase letters')
  
  if (/\d/.test(password)) score += 1
  else feedback.push('Include numbers')
  
  if (/[@$!%*?&]/.test(password)) score += 1
  else feedback.push('Include special characters')
  
  // Check for common patterns
  if (/(.)\1{2,}/.test(password)) {
    score -= 1
    feedback.push('Avoid repeating characters')
  }
  
  if (/^(password|12345|qwerty)/i.test(password)) {
    score = 0
    feedback.push('Avoid common passwords')
  }
  
  return {
    score: Math.max(0, Math.min(5, score)),
    feedback
  }
}

// XSS prevention for dynamic content
export function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  }
  return text.replace(/[&<>"'/]/g, (char) => map[char])
}

// File upload validation
export function validateFileUpload(file: File, options: {
  maxSize?: number // in bytes
  allowedTypes?: string[]
  allowedExtensions?: string[]
} = {}): { valid: boolean; error?: string } {
  const {
    maxSize = 10 * 1024 * 1024, // 10MB default
    allowedTypes = ['image/jpeg', 'image/png', 'image/webp'],
    allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp']
  } = options
  
  // Check file size
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size exceeds ${maxSize / 1024 / 1024}MB limit`
    }
  }
  
  // Check MIME type
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type'
    }
  }
  
  // Check file extension
  const extension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'))
  if (!allowedExtensions.includes(extension)) {
    return {
      valid: false,
      error: 'Invalid file extension'
    }
  }
  
  // Additional security checks
  if (file.name.includes('..') || file.name.includes('/') || file.name.includes('\\')) {
    return {
      valid: false,
      error: 'Invalid file name'
    }
  }
  
  return { valid: true }
}

// Environment variable validation
export function getEnvVar(key: string, required: boolean = true): string {
  const value = process.env[key]
  
  if (required && !value) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
  
  return value || ''
}

// Secure headers helper
export function getSecureHeaders() {
  return {
    'X-DNS-Prefetch-Control': 'off',
    'X-Frame-Options': 'SAMEORIGIN',
    'X-Content-Type-Options': 'nosniff',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Content-Security-Policy': `
      default-src 'self';
      script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com;
      style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
      font-src 'self' https://fonts.gstatic.com;
      img-src 'self' data: blob: https:;
      connect-src 'self';
      frame-src 'none';
      object-src 'none';
      base-uri 'self';
      form-action 'self';
      upgrade-insecure-requests;
    `.replace(/\s+/g, ' ').trim()
  }
}