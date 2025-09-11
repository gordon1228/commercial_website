'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { STATIC_FALLBACKS } from '@/config/fallbacks'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-sm border-b border-gray-200">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link href="/" className="text-2xl font-display font-bold text-black">
            {STATIC_FALLBACKS.company.name}
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link href="/" className="text-black hover:text-gray-600 transition-colors">
              Electric Trucks
            </Link>
            <Link href="/technology" className="text-black hover:text-gray-600 transition-colors">
              Technology
            </Link>
            <Link href="/about" className="text-black hover:text-gray-600 transition-colors">
              About
            </Link>
            <Link href="/contact" className="text-black hover:text-gray-600 transition-colors">
              Contact
            </Link>
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost">Browse Fleet</Button>
            </Link>
            <Link href="/contact">
              <Button>Get Quote</Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6 text-black" />
            ) : (
              <Menu className="h-6 w-6 text-black" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col space-y-4">
              <Link 
                href="/" 
                className="text-black hover:text-gray-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Electric Trucks
              </Link>
              <Link 
                href="/technology" 
                className="text-black hover:text-gray-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Technology
              </Link>
              <Link 
                href="/about" 
                className="text-black hover:text-gray-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              <Link 
                href="/contact" 
                className="text-black hover:text-gray-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
              <div className="flex flex-col space-y-2 pt-4">
                <Link href="/">
                  <Button variant="ghost">Browse Fleet</Button>
                </Link>
                <Link href="/contact">
                  <Button>Get Quote</Button>
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}