// src/lib/vercel-url.ts
// Helper to get the correct base URL for Vercel deployments

export function getBaseUrl(): string {
  // 1. For Vercel deployments, prioritize VERCEL_URL in production
  if (process.env.NODE_ENV === 'production' && process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }

  // 2. If NEXTAUTH_URL is set, use it (but only if it's not localhost in production)
  if (process.env.NEXTAUTH_URL) {
    // In production, don't use localhost URLs
    if (process.env.NODE_ENV === 'production' && process.env.NEXTAUTH_URL.includes('localhost')) {
      // Fall through to other options
    } else {
      return process.env.NEXTAUTH_URL
    }
  }

  // 3. For Vercel deployments (fallback)
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }

  // 4. Development fallback
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3000'
  }

  // 5. Final fallback (should not happen in normal cases)
  return 'https://localhost:3000'
}

export function getAuthUrl(): string {
  const baseUrl = getBaseUrl()
  console.log('Auth URL determined:', baseUrl)
  return baseUrl
}