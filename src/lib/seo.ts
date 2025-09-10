// Advanced SEO utilities for Next.js
import { Metadata } from 'next'

// Base SEO configuration
export const BASE_SEO_CONFIG = {
  siteName: 'EVTL Commercial Vehicles',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://your-domain.com',
  companyName: 'EVTL',
  defaultDescription: 'Premium commercial vehicles and electric trucks for modern businesses. Quality, reliability, and sustainability.',
  defaultKeywords: [
    'commercial vehicles',
    'electric trucks',
    'business fleet',
    'sustainable transport',
    'commercial transport',
    'electric vehicles',
    'fleet management',
    'green logistics'
  ],
  languages: ['en'],
  defaultLocale: 'en',
  author: 'EVTL Team',
  twitterHandle: '@evtl_official',
  facebookAppId: '123456789',
  organizationType: 'Corporation' as const,
  contactEmail: 'info@evtl.com',
  phoneNumber: '+1-555-123-4567',
  address: {
    street: '123 Business Avenue',
    city: 'Commercial District',
    state: 'NY',
    postalCode: '10001',
    country: 'US'
  }
} as const

// Vehicle-specific SEO data
export interface VehicleSEOData {
  name: string
  description?: string
  price: number
  year: number
  make: string
  fuelType: string
  category: string
  images: string[]
  slug: string
  features?: string[]
  specifications?: Record<string, string>
}

/**
 * SEO utilities for generating optimized metadata
 */
