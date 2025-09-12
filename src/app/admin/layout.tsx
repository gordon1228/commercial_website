'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'
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
  Home,
  Phone,
  KeyRound,
  BarChart3,
  MessageCircle,
  Eye,
  Image,
  Cpu,
  Filter,
  Building2,
  Database
} from 'lucide-react'
// Removed data-loader dependency - using static navigation config
type AdminNavigationItem = {
  id: string
  name: string
  href: string
  icon: string
  roles: string[]
}

type AdminNavigationConfig = {
  navigationItems: AdminNavigationItem[]
}

// Icon mapping for dynamic rendering
const iconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
  BarChart3,
  LayoutDashboard,
  Car,
  FolderOpen,
  MessageCircle,
  MessageSquare,
  Users,
  Home,
  Phone,
  Cpu,
  Image,
  Settings,
  Eye,
  Filter,
  Building2,
  Database
}

// Fallback navigation data
const defaultNavigation: AdminNavigationConfig = {
  navigationItems: [
    { id: 'dashboard', name: 'Dashboard', href: '/admin', icon: 'BarChart3', roles: ['ADMIN', 'MANAGER', 'USER'] },
    { id: 'vehicles', name: 'Vehicles', href: '/admin/vehicles', icon: 'Car', roles: ['ADMIN', 'MANAGER'] },
    { id: 'categories', name: 'Categories', href: '/admin/categories', icon: 'FolderOpen', roles: ['ADMIN', 'MANAGER'] },
    { id: 'filters', name: 'Vehicle Filters', href: '/admin/filters', icon: 'Filter', roles: ['ADMIN'] },
    { id: 'inquiries', name: 'Inquiries', href: '/admin/inquiries', icon: 'MessageCircle', roles: ['ADMIN', 'MANAGER', 'USER'] },
    { id: 'users', name: 'Users', href: '/admin/users', icon: 'Users', roles: ['ADMIN', 'MANAGER'] },
    { id: 'homepage', name: 'Homepage', href: '/admin/homepage', icon: 'Home', roles: ['ADMIN', 'MANAGER'] },
    { id: 'about', name: 'About Page', href: '/admin/about', icon: 'Building2', roles: ['ADMIN', 'MANAGER'] },
    { id: 'contact-info', name: 'Contact Info', href: '/admin/contact-info', icon: 'Phone', roles: ['ADMIN', 'MANAGER'] },
    { id: 'technology', name: 'Technology', href: '/admin/technology', icon: 'Cpu', roles: ['ADMIN', 'MANAGER'] },
    { id: 'fallbacks', name: 'Fallback Data', href: '/admin/fallbacks', icon: 'Database', roles: ['ADMIN'] },
    { id: 'media', name: 'Media', href: '/admin/media', icon: 'Image', roles: ['ADMIN', 'MANAGER'] },
    { id: 'settings', name: 'Settings', href: '/admin/settings', icon: 'Settings', roles: ['ADMIN', 'MANAGER'] },
    { id: 'preview', name: 'Preview', href: '/admin/preview', icon: 'Eye', roles: ['ADMIN', 'MANAGER'] }
  ]
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  // Use static navigation configuration
  const navigationConfig = defaultNavigation
  
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

  // Handle role-based page access for USER role only
  useEffect(() => {
    if (status === 'loading' || pathname === '/admin/login') return

    // Handle role-based page access for USER role (redirect to inquiries if accessing restricted pages)
    if (status === 'authenticated') {
      const userRole = session?.user?.role
      if (userRole === 'USER' && pathname !== '/admin/inquiries' && !pathname.startsWith('/admin/profile')) {
        console.log('USER role redirected to inquiries page from:', pathname)
        window.location.href = '/admin/inquiries'
        return
      }
    }
  }, [status, session, pathname])

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

  // Let middleware handle unauthenticated users - don't render anything
  if (status === 'unauthenticated') {
    return null // Middleware will handle redirect
  }

  // Only render for authenticated users with valid roles
  if (!session?.user?.role || !['ADMIN', 'MANAGER', 'USER'].includes(session.user.role)) {
    return null // Invalid role, let middleware handle
  }

  return (
    <>
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
              <span className="text-xl font-bold text-white">EVTL Admin</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-400 hover:text-white md:hidden"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <nav className="mt-8">
            {navigationConfig?.navigationItems
              .filter((item) => {
                // Show different navigation items based on user role
                const userRole = session?.user?.role
                if (!userRole) return false
                return item.roles.includes(userRole)
              })
              .map((item) => {
                const Icon = iconMap[item.icon] || iconMap.LayoutDashboard
                const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
                
                return (
                  <Link
                    key={item.id}
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

          {/* Profile Section - Available to all authenticated users */}
          <div className="mt-8 px-6">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
              Profile
            </div>
            <Link
              href="/admin/profile/password"
              className={`${
                pathname === '/admin/profile/password'
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              } group flex items-center px-3 py-2 text-sm font-medium transition-colors rounded-md`}
              onClick={() => setSidebarOpen(false)}
            >
              <KeyRound className="mr-3 h-4 w-4" />
              Change Password
            </Link>
          </div>

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
        {/* Mobile menu button */}
        <div className="md:hidden p-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-500 hover:text-gray-600"
          >
            <Menu className="h-6 w-6" />
          </button>
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