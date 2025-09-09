// src/lib/auth.ts
import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { getAuthUrl } from './vercel-url'

// Configure Prisma with basic settings (timeout handled by wrapper function)
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
})

// Timeout wrapper utility
const withTimeout = <T>(promise: Promise<T>, timeoutMs: number, errorMessage: string): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => 
      setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
    )
  ])
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials')
        }

        try {
          // Wrap the entire auth process with 30-second timeout
          return await withTimeout(
            (async () => {
              // Database query with timeout
              const user = await withTimeout(
                prisma.user.findUnique({
                  where: {
                    email: credentials.email.toLowerCase().trim()
                  }
                }),
                10000, // 10 seconds for DB query
                'Database query timeout'
              )

              if (!user) {
                throw new Error('Invalid email or password')
              }

              // Password comparison with timeout
              const isPasswordValid = await withTimeout(
                bcrypt.compare(credentials.password, user.password),
                5000, // 5 seconds for password comparison
                'Password verification timeout'
              )

              if (!isPasswordValid) {
                throw new Error('Invalid email or password')
              }

              return {
                id: user.id,
                email: user.email,
                role: user.role,
              }
            })(),
            30000, // 30 seconds total timeout
            'Authentication timeout - please try again'
          )
        } catch (error) {
          console.error('Auth error:', error)
          
          // Provide specific error messages for timeouts
          if (error instanceof Error) {
            if (error.message.includes('timeout')) {
              throw new Error('Authentication timed out - please try again')
            }
          }
          
          throw new Error('Authentication failed')
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 8 * 60 * 60, // 8 hours - match JWT token duration
  },
  jwt: {
    maxAge: 8 * 60 * 60, // 8 hours
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 8 * 60 * 60, // 8 hours - match session and JWT duration
      }
    },
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (account && user) {
        return {
          ...token,
          id: user.id,
          email: user.email,
          role: user.role,
        }
      }

      return token
    },
    async session({ session, token }) {
      if (token && token.email) {
        // Check if token has expired (additional safety check)
        const currentTime = Math.floor(Date.now() / 1000)
        if (token.exp && typeof token.exp === 'number' && token.exp < currentTime) {
          console.log('Token expired:', { exp: token.exp, current: currentTime })
          // Return empty session to force re-authentication
          return {
            ...session,
            user: undefined,
            expires: new Date(0).toISOString() // Set expired date
          }
        }

        session.user = {
          ...session.user,
          id: token.id as string,
          email: token.email as string,
          role: token.role as string,
        }
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // Use our smart URL detection that handles Vercel deployments
      const actualBaseUrl = getAuthUrl()
      
      console.log('NextAuth redirect callback:', { 
        url, 
        baseUrl, 
        actualBaseUrl,
        timestamp: new Date().toISOString()
      })
      
      // Prevent redirect loops by avoiding login page redirects
      if (url.includes('/admin/login') || url.endsWith('/login')) {
        const redirectUrl = `${actualBaseUrl}/admin`
        console.log('Preventing login loop, redirecting to:', redirectUrl)
        return redirectUrl
      }
      
      // Handle callback URL from query parameters
      if (url.startsWith('/admin') && url !== '/admin/login') {
        const redirectUrl = `${actualBaseUrl}${url}`
        console.log('Admin page redirect to:', redirectUrl)
        return redirectUrl
      }
      
      // Handle relative URLs
      if (url.startsWith('/')) {
        const redirectUrl = `${actualBaseUrl}${url}`
        console.log('Relative URL redirect to:', redirectUrl)
        return redirectUrl
      }
      
      // For absolute URLs, validate domain
      try {
        const urlObj = new URL(url)
        const baseUrlObj = new URL(actualBaseUrl)
        
        // Allow same origin or Vercel URLs
        if (urlObj.origin === baseUrlObj.origin || 
            (process.env.NODE_ENV === 'production' && url.includes('vercel.app'))) {
          console.log('Same origin redirect allowed:', url)
          return url
        }
      } catch (e) {
        console.error('URL parsing error in redirect:', e)
      }
      
      // Default fallback - always redirect to admin dashboard after login
      const fallbackUrl = `${actualBaseUrl}/admin`
      console.log('Default fallback redirect to:', fallbackUrl)
      return fallbackUrl
    },
  },
  pages: {
    signIn: '/admin/login',
    error: '/admin/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
}