'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { 
  Award, 
  Users, 
  Truck, 
  Shield, 
  Clock, 
  Star,
  CheckCircle,
  Heart,
  Target,
  Handshake
} from 'lucide-react'

// Note: metadata moved to layout.tsx since this is now a client component

// Icon mapping for dynamic rendering
const iconMap = {
  Shield,
  Handshake,
  Clock,
  Heart
}

interface CompanyInfo {
  companyName: string
  companyDescription: string
  totalVehiclesSold: number
  totalHappyCustomers: number
  totalYearsExp: number
  satisfactionRate: number
  storyTitle: string
  storyParagraph1: string
  storyParagraph2: string
  storyParagraph3: string
  missionTitle: string
  missionText: string
  visionTitle: string
  visionText: string
}

interface CompanyValue {
  id: string
  title: string
  description: string
  iconName: string
  order: number
}

interface TeamMember {
  id: string
  name: string
  position: string
  description: string
  image: string | null
  order: number
}

interface Certification {
  id: string
  name: string
  order: number
}




export default function AboutPage() {
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null)
  const [values, setValues] = useState<CompanyValue[]>([])
  const [team, setTeam] = useState<TeamMember[]>([])
  const [certifications, setCertifications] = useState<Certification[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [companyRes, valuesRes, teamRes, certsRes] = await Promise.all([
          fetch('/api/company-info'),
          fetch('/api/company-values'),
          fetch('/api/team-members'),
          fetch('/api/certifications')
        ])

        if (companyRes.ok) {
          const companyData = await companyRes.json()
          setCompanyInfo(companyData)
        }

        if (valuesRes.ok) {
          const valuesData = await valuesRes.json()
          setValues(valuesData)
        }

        if (teamRes.ok) {
          const teamData = await teamRes.json()
          setTeam(teamData)
        }

        if (certsRes.ok) {
          const certsData = await certsRes.json()
          setCertifications(certsData)
        }
      } catch (error) {
        console.error('Error fetching about page data:', error)
        // Provide fallback data if API fails
        setCompanyInfo({
          companyName: 'EliteFleet',
          companyDescription: 'For over 25 years, we\'ve been the trusted partner for businesses seeking premium commercial vehicles. Our commitment to excellence drives everything we do.',
          totalVehiclesSold: 2500,
          totalHappyCustomers: 850,
          totalYearsExp: 25,
          satisfactionRate: 98,
          storyTitle: 'Our Story',
          storyParagraph1: 'Founded in 1998, EliteFleet began as a small family business with a simple mission: to provide high-quality commercial vehicles to businesses that demand excellence. What started as a modest dealership has grown into one of the region\'s most trusted commercial vehicle providers.',
          storyParagraph2: 'Over the years, we\'ve built our reputation on three core principles: quality vehicles, exceptional service, and honest business practices. Our experienced team understands that choosing the right commercial vehicle is crucial for your business success.',
          storyParagraph3: 'Today, we continue to evolve with the industry, embracing new technologies and sustainable practices while maintaining the personal touch and attention to detail that our customers have come to expect.',
          missionTitle: 'Our Mission',
          missionText: 'To empower businesses with premium commercial vehicles and exceptional service, enabling them to achieve their goals while building long-lasting partnerships based on trust and mutual success.',
          visionTitle: 'Our Vision',
          visionText: 'To be the leading commercial vehicle provider, recognized for our commitment to quality, innovation, and customer satisfaction, while contributing to sustainable transportation solutions for future generations.'
        })
        
        setValues([
          { id: '1', title: 'Quality Assurance', description: 'Every vehicle undergoes rigorous inspection and comes with comprehensive warranty coverage to ensure your peace of mind.', iconName: 'Shield', order: 1 },
          { id: '2', title: 'Trust & Integrity', description: 'We build lasting relationships through honest dealings, transparent pricing, and reliable service that you can count on.', iconName: 'Handshake', order: 2 },
          { id: '3', title: 'Timely Service', description: 'We understand your business needs. Our quick processing and delivery services keep your operations running smoothly.', iconName: 'Clock', order: 3 },
          { id: '4', title: 'Customer First', description: '24/7 customer support and personalized service ensure that your experience with us exceeds expectations every time.', iconName: 'Heart', order: 4 }
        ])
        
        setTeam([
          { id: '1', name: 'Michael Chen', position: 'Founder & CEO', description: '25+ years in commercial vehicle industry', image: null, order: 1 },
          { id: '2', name: 'Sarah Johnson', position: 'Head of Sales', description: 'Expert in fleet management solutions', image: null, order: 2 },
          { id: '3', name: 'David Rodriguez', position: 'Service Director', description: 'Certified mechanical engineer & service expert', image: null, order: 3 },
          { id: '4', name: 'Emily Zhang', position: 'Finance Manager', description: 'Specializes in commercial vehicle financing', image: null, order: 4 }
        ])
        
        setCertifications([
          { id: '1', name: 'Better Business Bureau A+ Rating', order: 1 },
          { id: '2', name: 'Commercial Vehicle Dealer License', order: 2 },
          { id: '3', name: 'ISO 9001:2015 Quality Management', order: 3 },
          { id: '4', name: 'Green Business Certification', order: 4 },
          { id: '5', name: 'Industry Association Member', order: 5 },
          { id: '6', name: 'Customer Excellence Award 2023', order: 6 }
        ])
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  if (isLoading) {
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

  // Dynamic stats based on database data
  const stats = [
    { icon: Truck, label: 'Vehicles Sold', value: `${companyInfo.totalVehiclesSold.toLocaleString()}+` },
    { icon: Users, label: 'Happy Customers', value: `${companyInfo.totalHappyCustomers.toLocaleString()}+` },
    { icon: Award, label: 'Years Experience', value: `${companyInfo.totalYearsExp}+` },
    { icon: Star, label: 'Satisfaction Rate', value: `${companyInfo.satisfactionRate}%` }
  ]

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

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon
              return (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <IconComponent className="h-8 w-8 text-accent" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20">
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
              </div>
              {/* Decorative element */}
              <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-accent/20 rounded-lg -z-10" />
            </div>
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

      {/* Our Values */}
      <section className="py-20">
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
            {values.map((value, index) => {
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
      </section>

      {/* Timeline */}
      {/* 
      <section className="py-20 bg-gray-400/30">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Our Journey
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Key milestones that have shaped EliteFleet into the company we are today.
            </p>
          </div>

          <div className="relative">
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-gray-300 transform md:-translate-x-1/2" />

            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <div key={index} className={`flex items-center ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} border-gray-900`}>
                  <div className={`flex-1 ${index % 2 === 0 ? 'md:pr-12' : 'md:pl-12'} pl-12 md:pl-0 `}>
                    <div className="bg-gray-100 border border-gray-300 rounded-lg p-6">
                      <div className="text-gray-900 font-bold text-lg mb-2">{milestone.year}</div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3">{milestone.title}</h3>
                      <p className="text-gray-600">{milestone.description}</p>
                    </div>
                  </div>
                  
                  <div className="absolute left-4 md:left-1/2 w-8 h-8 bg-gray-600 rounded-full transform md:-translate-x-1/2 flex items-center justify-center">
                    <div className="w-3 h-3 bg-white rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      */}

      {/* Team */}
      <section className="py-20">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Meet Our Team
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our experienced professionals are dedicated to helping you find the perfect commercial vehicle for your business needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member) => (
              <div key={member.id} className="text-center">
                <div className="relative aspect-square mb-6 rounded-lg overflow-hidden">
                  {member.image ? (
                    <Image
                      src={member.image}
                      alt={member.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <div className="text-center text-gray-500">
                        <div className="text-4xl mb-2">👤</div>
                        <div className="text-sm font-medium">No Photo</div>
                      </div>
                    </div>
                  )}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{member.name}</h3>
                <p className="text-gray-900 font-medium mb-3">{member.position}</p>
                <p className="text-gray-600 text-sm">{member.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="py-20 bg-gray-400/30">
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
      </section>

      {/* CTA Section */}
      <section className="py-20">
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
      </section>
    </div>
  )
}