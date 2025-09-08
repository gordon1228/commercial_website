// src/lib/vercel-url.ts
// Helper to get the correct base URL for Vercel deployments

export function getBaseUrl(): string {
  // 1. If NEXTAUTH_URL is set (production), use it
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL
  }

  // 2. For Vercel deployments, use VERCEL_URL
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }

  // 3. Development fallback
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3000'
  }

  // 4. Final fallback (should not happen in normal cases)
  return 'https://localhost:3000'
}

export function getAuthUrl(): string {
  const baseUrl = getBaseUrl()
  console.log('Auth URL determined:', baseUrl)
  return baseUrl
}