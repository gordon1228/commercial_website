'use client'

import { useSession } from 'next-auth/react'
import EnhancedAdminDashboard from '@/components/admin/dashboard/enhanced-dashboard'

export default function AdminDashboard() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Let middleware handle authentication and authorization
  if (status === 'unauthenticated' || !session?.user?.role) {
    return null
  }

  // This page is only for ADMIN and MANAGER roles
  if (!['ADMIN', 'MANAGER'].includes(session.user.role)) {
    return null
  }

  return <EnhancedAdminDashboard />
}