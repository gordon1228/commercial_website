// src/components/session-monitor.tsx
'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import { AlertCircle, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ExtendedSession {
  user: {
    id: string
    email: string
    role: string
  }
  expires: string
}

export function SessionMonitor() {
  const { data: session, status, update } = useSession() as { 
    data: ExtendedSession | null, 
    status: 'loading' | 'authenticated' | 'unauthenticated',
    update: () => Promise<ExtendedSession | null>
  }
  // const router = useRouter()
  const pathname = usePathname()
  const [showWarning, setShowWarning] = useState(false)
  const [timeLeft, setTimeLeft] = useState<number | null>(null)

  const handleLogout = useCallback(async () => {
    await signOut({ 
      callbackUrl: '/admin/login',
      redirect: true 
    })
  }, [])

  const extendSession = useCallback(async () => {
    try {
      await update()
      setShowWarning(false)
    } catch (error) {
      console.error('Failed to extend session:', error)
      handleLogout()
    }
  }, [update, handleLogout])

  useEffect(() => {
    if (status !== 'authenticated' || !session?.expires) return

    const checkSession = () => {
      const expiryTime = new Date(session.expires).getTime()
      const now = Date.now()
      const remaining = expiryTime - now

      // Session expired
      if (remaining <= 0) {
        handleLogout()
        return
      }

      // Show warning 5 minutes before expiry
      if (remaining <= 5 * 60 * 1000 && !showWarning) {
        setShowWarning(true)
      }

      // Update time left
      setTimeLeft(Math.floor(remaining / 1000))
    }

    // Check immediately
    checkSession()

    // Check every 30 seconds
    const interval = setInterval(checkSession, 30000)

    return () => clearInterval(interval)
  }, [session, status, showWarning, handleLogout])

  // Only show on admin pages
  if (!pathname.startsWith('/admin') || pathname === '/admin/login') {
    return null
  }

  if (showWarning && timeLeft !== null) {
    const minutes = Math.floor(timeLeft / 60)
    const seconds = timeLeft % 60

    return (
      <div className="fixed bottom-4 right-4 z-50 max-w-md">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg shadow-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-yellow-900 mb-1">
                Session Expiring Soon
              </h4>
              <p className="text-sm text-yellow-800 mb-3">
                Your session will expire in {minutes}:{seconds.toString().padStart(2, '0')}. 
                Would you like to extend it?
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={extendSession}
                  className="bg-yellow-600 hover:bg-yellow-700"
                >
                  Extend Session
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleLogout}
                >
                  Logout Now
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Session activity indicator (optional)
  if (status === 'authenticated' && timeLeft !== null && timeLeft > 5 * 60) {
    const hours = Math.floor(timeLeft / 3600)
    const minutes = Math.floor((timeLeft % 3600) / 60)

    return (
      <div className="fixed bottom-4 left-4 z-40">
        <div className="bg-gray-900/80 backdrop-blur-sm text-white px-3 py-2 rounded-lg text-xs flex items-center gap-2">
          <Clock className="h-3 w-3" />
          <span>Session: {hours}h {minutes}m</span>
        </div>
      </div>
    )
  }

  return null
}

// Auto logout component for inactive users
export function InactivityMonitor({ timeout = 30 * 60 * 1000 }: { timeout?: number }) {
  const { status } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (status !== 'authenticated' || !pathname.startsWith('/admin')) return

    let timer: NodeJS.Timeout

    const resetTimer = () => {
      clearTimeout(timer)
      timer = setTimeout(async () => {
        // Auto logout due to inactivity
        await signOut({ 
          callbackUrl: '/admin/login?reason=inactivity',
          redirect: true 
        })
      }, timeout)
    }

    // Events to track user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']

    // Set up event listeners
    events.forEach(event => {
      document.addEventListener(event, resetTimer, true)
    })

    // Start timer
    resetTimer()

    // Cleanup
    return () => {
      clearTimeout(timer)
      events.forEach(event => {
        document.removeEventListener(event, resetTimer, true)
      })
    }
  }, [status, pathname, timeout, router])

  return null
}