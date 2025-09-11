'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react'
import { usePreview } from '@/contexts/preview-context'
import { STATIC_FALLBACKS, getFallbackPhone, getFallbackEmail } from '@/config/fallbacks'

// interface Category {
//   id: string
//   name: string
//   slug: string
// }

interface ContactInfo {
  salesPhone: string
  servicePhone: string
  financePhone: string
  salesEmail: string
  serviceEmail: string
  supportEmail: string
  address: string
  city: string
  state: string
  postcode: string
  country: string
  directions: string
  mondayToFriday: string
  saturday: string
  sunday: string
  companyDescription?: string
  facebookUrl?: string
  twitterUrl?: string
  instagramUrl?: string
  linkedinUrl?: string
  privacyPolicyUrl?: string
  termsOfServiceUrl?: string
}

export default function Footer() {
  // const [categories, setCategories] = useState<Category[]>([])
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null)
  const { isMobilePreview, isTabletPreview } = usePreview()

  useEffect(() => {
    // const fetchCategories = async () => {
    //   try {
    //     const response = await fetch('/api/categories')
    //     if (response.ok) {
    //       const data = await response.json()
    //       setCategories(data.slice(0, 3)) // Show only first 3 categories in footer
    //     } else {
    //       console.error('Failed to fetch categories')
    //     }
    //   } catch (error) {
    //     console.error('Error fetching categories:', error)
    //   }
    // }

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

    // fetchCategories()
    fetchContactInfo()
  }, [])

  // Get mobile-optimized classes based on preview mode
  const getFooterClasses = () => {
    if (isMobilePreview) {
      return 'grid grid-cols-1 gap-6' // Simplified mobile layout for preview
    }
    if (isTabletPreview) {
      return 'grid grid-cols-1 sm:grid-cols-2 gap-6' // Tablet layout
    }
    return 'grid grid-cols-1 md:grid-cols-4 gap-8' // Standard responsive layout
  }

  return (
    <footer className="bg-black border-t border-secondary/10">
      <div className={`max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 ${
        isMobilePreview ? 'py-8' : 'py-12'
      }`}>
        <div className={getFooterClasses()}>
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-xl font-display font-bold text-white">{STATIC_FALLBACKS.company.name}</h3>
            <p className="text-muted-foreground">
              {contactInfo?.companyDescription || STATIC_FALLBACKS.company.description}
            </p>

            <div className="flex space-x-4">
              {(contactInfo?.facebookUrl || STATIC_FALLBACKS.navigation.socialMedia.facebook) && (
                <a href={contactInfo?.facebookUrl || STATIC_FALLBACKS.navigation.socialMedia.facebook} target="_blank" rel="noopener noreferrer">
                  <Facebook className="h-5 w-5 text-muted-foreground hover:text-accent cursor-pointer transition-colors" />
                </a>
              )}
              {(contactInfo?.twitterUrl || STATIC_FALLBACKS.navigation.socialMedia.twitter) && (
                <a href={contactInfo?.twitterUrl || STATIC_FALLBACKS.navigation.socialMedia.twitter} target="_blank" rel="noopener noreferrer">
                  <Twitter className="h-5 w-5 text-muted-foreground hover:text-accent cursor-pointer transition-colors" />
                </a>
              )}
              {(contactInfo?.instagramUrl || STATIC_FALLBACKS.navigation.socialMedia.instagram) && (
                <a href={contactInfo?.instagramUrl || STATIC_FALLBACKS.navigation.socialMedia.instagram} target="_blank" rel="noopener noreferrer">
                  <Instagram className="h-5 w-5 text-muted-foreground hover:text-accent cursor-pointer transition-colors" />
                </a>
              )}
              {(contactInfo?.linkedinUrl || STATIC_FALLBACKS.navigation.socialMedia.linkedin) && (
                <a href={contactInfo?.linkedinUrl || STATIC_FALLBACKS.navigation.socialMedia.linkedin} target="_blank" rel="noopener noreferrer">
                  <Linkedin className="h-5 w-5 text-muted-foreground hover:text-accent cursor-pointer transition-colors" />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-muted-foreground hover:text-accent transition-colors">
                  Browse Fleet
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
          {/* <div className="space-y-4">
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
          </div> */}

          {/* Empty space to push contact info to the right */}
          <div></div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Contact Info</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-accent" />
                <span className="text-muted-foreground">{contactInfo?.salesPhone || getFallbackPhone('sales')}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-accent" />
                <span className="text-muted-foreground">{contactInfo?.salesEmail || getFallbackEmail('sales')}</span>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="h-4 w-4 text-accent mt-1" />
                <span className="text-muted-foreground">
                  {contactInfo?.address || STATIC_FALLBACKS.contact.address}<br />
                  {contactInfo?.city || STATIC_FALLBACKS.contact.city}, {contactInfo?.state || STATIC_FALLBACKS.contact.state} {contactInfo?.postcode || STATIC_FALLBACKS.contact.postcode}<br />
                  {contactInfo?.country || STATIC_FALLBACKS.contact.country}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className={`${
          isMobilePreview ? 'mt-8 pt-6' : 'mt-12 pt-8'
        } border-t border-secondary/10`}>
          <div className={`${
            isMobilePreview 
              ? 'flex flex-col space-y-4 text-left' 
              : 'flex flex-col sm:flex-row justify-between items-center'
          }`}>
            <p className="text-muted-foreground text-sm">
              © 2025 {STATIC_FALLBACKS.company.name}. All rights reserved.
            </p>
            <div className={`flex space-x-6 ${
              isMobilePreview ? 'mt-0' : 'mt-4 sm:mt-0'
            }`}>
              <Link href={contactInfo?.privacyPolicyUrl || STATIC_FALLBACKS.navigation.legal.privacy} className="text-muted-foreground hover:text-accent text-sm transition-colors">
                Privacy Policy
              </Link>
              <Link href={contactInfo?.termsOfServiceUrl || STATIC_FALLBACKS.navigation.legal.terms} className="text-muted-foreground hover:text-accent text-sm transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}