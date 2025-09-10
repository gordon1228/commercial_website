import { z } from 'zod'
import DOMPurify from 'isomorphic-dompurify'

// Base validation schemas
const emailSchema = z.string().email('Invalid email address').max(254)
const phoneSchema = z.string().regex(/^[\+]?[1-9][\d]{0,15}$/, 'Invalid phone number')
const urlSchema = z.string().url('Invalid URL').max(2048)
const nameSchema = z.string().min(1, 'Name is required').max(100, 'Name too long').regex(/^[a-zA-Z\s\-'\.]+$/, 'Invalid name format')
const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password too long')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
    'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')

// File validation
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']

export const fileSchema = z.object({
  name: z.string().max(255, 'Filename too long'),
  size: z.number().max(MAX_FILE_SIZE, 'File size exceeds 10MB limit'),
  type: z.string().refine(
    (type) => [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOCUMENT_TYPES].includes(type),
    'File type not allowed'
  )
})

// Vehicle validation schemas
export const vehicleCreateSchema = z.object({
  name: nameSchema,
  model: z.string().min(1, 'Model is required').max(50),
  year: z.number().int().min(1900).max(new Date().getFullYear() + 2),
  price: z.number().positive('Price must be positive').max(10000000),
  description: z.string().max(2000, 'Description too long').optional(),
  specifications: z.record(z.string().max(500)).optional(),
  features: z.array(z.string().max(100)).max(50).optional(),
  category: z.enum(['truck', 'van', 'bus', 'pickup', 'other']),
  status: z.enum(['active', 'inactive', 'sold', 'maintenance']).default('active'),
  images: z.array(fileSchema).max(10, 'Maximum 10 images allowed').optional()
})

export const vehicleUpdateSchema = vehicleCreateSchema.partial().extend({
  id: z.string().uuid('Invalid vehicle ID')
})

// Contact form validation
export const contactFormSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema.optional(),
  subject: z.string().min(1, 'Subject is required').max(200),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000),
  company: z.string().max(100).optional(),
  preferredContact: z.enum(['email', 'phone', 'both']).default('email')
})

// User authentication schemas
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required').max(128)
})

export const registerSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
})

// Company info schemas
export const companyInfoSchema = z.object({
  name: nameSchema,
  description: z.string().max(1000).optional(),
  address: z.string().max(500).optional(),
  phone: phoneSchema.optional(),
  email: emailSchema.optional(),
  website: urlSchema.optional(),
  businessHours: z.string().max(200).optional(),
  socialMedia: z.object({
    facebook: urlSchema.optional(),
    twitter: urlSchema.optional(),
    linkedin: urlSchema.optional(),
    instagram: urlSchema.optional()
  }).optional()
})

// Homepage content schemas
export const homepageContentSchema = z.object({
  heroTitle: z.string().min(1, 'Hero title is required').max(100),
  heroSubtitle: z.string().max(200).optional(),
  heroDescription: z.string().max(500).optional(),
  featuredVehicles: z.array(z.string().uuid()).max(6).optional(),
  testimonials: z.array(z.object({
    name: nameSchema,
    company: z.string().max(100).optional(),
    content: z.string().min(1).max(500),
    rating: z.number().int().min(1).max(5)
  })).max(10).optional(),
  features: z.array(z.object({
    title: z.string().min(1).max(50),
    description: z.string().max(200),
    icon: z.string().max(50).optional()
  })).max(10).optional()
})

// Team member schema
export const teamMemberSchema = z.object({
  name: nameSchema,
  position: z.string().min(1, 'Position is required').max(100),
  bio: z.string().max(500).optional(),
  email: emailSchema.optional(),
  phone: phoneSchema.optional(),
  image: fileSchema.optional(),
  socialMedia: z.object({
    linkedin: urlSchema.optional(),
    twitter: urlSchema.optional()
  }).optional()
})

// Admin settings schema
export const adminSettingsSchema = z.object({
  siteName: z.string().min(1).max(100),
  siteDescription: z.string().max(500).optional(),
  maintenanceMode: z.boolean().default(false),
  allowRegistration: z.boolean().default(false),
  maxUploadSize: z.number().int().positive().max(MAX_FILE_SIZE),
  emailNotifications: z.boolean().default(true),
  backupFrequency: z.enum(['daily', 'weekly', 'monthly']).default('weekly')
})

