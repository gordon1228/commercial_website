// SEO components for structured data and meta information
import Script from 'next/script'

interface StructuredDataProps {
  data: Record<string, any>
  id?: string
}

/**
 * Component to inject structured data into page head
 */
export function StructuredData({ data, id }: StructuredDataProps) {
  return (
    <Script
      id={id || 'structured-data'}
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data, null, 2)
      }}
      strategy="beforeInteractive"
    />
  )
}

/**
 * Organization structured data component
 */
export function OrganizationStructuredData() {
  const organizationData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "EVTL",
    "legalName": "EVTL Commercial Vehicles",
    "url": process.env.NEXT_PUBLIC_SITE_URL,
    "logo": `${process.env.NEXT_PUBLIC_SITE_URL}/images/logo.png`,
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+1-555-123-4567",
      "contactType": "customer service",
      "email": "info@evtl.com",
      "availableLanguage": ["English"]
    },
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "123 Business Avenue",
      "addressLocality": "Commercial District",
      "addressRegion": "NY",
      "postalCode": "10001",
      "addressCountry": "US"
    },
    "sameAs": [
      "https://www.facebook.com/evtl",
      "https://www.linkedin.com/company/evtl",
      "https://twitter.com/evtl_official"
    ],
    "foundingDate": "1998",
    "numberOfEmployees": "100-500",
    "industry": "Commercial Vehicles",
    "areaServed": "United States"
  }

  return <StructuredData data={organizationData} id="organization-schema" />
}

/**
 * Website structured data component
 */
export function WebsiteStructuredData() {
  const websiteData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "EVTL Commercial Vehicles",
    "url": process.env.NEXT_PUBLIC_SITE_URL,
    "description": "Premium commercial vehicles and electric trucks for modern businesses.",
    "publisher": {
      "@type": "Organization",
      "name": "EVTL"
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${process.env.NEXT_PUBLIC_SITE_URL}/vehicles?search={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  }

  return <StructuredData data={websiteData} id="website-schema" />
}

/**
 * Vehicle structured data component
 */
interface VehicleStructuredDataProps {
  vehicle: {
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
}

export function VehicleStructuredData({ vehicle }: VehicleStructuredDataProps) {
  const vehicleData = {
    "@context": "https://schema.org",
    "@type": "Vehicle",
    "name": `${vehicle.year} ${vehicle.make} ${vehicle.name}`,
    "description": vehicle.description,
    "brand": {
      "@type": "Brand",
      "name": vehicle.make
    },
    "model": vehicle.name,
    "vehicleModelDate": vehicle.year,
    "fuelType": vehicle.fuelType,
    "vehicleConfiguration": vehicle.category,
    "offers": {
      "@type": "Offer",
      "price": vehicle.price,
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "Organization",
        "name": "EVTL",
        "url": process.env.NEXT_PUBLIC_SITE_URL
      },
      "priceValidUntil": new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 90 days from now
    },
    "image": vehicle.images,
    "url": `${process.env.NEXT_PUBLIC_SITE_URL}/vehicles/${vehicle.slug}`,
    ...(vehicle.specifications && {
      "additionalProperty": Object.entries(vehicle.specifications).map(([key, value]) => ({
        "@type": "PropertyValue",
        "name": key,
        "value": value
      }))
    })
  }

  return <StructuredData data={vehicleData} id="vehicle-schema" />
}

/**
 * Breadcrumb structured data component
 */
interface BreadcrumbStructuredDataProps {
  breadcrumbs: Array<{
    name: string
    url: string
  }>
}

export function BreadcrumbStructuredData({ breadcrumbs }: BreadcrumbStructuredDataProps) {
  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": `${process.env.NEXT_PUBLIC_SITE_URL}${item.url}`
    }))
  }

  return <StructuredData data={breadcrumbData} id="breadcrumb-schema" />
}

/**
 * FAQ structured data component
 */
interface FAQStructuredDataProps {
  faqs: Array<{
    question: string
    answer: string
  }>
}

export function FAQStructuredData({ faqs }: FAQStructuredDataProps) {
  const faqData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  }

  return <StructuredData data={faqData} id="faq-schema" />
}

/**
 * Product listing structured data component (for category pages)
 */
interface ProductListingStructuredDataProps {
  category: string
  vehicles: Array<{
    name: string
    price: number
    year: number
    make: string
    slug: string
    images: string[]
  }>
}

export function ProductListingStructuredData({ category, vehicles }: ProductListingStructuredDataProps) {
  const listingData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": `${category} Commercial Vehicles`,
    "description": `Browse our selection of ${category.toLowerCase()} commercial vehicles`,
    "numberOfItems": vehicles.length,
    "itemListElement": vehicles.map((vehicle, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Vehicle",
        "name": `${vehicle.year} ${vehicle.make} ${vehicle.name}`,
        "url": `${process.env.NEXT_PUBLIC_SITE_URL}/vehicles/${vehicle.slug}`,
        "image": vehicle.images[0] || '',
        "offers": {
          "@type": "Offer",
          "price": vehicle.price,
          "priceCurrency": "USD"
        }
      }
    }))
  }

  return <StructuredData data={listingData} id="product-listing-schema" />
}

/**
 * Local Business structured data component (for contact/about pages)
 */
export function LocalBusinessStructuredData() {
  const businessData = {
    "@context": "https://schema.org",
    "@type": ["Organization", "LocalBusiness"],
    "name": "EVTL Commercial Vehicles",
    "image": `${process.env.NEXT_PUBLIC_SITE_URL}/images/business-photo.jpg`,
    "telephone": "+1-555-123-4567",
    "email": "info@evtl.com",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "123 Business Avenue",
      "addressLocality": "Commercial District",
      "addressRegion": "NY",
      "postalCode": "10001",
      "addressCountry": "US"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "40.7128",
      "longitude": "-74.0060"
    },
    "url": process.env.NEXT_PUBLIC_SITE_URL,
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": [
          "Monday",
          "Tuesday", 
          "Wednesday",
          "Thursday",
          "Friday"
        ],
        "opens": "08:00",
        "closes": "18:00"
      },
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": "Saturday",
        "opens": "09:00",
        "closes": "16:00"
      }
    ],
    "priceRange": "$$$$",
    "servedCuisine": "Commercial Vehicles",
    "areaServed": "United States"
  }

  return <StructuredData data={businessData} id="local-business-schema" />
}