'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react'

interface Category {
  id: string
  name: string
  slug: string
}

interface ContactInfo {
  salesPhone: string
  servicePhone: string
  financePhone: string
  salesEmail: string
  serviceEmail: string
  supportEmail: string
  address: string
  city: string
  directions: string
  mondayToFriday: string
  saturday: string
  sunday: string
}

export default function Footer() {
  const [categories, setCategories] = useState<Category[]>([])
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories')
        if (response.ok) {
          const data = await response.json()
          setCategories(data.slice(0, 3)) // Show only first 3 categories in footer
        } else {
          console.error('Failed to fetch categories')
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
      }
    }

    const fetchContactInfo = async () => {
      try {
        const response = await fetch('/api/contact-info')
        if (response.ok) {
          const data = await response.json()
          setContactInfo(data)
        } else {
          console.error('Failed to fetch contact info')
        }
      } catch (error) {
        console.error('Error fetching contact info:', error)
      }
    }

    fetchCategories()
    fetchContactInfo()
  }, [])

  return (
    <footer className="bg-black border-t border-secondary/10">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-xl font-display font-bold text-white">EVTL</h3>
            <p className="text-muted-foreground">
              EVTL Sdn. Bhd. is a next-generation mobility startup focusing on Electric Trucks (EV Trucks) and future smart transport solutions.
            </p>

            <div className="flex space-x-4">
              <Facebook className="h-5 w-5 text-muted-foreground hover:text-accent cursor-pointer transition-colors" />
              <Twitter className="h-5 w-5 text-muted-foreground hover:text-accent cursor-pointer transition-colors" />
              <Instagram className="h-5 w-5 text-muted-foreground hover:text-accent cursor-pointer transition-colors" />
              <Linkedin className="h-5 w-5 text-muted-foreground hover:text-accent cursor-pointer transition-colors" />
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/vehicles" className="text-muted-foreground hover:text-accent transition-colors">
                  Browse Trucks
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-accent transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-accent transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Vehicle Categories */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Categories</h4>
            <ul className="space-y-2">
              {categories.length > 0 ? (
                categories.map((category) => (
                  <li key={category.id}>
                    <Link 
                      href={`/vehicles?category=${category.slug}`} 
                      className="text-muted-foreground hover:text-accent transition-colors"
                    >
                      {category.name}
                    </Link>
                  </li>
                ))
              ) : (
                <li className="text-muted-foreground text-sm">
                  No categories available
                </li>
              )}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Contact Info</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-accent" />
                <span className="text-muted-foreground">{contactInfo?.salesPhone || '+1 (555) 123-4567'}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-accent" />
                <span className="text-muted-foreground">{contactInfo?.salesEmail || 'sales@evtl.com'}</span>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="h-4 w-4 text-accent mt-1" />
                <span className="text-muted-foreground">
                  {contactInfo?.address || '123 Business Avenue'}<br />
                  {contactInfo?.city || 'Commercial District, NY 10001'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-secondary/10">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <p className="text-muted-foreground text-sm">
              © 2024 EVTL. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 sm:mt-0">
              <Link href="/privacy" className="text-muted-foreground hover:text-accent text-sm transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-muted-foreground hover:text-accent text-sm transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}