export class SEOGenerator {
  /**
   * Generate base metadata for the application
   */
  static generateBaseMetadata(): Metadata {
    return {
      metadataBase: new URL(BASE_SEO_CONFIG.siteUrl),
      title: {
        default: BASE_SEO_CONFIG.siteName,
        template: `%s | ${BASE_SEO_CONFIG.siteName}`
      },
      description: BASE_SEO_CONFIG.defaultDescription,
      keywords: BASE_SEO_CONFIG.defaultKeywords,
      authors: [{ name: BASE_SEO_CONFIG.author }],
      creator: BASE_SEO_CONFIG.companyName,
      publisher: BASE_SEO_CONFIG.companyName,
      formatDetection: {
        email: false,
        address: false,
        telephone: false
      },
      openGraph: {
        type: 'website',
        locale: 'en_US',
        siteName: BASE_SEO_CONFIG.siteName,
        url: BASE_SEO_CONFIG.siteUrl,
        title: BASE_SEO_CONFIG.siteName,
        description: BASE_SEO_CONFIG.defaultDescription,
        images: [
          {
            url: '/images/og-default.jpg',
            width: 1200,
            height: 630,
            alt: `${BASE_SEO_CONFIG.siteName} - Premium Commercial Vehicles`
          }
        ]
      },
      twitter: {
        card: 'summary_large_image',
        site: BASE_SEO_CONFIG.twitterHandle,
        creator: BASE_SEO_CONFIG.twitterHandle,
        title: BASE_SEO_CONFIG.siteName,
        description: BASE_SEO_CONFIG.defaultDescription,
        images: ['/images/twitter-card.jpg']
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1
        }
      },
      verification: {
        google: process.env.GOOGLE_SITE_VERIFICATION,
        yandex: process.env.YANDEX_VERIFICATION,
        bing: process.env.BING_VERIFICATION
      }
    }
  }

  /**
   * Generate metadata for vehicle pages
   */
  static generateVehicleMetadata(vehicle: VehicleSEOData): Metadata {
    const title = `${vehicle.year} ${vehicle.make} ${vehicle.name}`
    const description = vehicle.description || 
      `${title} - Premium ${vehicle.fuelType.toLowerCase()} ${vehicle.category.toLowerCase()} starting at $${vehicle.price.toLocaleString()}. Professional quality and reliability for your business needs.`
    
    const keywords = [
      vehicle.name.toLowerCase(),
      vehicle.make.toLowerCase(),
      vehicle.category.toLowerCase(),
      vehicle.fuelType.toLowerCase(),
      `${vehicle.year} ${vehicle.make.toLowerCase()}`,
      'commercial vehicle',
      'business fleet',
      ...(vehicle.features || []).map(f => f.toLowerCase())
    ]

    const structuredData = this.generateVehicleStructuredData(vehicle)
    const url = `${BASE_SEO_CONFIG.siteUrl}/vehicles/${vehicle.slug}`
    const mainImage = vehicle.images[0] || '/images/vehicle-placeholder.jpg'

    return {
      title,
      description,
      keywords,
      openGraph: {
        type: 'article',
        url,
        title,
        description,
        images: vehicle.images.map((image, index) => ({
          url: image,
          width: 1200,
          height: 800,
          alt: `${title} - Image ${index + 1}`
        }))
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [mainImage]
      },
      alternates: {
        canonical: url
      },
      other: {
        'structured-data': JSON.stringify(structuredData)
      }
    }
  }

  /**
   * Generate metadata for category pages
   */
  static generateCategoryMetadata(categoryName: string, vehicleCount: number): Metadata {
    const title = `${categoryName} Commercial Vehicles`
    const description = `Browse our selection of ${vehicleCount} premium ${categoryName.toLowerCase()} vehicles. Professional quality commercial vehicles for your business fleet needs.`
    const url = `${BASE_SEO_CONFIG.siteUrl}/vehicles?category=${categoryName.toLowerCase().replace(/\s+/g, '-')}`

    return {
      title,
      description,
      keywords: [
        categoryName.toLowerCase(),
        `${categoryName.toLowerCase()} commercial vehicles`,
        'business fleet',
        'commercial transport'
      ],
      openGraph: {
        type: 'website',
        url,
        title,
        description,
        images: [{
          url: `/images/categories/${categoryName.toLowerCase()}-og.jpg`,
          width: 1200,
          height: 630,
          alt: `${categoryName} Commercial Vehicles`
        }]
      },
      alternates: {
        canonical: url
      }
    }
  }

  /**
   * Generate structured data for vehicles (Schema.org)
   */
  private static generateVehicleStructuredData(vehicle: VehicleSEOData) {
    return {
      '@context': 'https://schema.org',
      '@type': 'Vehicle',
      name: `${vehicle.year} ${vehicle.make} ${vehicle.name}`,
      description: vehicle.description,
      brand: {
        '@type': 'Brand',
        name: vehicle.make
      },
      model: vehicle.name,
      vehicleModelDate: vehicle.year,
      fuelType: vehicle.fuelType,
      vehicleConfiguration: vehicle.category,
      offers: {
        '@type': 'Offer',
        price: vehicle.price,
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
        seller: {
          '@type': 'Organization',
          name: BASE_SEO_CONFIG.companyName,
          url: BASE_SEO_CONFIG.siteUrl
        }
      },
      image: vehicle.images,
      url: `${BASE_SEO_CONFIG.siteUrl}/vehicles/${vehicle.slug}`,
      ...(vehicle.specifications && {
        additionalProperty: Object.entries(vehicle.specifications).map(([key, value]) => ({
          '@type': 'PropertyValue',
          name: key,
          value: value
        }))
      })
    }
  }

  /**
   * Generate organization structured data
   */
  static generateOrganizationStructuredData() {
    return {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: BASE_SEO_CONFIG.companyName,
      legalName: BASE_SEO_CONFIG.siteName,
      url: BASE_SEO_CONFIG.siteUrl,
      logo: `${BASE_SEO_CONFIG.siteUrl}/images/logo.png`,
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: BASE_SEO_CONFIG.phoneNumber,
        contactType: 'customer service',
        email: BASE_SEO_CONFIG.contactEmail
      },
      address: {
        '@type': 'PostalAddress',
        streetAddress: BASE_SEO_CONFIG.address.street,
        addressLocality: BASE_SEO_CONFIG.address.city,
        addressRegion: BASE_SEO_CONFIG.address.state,
        postalCode: BASE_SEO_CONFIG.address.postalCode,
        addressCountry: BASE_SEO_CONFIG.address.country
      },
      sameAs: [
        'https://www.facebook.com/evtl',
        'https://www.twitter.com/evtl_official',
        'https://www.linkedin.com/company/evtl'
      ]
    }
  }

  /**
   * Generate breadcrumb structured data
   */
  static generateBreadcrumbStructuredData(breadcrumbs: Array<{ name: string; url: string }>) {
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: `${BASE_SEO_CONFIG.siteUrl}${item.url}`
      }))
    }
  }
}

/**
 * SEO utilities for optimizing content
 */
export class SEOOptimizer {
  /**
   * Optimize title for SEO (length, keywords, etc.)
   */
  static optimizeTitle(title: string, maxLength: number = 60): string {
    if (title.length <= maxLength) return title
    
    // Truncate at word boundary
    const truncated = title.substring(0, maxLength)
    const lastSpace = truncated.lastIndexOf(' ')
    
    return lastSpace > maxLength * 0.8 
      ? truncated.substring(0, lastSpace) + '...'
      : truncated + '...'
  }

  /**
   * Optimize meta description
   */
  static optimizeDescription(description: string, maxLength: number = 160): string {
    if (description.length <= maxLength) return description
    
    const truncated = description.substring(0, maxLength - 3)
    const lastSpace = truncated.lastIndexOf(' ')
    
    return lastSpace > maxLength * 0.8
      ? truncated.substring(0, lastSpace) + '...'
      : truncated + '...'
  }