// Sanitization functions
export function sanitizeHtml(input: string): string {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: []
  })
}

export function sanitizeString(input: string): string {
  return input.trim().replace(/[<>\"'&]/g, (char) => {
    const htmlEntities: Record<string, string> = {
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '&': '&amp;'
    }
    return htmlEntities[char] || char
  })
}

export function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^_+|_+$/g, '')
    .substring(0, 255)
}

// Validation middleware helper
export function validateInput<T>(schema: z.ZodSchema<T>, input: unknown): { success: true; data: T } | { success: false; errors: string[] } {
  try {
    const result = schema.parse(input)
    return { success: true, data: result }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
      }
    }
    return {
      success: false,
      errors: ['Validation failed']
    }
  }
}

// SQL injection prevention helpers
export function escapeSqlString(input: string): string {
  return input.replace(/'/g, "''")
}

export function validateSqlIdentifier(identifier: string): boolean {
  return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(identifier)
}

// XSS prevention
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }
  return text.replace(/[&<>"']/g, (m) => map[m])
}

// CSRF token validation
export function generateCSRFToken(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('')
}

export function validateCSRFToken(token: string, sessionToken: string): boolean {
  return token === sessionToken && token.length === 64 && /^[a-f0-9]{64}$/.test(token)
}

// Rate limiting helpers
export interface RateLimitConfig {
  windowMs: number
  maxRequests: number
  skipSuccessfulRequests?: boolean
  skipFailedRequests?: boolean
}

export function createRateLimitKey(identifier: string, endpoint: string): string {
  return `ratelimit:${identifier}:${endpoint}`
}

// Input length validation
export function validateInputLength(input: string, maxLength: number): boolean {
  return Buffer.byteLength(input, 'utf8') <= maxLength
}

// Email domain validation
export function validateEmailDomain(email: string, allowedDomains?: string[]): boolean {
  if (!allowedDomains || allowedDomains.length === 0) return true
  
  const domain = email.split('@')[1]?.toLowerCase()
  return allowedDomains.includes(domain)
}

// Password strength checker
export function checkPasswordStrength(password: string): {
  score: number
  feedback: string[]
} {
  const feedback: string[] = []
  let score = 0

  if (password.length >= 8) score += 1
  else feedback.push('Use at least 8 characters')

  if (password.length >= 12) score += 1
  else feedback.push('Consider using 12+ characters')

  if (/[a-z]/.test(password)) score += 1
  else feedback.push('Add lowercase letters')

  if (/[A-Z]/.test(password)) score += 1
  else feedback.push('Add uppercase letters')

  if (/\d/.test(password)) score += 1
  else feedback.push('Add numbers')

  if (/[^a-zA-Z\d]/.test(password)) score += 1
  else feedback.push('Add special characters')

  if (!/(.)\1{2,}/.test(password)) score += 1
  else feedback.push('Avoid repeated characters')

  return { score, feedback }
}

// Common validation utilities
export const validation = {
  email: emailSchema,
  phone: phoneSchema,
  url: urlSchema,
  name: nameSchema,
  password: passwordSchema,
  file: fileSchema,
  vehicle: {
    create: vehicleCreateSchema,
    update: vehicleUpdateSchema
  },
  contact: contactFormSchema,
  auth: {
    login: loginSchema,
    register: registerSchema
  },
  company: companyInfoSchema,
  homepage: homepageContentSchema,
  teamMember: teamMemberSchema,
  adminSettings: adminSettingsSchema
}

export const sanitize = {
  html: sanitizeHtml,
  string: sanitizeString,
  fileName: sanitizeFileName,
  escape: escapeHtml
}

export const security = {
  generateCSRFToken,
  validateCSRFToken,
  escapeSqlString,
  validateSqlIdentifier,
  createRateLimitKey,
  validateInputLength,
  validateEmailDomain,
  checkPasswordStrength
}