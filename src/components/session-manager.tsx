// src/components/session-manager.tsx
'use client'

import { useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { usePathname, useRouter } from 'next/navigation'

const SESSION_CHECK_KEY = 'elitefleet_session_check'
const BROWSER_ID_KEY = 'elitefleet_browser_id'

export function SessionManager() {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    // Only run on admin pages
    if (!pathname.startsWith('/admin') || pathname === '/admin/login') {
      return
    }

    // Generate or get browser instance ID
    let browserId = sessionStorage.getItem(BROWSER_ID_KEY)
    if (!browserId) {
      browserId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      sessionStorage.setItem(BROWSER_ID_KEY, browserId)
    }

    // Mark that we've checked the session in this browser instance
    if (status === 'authenticated') {
      sessionStorage.setItem(SESSION_CHECK_KEY, Date.now().toString())
    }

  }, [session, status, pathname, router])

  // Clear session storage on component unmount (browser close)
  useEffect(() => {
    const handleUnload = () => {
      sessionStorage.removeItem(SESSION_CHECK_KEY)
      sessionStorage.removeItem(BROWSER_ID_KEY)
    }

    window.addEventListener('beforeunload', handleUnload)
    return () => window.removeEventListener('beforeunload', handleUnload)
  }, [])

  return null
}

// Hook to check if session should be valid
export function useSessionValidity() {
  const { data: session, status } = useSession()
  
  const isValidSession = () => {
    if (status !== 'authenticated' || !session) return false
    
    // Check if browser session marker exists
    const sessionCheck = sessionStorage.getItem(SESSION_CHECK_KEY)
    if (!sessionCheck) return false
    
    return true
  }
  
  return {
    isValid: isValidSession(),
    session,
    status
  }
}