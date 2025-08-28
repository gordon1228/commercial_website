'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

const stats = [
  { label: 'Vehicles Sold', value: 2500, suffix: '+' },
  { label: 'Happy Clients', value: 850, suffix: '+' },
  { label: 'Years Experience', value: 25, suffix: '' },
  { label: 'Satisfaction Rate', value: 98, suffix: '%' }
]

const partners = [
  { name: 'Mercedes', logo: '/images/truck1.jpg' },
  { name: 'Ford', logo: '/images/truck2.jpg' },
  { name: 'Freightliner', logo: '/images/truck3.jpg' },
  { name: 'Volvo', logo: '/images/truck4.jpg' },
  { name: 'Peterbilt', logo: '/images/truck1.jpg' },
  { name: 'Kenworth', logo: '/images/truck2.jpg' }
]

function AnimatedCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const duration = 2000
    const steps = 60
    const increment = value / steps
    const stepDuration = duration / steps

    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= value) {
        setCount(value)
        clearInterval(timer)
      } else {
        setCount(Math.floor(current))
      }
    }, stepDuration)

    return () => clearInterval(timer)
  }, [value])

  return (
    <span className="text-4xl md:text-5xl font-bold text-white">
      {count.toLocaleString()}{suffix}
    </span>
  )
}

export default function TrustSection() {
  return (
    <section className="py-24 bg-gray-950">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="mb-2">
                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              </div>
              <p className="text-muted-foreground text-lg">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Partners */}
        <div className="text-center mb-12">
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Trusted by Industry Leaders
          </h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We partner with the world&apos;s most respected commercial vehicle manufacturers to bring you unparalleled quality and reliability.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center">
          {partners.map((partner, index) => (
            <div
              key={index}
              className="flex items-center justify-center p-4 grayscale opacity-60 hover:opacity-100 hover:grayscale-0 transition-all duration-300"
            >
              <Image
                src={partner.logo}
                alt={partner.name}
                width={120}
                height={60}
                className="max-h-12 w-auto object-contain"
              />
            </div>
          ))}
        </div>

        {/* Trust indicators */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h4 className="text-xl font-semibold text-white mb-2">Quality Guarantee</h4>
            <p className="text-muted-foreground">
              Every vehicle undergoes rigorous inspection and comes with comprehensive warranty coverage.
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h4 className="text-xl font-semibold text-white mb-2">Fast Delivery</h4>
            <p className="text-muted-foreground">
              Quick processing and delivery to get your business moving without unnecessary delays.
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 11-9.75 9.75A9.75 9.75 0 0112 2.25z" />
              </svg>
            </div>
            <h4 className="text-xl font-semibold text-white mb-2">24/7 Support</h4>
            <p className="text-muted-foreground">
              Round-the-clock customer support to assist you with any questions or concerns.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}