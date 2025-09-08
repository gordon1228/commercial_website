// src/lib/auth.ts
import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { getAuthUrl } from './vercel-url'
const prisma = new PrismaClient()

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
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email.toLowerCase().trim()
            }
          })

          if (!user) {
            throw new Error('Invalid email or password')
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          )

          if (!isPasswordValid) {
            throw new Error('Invalid email or password')
          }

          return {
            id: user.id,
            email: user.email,
            role: user.role,
          }
        } catch (error) {
          console.error('Auth error:', error)
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
      
      console.log('NextAuth redirect:', { 
        url, 
        baseUrl, 
        actualBaseUrl,
        NEXTAUTH_URL: process.env.NEXTAUTH_URL,
        VERCEL_URL: process.env.VERCEL_URL
      })
      
      // Handle post-login redirects - be more specific
      if (url === '/admin/login' || url.endsWith('/admin/login')) {
        const redirectUrl = `${actualBaseUrl}/admin`
        console.log('Post-login redirect to:', redirectUrl)
        return redirectUrl
      }
      
      // If it's a relative URL, make it absolute using actualBaseUrl
      if (url.startsWith('/')) {
        const redirectUrl = `${actualBaseUrl}${url}`
        console.log('Relative URL redirect to:', redirectUrl)
        return redirectUrl
      }
      
      // For absolute URLs, ensure they match our domain
      try {
        const urlObj = new URL(url)
        const baseUrlObj = new URL(actualBaseUrl)
        
        // If it's the same origin, allow it
        if (urlObj.origin === baseUrlObj.origin) {
          console.log('Same origin redirect allowed:', url)
          return url
        } else {
          console.log('Different origin detected, redirecting to admin:', {
            urlOrigin: urlObj.origin,
            baseOrigin: baseUrlObj.origin
          })
        }
      } catch (e) {
        console.error('URL parsing error:', e)
      }
      
      // Default fallback to admin dashboard
      const fallbackUrl = `${actualBaseUrl}/admin`
      console.log('Fallback redirect to:', fallbackUrl)
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