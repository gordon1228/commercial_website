'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  LayoutDashboard, 
  Car, 
  Users, 
  MessageSquare, 
  Settings, 
  LogOut,
  Menu,
  X,
  FolderOpen,
  Shield,
  Clock,
  Home
} from 'lucide-react'
// import { SessionMonitor, InactivityMonitor } from '@/components/session-monitor'

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Homepage', href: '/admin/homepage', icon: Home },
  { name: 'Vehicles', href: '/admin/vehicles', icon: Car },
  { name: 'Categories', href: '/admin/categories', icon: FolderOpen },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Inquiries', href: '/admin/inquiries', icon: MessageSquare },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  // Track user activity for session management
  const [, setLastActivity] = useState(Date.now())

  const handleLogout = async () => {
    try {
      // Clear any local storage
      if (typeof window !== 'undefined') {
        // Clear any sensitive data from localStorage
        localStorage.removeItem('adminPreferences')
        sessionStorage.clear()
      }

      // Sign out
      await signOut({ 
        callbackUrl: '/admin/login',
        redirect: true 
      })
    } catch (error) {
      console.error('Logout error:', error)
      // Force redirect even if signOut fails
      window.location.href = '/admin/login'
    }
  }

  // Check session on mount and route changes
  useEffect(() => {
    if (status === 'loading') return

    // If not authenticated and not on login page, redirect
    if (status === 'unauthenticated' && pathname !== '/admin/login') {
      router.push('/admin/login')
      return
    }

    // If authenticated but no admin role, redirect
    if (status === 'authenticated' && session?.user?.role !== 'ADMIN' && pathname !== '/admin/login') {
      router.push('/admin/login')
      return
    }
  }, [status, session, pathname, router])

  // Track user activity
  useEffect(() => {
    const updateActivity = () => {
      setLastActivity(Date.now())
    }

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart']
    events.forEach(event => {
      window.addEventListener(event, updateActivity)
    })

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, updateActivity)
      })
    }
  }, [])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  if (status === 'unauthenticated' || session?.user?.role !== 'ADMIN') {
    return null // Middleware will handle redirect
  }

  return (
    <>
      {/* Session Monitors - uncomment when session-monitor component is created */}
      {/* <SessionMonitor />
      <InactivityMonitor timeout={30 * 60 * 1000} /> */}

      <div className="min-h-screen flex overflow-hidden bg-gray-100">
        {/* Mobile sidebar backdrop */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 flex z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
          </div>
        )}

        {/* Sidebar */}
        <div className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:inset-0`}>
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-white mr-2" />
              <span className="text-xl font-bold text-white">EliteFleet Admin</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-400 hover:text-white md:hidden"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <nav className="mt-8">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`${
                    isActive
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  } group flex items-center px-6 py-3 text-sm font-medium transition-colors`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          <div className="absolute bottom-0 w-full p-4">
            <div className="bg-gray-800 rounded-lg p-4 mb-4">
              <div className="flex items-center text-gray-300 text-sm mb-2">
                <Clock className="h-4 w-4 mr-2" />
                Session Info
              </div>
              <div className="text-xs text-gray-400">
                User: {session?.user?.email}
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-6 py-3 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white transition-colors rounded-lg"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Logout
            </button>
          </div>
        </div>

      {/* Main content */}
      <div className="flex-1 overflow-hidden">
        {/* Top bar */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-500 hover:text-gray-600 md:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Welcome back, {session?.user?.email || 'Admin'}
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6 pb-20">
            {children}
          </div>
        </main>
      </div>
    </div>
    </>
  )
}