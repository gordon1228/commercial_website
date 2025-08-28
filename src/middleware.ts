import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const { token } = req.nextauth
    const { pathname } = req.nextUrl

    // Protect admin routes
    if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
      if (!token) {
        return NextResponse.redirect(new URL('/admin/login', req.url))
      }
      
      if (token.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/admin/login', req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl
        
        // Allow access to login page
        if (pathname === '/admin/login') {
          return true
        }
        
        // For admin routes, check if user has admin role
        if (pathname.startsWith('/admin')) {
          return token?.role === 'ADMIN'
        }
        
        return true
      },
    },
  }
)

export const config = {
  matcher: ['/admin/:path*']
}