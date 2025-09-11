'use client'

import { useState, useEffect } from 'react'
import { 
  // Shield, 
  // Clock, 
  Star,
  // CheckCircle,
  // Heart,
  Target,
  // Handshake
} from 'lucide-react'
import { useJsonData } from '@/lib/data-loader'
import type { CompanyInfoConfig } from '@/types/data-config'
import { STATIC_FALLBACKS } from '@/config/fallbacks'

// Note: metadata moved to layout.tsx since this is now a client component

// Icon mapping for dynamic rendering
// const iconMap = {
//   Shield,
//   Handshake,
//   Clock,
//   Heart
// }

interface CompanyInfo {
  companyName: string
  companyDescription: string
  storyTitle: string
  storyParagraph1: string
  storyParagraph2: string
  storyParagraph3: string
  missionTitle: string
  missionText: string
  visionTitle: string
  visionText: string
}

// interface CompanyValue {
//   id: string
//   title: string
//   description: string
//   iconName: string
//   order: number
// }


// interface Certification {
//   id: string
//   name: string
//   order: number
// }




export default function AboutPage() {
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null)
  // const [values, setValues] = useState<CompanyValue[]>([])
  // const [certifications, setCertifications] = useState<Certification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // Create fallback data structure
  const defaultFallback: CompanyInfoConfig = {
    companyInfo: {
      id: 'default',
      companyName: STATIC_FALLBACKS.company.name,
      companyDescription: STATIC_FALLBACKS.company.description,
      foundedYear: 2025,
      totalVehiclesSold: 150,
      totalHappyCustomers: 50,
      totalYearsExp: 1,
      satisfactionRate: 98,
      storyTitle: 'Who We Are',
      storyParagraph1: STATIC_FALLBACKS.company.description,
      storyParagraph2: 'Founded in 2025, EVTL collaborates with local and international partners to accelerate Malaysia\'s green logistics transformation.',
      storyParagraph3: 'We are committed to creating a sustainable future through innovative electric vehicle technology and smart mobility solutions that serve businesses and communities across Malaysia.',
      missionTitle: 'Our Mission',
      missionText: 'To accelerate Malaysia\'s green logistics transformation through innovative electric truck solutions and smart transport technologies, partnering with local and international stakeholders.',
      visionTitle: 'Our Vision',
      visionText: 'Zero Carbon, Smart Mobility for All'
    }
  }

  // Load fallback data from JSON
  const { data: fallbackData, loading: fallbackLoading } = useJsonData<CompanyInfoConfig>('fallback/company-info.json', defaultFallback)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [companyRes] = await Promise.all([
          fetch('/api/company-info')
        ])
        // const [companyRes, valuesRes, certsRes] = await Promise.all([
        //   fetch('/api/company-info'),
        //   fetch('/api/company-values'),
        //   fetch('/api/certifications')
        // ])

        if (companyRes.ok) {
          const companyData = await companyRes.json()
          setCompanyInfo(companyData)
        }

        // if (valuesRes.ok) {
        //   const valuesData = await valuesRes.json()
        //   setValues(valuesData)
        // }

        // if (certsRes.ok) {
        //   const certsData = await certsRes.json()
        //   setCertifications(certsData)
        // }
      } catch (error) {
        console.error('Error fetching about page data:', error)
        // Use fallback data from JSON if available
        if (fallbackData) {
          setCompanyInfo(fallbackData.companyInfo)
          // setValues(fallbackData.values)
          // setCertifications(fallbackData.certifications)
        }
      } finally {
        setIsLoading(false)
      }
    }

    // Only start fetching after fallback data is loaded (or failed to load)
    if (!fallbackLoading) {
      fetchData()
    }
  }, [fallbackData, fallbackLoading])

  if (isLoading || fallbackLoading) {
    return (
      <div className="min-h-screen pt-20 bg-background">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!companyInfo) {
    return (
      <div className="min-h-screen pt-20 bg-background">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <p className="text-xl text-gray-600">Unable to load company information.</p>
          </div>
        </div>
      </div>
    )
  }


  return (
    <div className="min-h-screen pt-20 bg-background">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-gray-100 to-background">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-display font-bold text-gray-900 mb-6">
              About {companyInfo.companyName}
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              {companyInfo.companyDescription}
            </p>
          </div>

        </div>
      </section>

     

      {/* Mission & Vision */}
      <section className="py-20 bg-gray-400/30">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Mission & Vision
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Target className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">{companyInfo.missionTitle}</h3>
              <p className="text-gray-600 leading-relaxed">
                {companyInfo.missionText}
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Star className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">{companyInfo.visionTitle}</h3>
              <p className="text-gray-600 leading-relaxed">
                {companyInfo.visionText}
              </p>
            </div>
          </div>
        </div>
      </section>

       {/* Our Story */}
      {/* <section className="py-20">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                {companyInfo.storyTitle}
              </h2>
              <div className="space-y-6 text-gray-600 leading-relaxed">
                <p>
                  {companyInfo.storyParagraph1}
                </p>
                <p>
                  {companyInfo.storyParagraph2}
                </p>
                <p>
                  {companyInfo.storyParagraph3}
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-lg overflow-hidden">
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <div className="text-center text-gray-500">
                    <div className="text-6xl mb-4">🏢</div>
                    <div className="text-lg font-medium">No Facility Image</div>
                  </div>
                </div>
              </div> */}
              {/* Decorative element */}
              {/* <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-accent/20 rounded-lg -z-10" />
            </div>
          </div>
        </div>
      </section> */}

      {/* Our Values */}
      {/* <section className="py-20">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Our Values
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              These core values guide every decision we make and every interaction we have with our customers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((value) => {
              const IconComponent = iconMap[value.iconName as keyof typeof iconMap] || Shield
              return (
                <div key={value.id} className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <IconComponent className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{value.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section> */}


      {/* Certifications */}
      {/* <section className="py-20 bg-gray-400/30">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Certifications & Accreditations
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our commitment to excellence is recognized by leading industry organizations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certifications.map((cert) => (
              <div key={cert.id} className="flex items-center space-x-3 bg-gray-200/50 border border-gray-500 rounded-lg p-4">
                <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                <span className="text-gray-900">{cert.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* CTA Section */}
      {/* <section className="py-20">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-accent/10 border border-accent/20 rounded-2xl p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Ready to Work With Us?
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Join thousands of satisfied customers who trust EliteFleet for their commercial vehicle needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/vehicles"
                className="btn btn-primary px-8 py-4 text-lg"
              >
                Browse Our Fleet
              </a>
              <a
                href="/contact"
                className="btn btn-secondary px-8 py-4 text-lg"
              >
                Contact Us Today
              </a>
            </div>
          </div>
        </div>
      </section> */}
    </div>
  )
}