  /**
   * Generate slug from title
   */
  static generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/--+/g, '-') // Replace multiple hyphens with single
      .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
  }

  /**
   * Extract keywords from content
   */
  static extractKeywords(content: string, maxKeywords: number = 10): string[] {
    // Simple keyword extraction (can be enhanced with NLP)
    const words = content
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3)

    // Count word frequency
    const wordCount = words.reduce((acc, word) => {
      acc[word] = (acc[word] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Sort by frequency and return top keywords
    return Object.entries(wordCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, maxKeywords)
      .map(([word]) => word)
  }

  /**
   * Check content readability score
   */
  static calculateReadabilityScore(content: string): {
    score: number
    level: string
    suggestions: string[]
  } {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0)
    const words = content.split(/\s+/).filter(w => w.length > 0)
    const avgWordsPerSentence = words.length / sentences.length
    const avgSyllablesPerWord = words.reduce((sum, word) => sum + this.countSyllables(word), 0) / words.length

    // Simplified Flesch Reading Ease formula
    const score = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord)
    
    let level: string
    let suggestions: string[] = []

    if (score >= 90) {
      level = 'Very Easy'
    } else if (score >= 80) {
      level = 'Easy'
    } else if (score >= 70) {
      level = 'Fairly Easy'
    } else if (score >= 60) {
      level = 'Standard'
    } else if (score >= 50) {
      level = 'Fairly Difficult'
      suggestions.push('Consider using shorter sentences')
    } else if (score >= 30) {
      level = 'Difficult'
      suggestions.push('Use shorter sentences and simpler words')
    } else {
      level = 'Very Difficult'
      suggestions.push('Significantly simplify content for better readability')
    }

    if (avgWordsPerSentence > 20) {
      suggestions.push('Average sentence length is too long (>20 words)')
    }

    return { score: Math.max(0, score), level, suggestions }
  }

  /**
   * Count syllables in a word (simplified)
   */
  private static countSyllables(word: string): number {
    word = word.toLowerCase()
    if (word.length <= 3) return 1
    
    let count = word.replace(/[^aeiouy]/g, '').length
    if (word.endsWith('e')) count--
    if (word.includes('le') && word.length > 2) count++
    
    return Math.max(1, count)
  }
}

/**
 * Sitemap generation utilities
 */
export class SitemapGenerator {
  /**
   * Generate sitemap entries for vehicles
   */
  static async generateVehicleSitemapEntries(): Promise<Array<{
    url: string
    lastModified: Date
    changeFrequency: string
    priority: number
  }>> {
    // This would typically fetch from your database
    // For now, returning a placeholder structure
    return []
  }

  /**
   * Generate robots.txt content
   */
  static generateRobotsTxt(): string {
    const siteUrl = BASE_SEO_CONFIG.siteUrl
    
    return `
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /_next/
Disallow: /private/

# Specific bot instructions
User-agent: Googlebot
Allow: /api/og/
Crawl-delay: 1

User-agent: Bingbot
Crawl-delay: 2

# Sitemaps
Sitemap: ${siteUrl}/sitemap.xml
Sitemap: ${siteUrl}/sitemap-vehicles.xml
Sitemap: ${siteUrl}/sitemap-categories.xml

# Clean URLs
Clean-param: utm_source&utm_medium&utm_campaign
    `.trim()
  }
}

/**
 * Performance and Core Web Vitals optimization
 */
export class WebVitalsOptimizer {
  /**
   * Initialize performance monitoring
   */
  static initializeWebVitals(): void {
    if (typeof window === 'undefined') return

    // Import web-vitals dynamically to avoid bundle bloat
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(this.handleMetric)
      getFID(this.handleMetric)
      getFCP(this.handleMetric)
      getLCP(this.handleMetric)
      getTTFB(this.handleMetric)
    }).catch(console.warn)
  }

  /**
   * Handle web vital metrics
   */
  private static handleMetric(metric: any): void {
    // Log metrics in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔍 Web Vital - ${metric.name}:`, metric.value, metric)
    }

    // Send to analytics in production
    if (process.env.NODE_ENV === 'production' && typeof gtag !== 'undefined') {
      gtag('event', metric.name, {
        event_category: 'Web Vitals',
        event_label: metric.id,
        value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
        non_interaction: true
      })
    }
  }

  /**
   * Preload critical resources
   */
  static preloadCriticalResources(): void {
    if (typeof window === 'undefined') return

    const criticalResources = [
      '/images/logo.webp',
      '/images/hero-bg.webp',
      '/_next/static/css/app.css'
    ]

    criticalResources.forEach(resource => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.href = resource
      link.as = resource.endsWith('.css') ? 'style' : 'image'
      if (resource.endsWith('.webp')) {
        link.type = 'image/webp'
      }
      document.head.appendChild(link)
    })
  }
}