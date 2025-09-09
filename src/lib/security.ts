// src/lib/security.ts
import { z } from 'zod'

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