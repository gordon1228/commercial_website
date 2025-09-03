import { NextResponse } from 'next/server'

export async function GET() {
  const response = NextResponse.json({ message: 'Session cleared' })
  
  // Delete all auth cookies
  response.cookies.delete('next-auth.session-token')
  response.cookies.delete('__Secure-next-auth.session-token')
  response.cookies.delete('next-auth.callback-url')
  response.cookies.delete('next-auth.csrf-token')
  
  // Set them to expire immediately
  const cookieOptions = {
    path: '/',
    expires: new Date(0),
    httpOnly: true,
    sameSite: 'lax' as const,
  }
  
  response.cookies.set('next-auth.session-token', '', cookieOptions)
  response.cookies.set('__Secure-next-auth.session-token', '', cookieOptions)
  
  return response
}