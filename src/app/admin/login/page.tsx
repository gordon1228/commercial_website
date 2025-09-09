'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { signIn, useSession } from 'next-auth/react'
import { Car, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function AdminLoginPage() {
  // const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Get callback URL from query params or default to /admin
  const callbackUrl = searchParams?.get('callbackUrl') || '/admin'

  // If already logged in, redirect based on role
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role) {
      const userRole = session.user.role
      
      console.log('Authentication status changed:', { 
        status, 
        userRole, 
        callbackUrl,
        currentUrl: typeof window !== 'undefined' ? window.location.href : 'undefined',
        isProduction: process.env.NODE_ENV === 'production'
      })
      
      // Only redirect if we're actually on the login page to prevent loops
      if (typeof window !== 'undefined' && window.location.pathname === '/admin/login') {
        let redirectUrl = '/admin'
        
        if (userRole === 'ADMIN' || userRole === 'MANAGER') {
          redirectUrl = callbackUrl
          console.log('Redirecting ADMIN/MANAGER to:', redirectUrl)
        } else if (userRole === 'USER') {
          redirectUrl = '/admin/inquiries'
          console.log('Redirecting USER to inquiries')
        }
        
        // Slight delay to ensure session is properly set in middleware
        setTimeout(() => {
          console.log('Executing redirect to:', redirectUrl)
          window.location.replace(redirectUrl)
        }, 100)
      }
    }
  }, [status, session, callbackUrl])

  // Show error messages from URL params
  useEffect(() => {
    const error = searchParams?.get('error')
    if (error === 'SessionExpired') {
      setError('Your session has expired. Please login again.')
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      console.log('Attempting login with:', { email: formData.email, callbackUrl })
      
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
        callbackUrl: callbackUrl
      })

      console.log('Login result:', result)

      if (result?.error) {
        setError('Invalid email or password')
        setIsLoading(false)
      } else if (result?.ok) {
        // Don't redirect immediately, let the useEffect handle it after session updates
        console.log('Login successful, waiting for session update...')
        // The useEffect above will handle the redirect once session is updated
      } else {
        setError('Login failed. Please try again.')
        setIsLoading(false)
      }
    } catch (error) {
      console.error('Login error:', error)
      setError('An unexpected error occurred. Please try again.')
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (error) setError('') // Clear error when user starts typing
  }

  // Add failsafe redirect timer - must be before any conditional returns
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role) {
      // Only set failsafe if we're on the login page
      if (typeof window !== 'undefined' && window.location.pathname === '/admin/login') {
        // Failsafe: Force redirect after 5 seconds if still showing redirect screen
        const failsafeTimer = setTimeout(() => {
          console.log('Failsafe redirect triggered after 5 seconds')
          const userRole = session.user.role
          let redirectUrl = '/admin'
          
          if (userRole === 'ADMIN' || userRole === 'MANAGER') {
            redirectUrl = callbackUrl
          } else if (userRole === 'USER') {
            redirectUrl = '/admin/inquiries'
          }
          
          window.location.replace(redirectUrl)
        }, 5000)

        return () => clearTimeout(failsafeTimer)
      }
    }
  }, [status, session, callbackUrl])

  // Show loading state while checking session
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  // Don't show login form if already authenticated with valid role
  if (status === 'authenticated' && ['ADMIN', 'MANAGER', 'USER'].includes(session?.user?.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-700 font-medium mb-2">Login Successful!</p>
          <p className="text-gray-600 text-sm">Redirecting you to the admin dashboard...</p>
          <p className="text-gray-500 text-xs mt-4">
            If this takes too long, <button onClick={() => window.location.replace('/admin')} className="text-blue-600 underline">click here</button>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center">
            <div className="flex items-center">
              <Car className="h-12 w-12 text-gray-900" />
              <span className="ml-3 text-3xl font-bold text-gray-900">EliteFleet</span>
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Admin Dashboard
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to access the admin panel
          </p>
        </div>

        {/* Login Form */}
        <Card className="bg-white shadow-lg border border-gray-200">
          <CardHeader>
            <CardTitle className="text-xl text-gray-900 text-center">Sign in to your account</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Alert */}
              {error && (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">
                        {error}
                      </h3>
                    </div>
                  </div>
                </div>
              )}

              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="admin@elitefleet.com"
                  required
                  disabled={isLoading}
                  autoComplete="email"
                />
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="Enter your password"
                    required
                    disabled={isLoading}
                    className="pr-10"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </Button>
            </form>

            {/* Demo Credentials Info */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Demo Credentials:</h4>
              <div className="text-xs text-blue-800 space-y-1">
                <div>Email: admin@elitefleet.com</div>
                <div>Password: admin123</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}