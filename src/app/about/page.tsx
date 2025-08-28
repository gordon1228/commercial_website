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

export const metadata = {
  title: 'About Us | EliteFleet',
  description: 'Learn about EliteFleet\'s commitment to providing premium commercial vehicles and exceptional service since 1998.',
}

const stats = [
  { icon: Truck, label: 'Vehicles Sold', value: '2,500+' },
  { icon: Users, label: 'Happy Customers', value: '850+' },
  { icon: Award, label: 'Years Experience', value: '25+' },
  { icon: Star, label: 'Satisfaction Rate', value: '98%' }
]

const values = [
  {
    icon: Shield,
    title: 'Quality Assurance',
    description: 'Every vehicle undergoes rigorous inspection and comes with comprehensive warranty coverage to ensure your peace of mind.'
  },
  {
    icon: Handshake,
    title: 'Trust & Integrity',
    description: 'We build lasting relationships through honest dealings, transparent pricing, and reliable service that you can count on.'
  },
  {
    icon: Clock,
    title: 'Timely Service',
    description: 'We understand your business needs. Our quick processing and delivery services keep your operations running smoothly.'
  },
  {
    icon: Heart,
    title: 'Customer First',
    description: '24/7 customer support and personalized service ensure that your experience with us exceeds expectations every time.'
  }
]

const milestones = [
  {
    year: '1998',
    title: 'Founded',
    description: 'EliteFleet was established with a vision to provide premium commercial vehicles to growing businesses.'
  },
  {
    year: '2005',
    title: 'Expanded Operations',
    description: 'Opened our second location and expanded our fleet to include specialty commercial vehicles.'
  },
  {
    year: '2012',
    title: 'Digital Innovation',
    description: 'Launched our first online platform, making it easier for customers to browse and purchase vehicles.'
  },
  {
    year: '2018',
    title: '1000+ Vehicles',
    description: 'Reached the milestone of 1000+ vehicles sold, establishing ourselves as industry leaders.'
  },
  {
    year: '2020',
    title: 'Green Initiative',
    description: 'Introduced eco-friendly vehicle options and sustainable business practices.'
  },
  {
    year: '2024',
    title: 'Modern Platform',
    description: 'Launched our state-of-the-art digital platform for enhanced customer experience.'
  }
]

const team = [
  {
    name: 'Michael Chen',
    position: 'Founder & CEO',
    image: '/images/truck1.jpg',
    description: '25+ years in commercial vehicle industry'
  },
  {
    name: 'Sarah Johnson',
    position: 'Head of Sales',
    image: '/images/truck2.jpg',
    description: 'Expert in fleet management solutions'
  },
  {
    name: 'David Rodriguez',
    position: 'Service Director',
    image: '/images/truck3.jpg',
    description: 'Certified mechanical engineer & service expert'
  },
  {
    name: 'Emily Zhang',
    position: 'Finance Manager',
    image: '/images/truck4.jpg',
    description: 'Specializes in commercial vehicle financing'
  }
]

const certifications = [
  'Better Business Bureau A+ Rating',
  'Commercial Vehicle Dealer License',
  'ISO 9001:2015 Quality Management',
  'Green Business Certification',
  'Industry Association Member',
  'Customer Excellence Award 2023'
]

export default function AboutPage() {
  return (
    <div className="min-h-screen pt-20 bg-background">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-gray-100 to-background">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-display font-bold text-gray-900 mb-6">
              About EliteFleet
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              For over 25 years, we&apos;ve been the trusted partner for businesses seeking premium commercial vehicles. 
              Our commitment to excellence drives everything we do.
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
                Our Story
              </h2>
              <div className="space-y-6 text-gray-600 leading-relaxed">
                <p>
                  Founded in 1998, EliteFleet began as a small family business with a simple mission: 
                  to provide high-quality commercial vehicles to businesses that demand excellence. 
                  What started as a modest dealership has grown into one of the region&apos;s most trusted 
                  commercial vehicle providers.
                </p>
                <p>
                  Over the years, we&apos;ve built our reputation on three core principles: quality vehicles, 
                  exceptional service, and honest business practices. Our experienced team understands 
                  that choosing the right commercial vehicle is crucial for your business success.
                </p>
                <p>
                  Today, we continue to evolve with the industry, embracing new technologies and 
                  sustainable practices while maintaining the personal touch and attention to detail 
                  that our customers have come to expect.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-lg overflow-hidden">
                <Image
                  src="/images/truck1.jpg"
                  alt="EliteFleet facility"
                  fill
                  className="object-cover"
                />
              </div>
              {/* Decorative element */}
              <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-accent/20 rounded-lg -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-gray-900/30">
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
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h3>
              <p className="text-gray-600 leading-relaxed">
                To empower businesses with premium commercial vehicles and exceptional service, 
                enabling them to achieve their goals while building long-lasting partnerships 
                based on trust and mutual success.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Star className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h3>
              <p className="text-gray-600 leading-relaxed">
                To be the leading commercial vehicle provider, recognized for our commitment to 
                quality, innovation, and customer satisfaction, while contributing to sustainable 
                transportation solutions for future generations.
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
              const IconComponent = value.icon
              return (
                <div key={index} className="flex items-start space-x-4">
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
      <section className="py-20 bg-gray-900/30">
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
            {/* Timeline line */}
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-accent/30 transform md:-translate-x-1/2" />

            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <div key={index} className={`flex items-center ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                  <div className={`flex-1 ${index % 2 === 0 ? 'md:pr-12' : 'md:pl-12'} pl-12 md:pl-0`}>
                    <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
                      <div className="text-accent font-bold text-lg mb-2">{milestone.year}</div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3">{milestone.title}</h3>
                      <p className="text-gray-600">{milestone.description}</p>
                    </div>
                  </div>
                  
                  {/* Timeline dot */}
                  <div className="absolute left-4 md:left-1/2 w-8 h-8 bg-accent rounded-full transform md:-translate-x-1/2 flex items-center justify-center">
                    <div className="w-3 h-3 bg-white rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

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
            {team.map((member, index) => (
              <div key={index} className="text-center">
                <div className="relative aspect-square mb-6 rounded-lg overflow-hidden">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{member.name}</h3>
                <p className="text-accent font-medium mb-3">{member.position}</p>
                <p className="text-gray-600 text-sm">{member.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="py-20 bg-gray-900/30">
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
            {certifications.map((cert, index) => (
              <div key={index} className="flex items-center space-x-3 bg-gray-900/50 border border-gray-800 rounded-lg p-4">
                <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                <span className="text-gray-900">{cert}</span>
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