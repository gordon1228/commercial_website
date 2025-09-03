'use client'

import { usePathname } from 'next/navigation'
import Header from "@/components/header"
import Footer from "@/components/footer"

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdminRoute = pathname.startsWith('/admin')
  
  if (isAdminRoute) {
    // Admin routes don't need header/footer - they have their own layout
    return <>{children}</>
  }
  
  // Public routes get header and footer
  return (
    <>
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </>
  )
}