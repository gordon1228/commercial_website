import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting comprehensive database seeding...')

  try {
    // Create admin user
    console.log('Creating admin user...')
    const hashedPassword = await bcrypt.hash('admin123', 10)
    
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@evtl.com' },
      update: {},
      create: {
        email: 'admin@evtl.com',
        password: hashedPassword,
        role: 'ADMIN'
      }
    })

    // Create categories
    console.log('Creating categories...')
    const trucksCategory = await prisma.category.upsert({
      where: { slug: 'trucks' },
      update: {},
      create: {
        name: 'Commercial Trucks',
        slug: 'trucks'
      }
    })

    const vansCategory = await prisma.category.upsert({
      where: { slug: 'vans' },
      update: {},
      create: {
        name: 'Delivery Vans',
        slug: 'vans'
      }
    })

    const busesCategory = await prisma.category.upsert({
      where: { slug: 'buses' },
      update: {},
      create: {
        name: 'Passenger Buses',
        slug: 'buses'
      }
    })

    // Create vehicles
    console.log('Creating vehicles...')
    const vehicles = [
      {
        name: 'Mercedes Sprinter 3500',
        slug: 'mercedes-sprinter-3500',
        description: 'Premium commercial van with excellent fuel efficiency and cargo capacity. Perfect for delivery services, passenger transport, and commercial applications.',
        price: 75000,
        year: 2024,
        make: 'Mercedes',
        fuelType: 'Diesel',
        categoryId: vansCategory.id,
        status: 'AVAILABLE' as const,
        images: ['/images/truck1.jpg'],
        specs: {
          fuel: '21 MPG',
          capacity: '15 seats',
          weight: '11,030 lbs',
          engine: '3.0L V6 Turbo Diesel',
          horsepower: '188 HP'
        }
      },
      {
        name: 'Ford F-650 Box Truck',
        slug: 'ford-f650-box-truck',
        description: 'Heavy-duty commercial truck with spacious cargo box. Ideal for moving, delivery services, and commercial freight applications.',
        price: 89000,
        year: 2023,
        make: 'Ford',
        fuelType: 'Diesel',
        categoryId: trucksCategory.id,
        status: 'AVAILABLE' as const,
        images: ['/images/truck2.jpg'],
        specs: {
          fuel: '12 MPG',
          capacity: '2 seats',
          weight: '25,950 lbs',
          engine: '6.7L V8 Power Stroke Diesel',
          horsepower: '270 HP'
        }
      },
      {
        name: 'Freightliner Cascadia',
        slug: 'freightliner-cascadia',
        description: 'Professional over-the-road truck with advanced aerodynamics and fuel efficiency. Built for long-haul transportation and heavy freight.',
        price: 165000,
        year: 2024,
        make: 'Freightliner',
        fuelType: 'Diesel',
        categoryId: trucksCategory.id,
        status: 'AVAILABLE' as const,
        images: ['/images/truck3.jpg'],
        specs: {
          fuel: '7.5 MPG',
          capacity: '2 seats',
          weight: '80,000 lbs',
          engine: 'Detroit DD15 14.8L',
          horsepower: '505 HP'
        }
      },
      {
        name: 'Blue Bird School Bus',
        slug: 'blue-bird-school-bus',
        description: 'Safe and reliable school bus with modern safety features. Perfect for educational institutions and passenger transportation services.',
        price: 125000,
        year: 2023,
        make: 'Blue Bird',
        fuelType: 'Diesel',
        categoryId: busesCategory.id,
        status: 'RESERVED' as const,
        images: ['/images/truck4.jpg'],
        specs: {
          fuel: '8 MPG',
          capacity: '72 seats',
          weight: '34,000 lbs',
          engine: 'Cummins ISB 6.7L',
          horsepower: '260 HP'
        }
      },
      {
        name: 'Isuzu NPR HD',
        slug: 'isuzu-npr-hd',
        description: 'Versatile medium-duty truck perfect for local deliveries and commercial applications. Known for reliability and fuel efficiency.',
        price: 58000,
        year: 2024,
        make: 'Isuzu',
        fuelType: 'Diesel',
        categoryId: trucksCategory.id,
        status: 'AVAILABLE' as const,
        images: ['/images/truck1.jpg'],
        specs: {
          fuel: '13 MPG',
          capacity: '3 seats',
          weight: '14,500 lbs',
          engine: '5.2L Turbo Diesel',
          horsepower: '215 HP'
        }
      },
      {
        name: 'Ford Transit 350',
        slug: 'ford-transit-350',
        description: 'Popular commercial van with excellent maneuverability and cargo space. Ideal for small businesses and delivery services.',
        price: 42000,
        year: 2024,
        make: 'Ford',
        fuelType: 'Gasoline',
        categoryId: vansCategory.id,
        status: 'AVAILABLE' as const,
        images: ['/images/truck2.jpg'],
        specs: {
          fuel: '18 MPG',
          capacity: '12 seats',
          weight: '9,070 lbs',
          engine: '3.5L V6 EcoBoost',
          horsepower: '310 HP'
        }
      }
    ]

    const createdVehicles = []
    for (const vehicleData of vehicles) {
      const vehicle = await prisma.vehicle.upsert({
        where: { slug: vehicleData.slug },
        update: {},
        create: {
          ...vehicleData
          // Note: features field doesn't exist in Vehicle model, removed
        }
      })
      createdVehicles.push(vehicle)
    }

    // Create sample inquiries
    console.log('Creating sample inquiries...')
    
    // Create inquiries with proper structure
    const inquiries = [
      {
        vehicleId: createdVehicles[0].id, // Mercedes Sprinter
        // userId is optional, so we can omit it or set it to null
        customerName: 'John Smith',
        email: 'john.smith@company.com',
        phone: '+1 (555) 123-4567',
        message: 'I\'m interested in purchasing this Mercedes Sprinter for my delivery business. Can you provide a detailed quote including financing options?',
        status: 'NEW' as const
      },
      {
        vehicleId: createdVehicles[1].id, // Ford F-650
        customerName: 'Sarah Johnson',
        email: 'sarah.johnson@logistics.com',
        phone: '+1 (555) 987-6543',
        message: 'Would like to schedule a visit to inspect this box truck. When would be the best time this week?',
        status: 'CONTACTED' as const
      },
      {
        vehicleId: createdVehicles[2].id, // Freightliner
        customerName: 'Mike Wilson',
        email: 'mike.wilson@transport.com',
        phone: '+1 (555) 456-7890',
        message: 'Looking for information about financing programs and lease options for this Freightliner.',
        status: 'NEW' as const
      }
    ]

    for (const inquiryData of inquiries) {
      await prisma.inquiry.create({
        data: inquiryData
      })
    }

    // Create default contact info
    console.log('Creating default contact info...')
    await prisma.contactInfo.upsert({
      where: { id: 'default' }, // This won't match, so it will create
      update: {},
      create: {
        salesPhone: '+60 10 339 1414',
        servicePhone: '+60 16 332 2349', 
        financePhone: '+60 16 332 2349',
        salesEmail: 'sales@evtl.com',
        serviceEmail: 'service@evtl.com',
        supportEmail: 'support@evtl.com',
        address: '3-20 Level 3 MKH Boulevard, Jalan Changkat',
        city: 'Kajang',
        state: 'Selangor',
        postcode: '43000',
        siteName: 'EVTL',
        companyDescription: 'EVTL Sdn. Bhd. is a next-generation mobility startup focusing on Electric Trucks (EV Trucks) and future smart transport solutions.'
      }
    }).catch(() => {
      // Contact info might already exist, that's fine
    })

    // Create company info
    console.log('Creating company info...')
    await prisma.companyInfo.upsert({
      where: { id: 'default' },
      update: {},
      create: {
        companyName: 'EVTL',
        companyDescription: 'EVTL 是一家新能源初创企业，聚焦 电动罗里（EV Trucks） 及未来智慧交通解决方案。我们与本地及国际合作伙伴共同推动马来西亚物流行业的绿色转型。',
        foundedYear: 2025,
        totalVehiclesSold: 0,
        totalHappyCustomers: 0,
        totalYearsExp: 0,
        satisfactionRate: 0,
        storyTitle: 'Our Story',
        storyParagraph1: 'Founded in 2025, EVTL began as a small family business with a simple mission: to provide high-quality commercial vehicles to businesses that demand excellence. What started as a modest dealership has grown into one of the region\'s most trusted commercial vehicle providers.',
        storyParagraph2: 'Over the years, we\'ve built our reputation on three core principles: quality vehicles, exceptional service, and honest business practices. Our experienced team understands that choosing the right commercial vehicle is crucial for your business success.',
        storyParagraph3: 'Today, we continue to evolve with the industry, embracing new technologies and sustainable practices while maintaining the personal touch and attention to detail that our customers have come to expect.',
        missionTitle: 'Our Mission',
        missionText: 'To empower businesses with premium commercial vehicles and exceptional service, enabling them to achieve their goals while building long-lasting partnerships based on trust and mutual success.',
        visionTitle: 'Our Vision',
        visionText: 'To be the leading commercial vehicle provider, recognized for our commitment to quality, innovation, and customer satisfaction, while contributing to sustainable transportation solutions for future generations.'
      }
    }).catch(() => {
      // Company info might already exist, that's fine
    })

    // Create company values
    console.log('Creating company values...')
    const companyValues = [
      {
        title: 'Sustainability',
        description: 'Leading Malaysia\'s transition to zero-carbon logistics through innovative electric truck technology and smart mobility solutions.',
        iconName: 'Shield',
        order: 1
      },
      {
        title: 'Innovation',
        description: 'Partnering with local and international technology leaders to deliver next-generation electric vehicle solutions for the future.',
        iconName: 'Handshake',
        order: 2
      },
      {
        title: 'Smart Solutions',
        description: 'Integrating advanced technology and data-driven insights to optimize logistics and transport efficiency for our partners.',
        iconName: 'Clock',
        order: 3
      },
      {
        title: 'Green Future',
        description: 'Committed to creating a sustainable tomorrow through clean energy transport solutions that benefit businesses and communities.',
        iconName: 'Heart',
        order: 4
      }
    ]

    for (const value of companyValues) {
      await prisma.companyValue.upsert({
        where: { id: `value-${value.order}` },
        update: {},
        create: value
      })
    }

    // Create certifications
    console.log('Creating certifications...')
    const certifications = [
      { name: 'Malaysia Green Technology Corporation (GreenTech) Certified', order: 1 },
      { name: 'Electric Vehicle Technology License', order: 2 },
      { name: 'ISO 14001:2015 Environmental Management', order: 3 },
      { name: 'Partnership with Superlux Technology', order: 4 },
      { name: 'EVpower Strategic Alliance', order: 5 },
      { name: 'Malaysia Digital Economy Corporation (MDEC) Registered', order: 6 }
    ]

    for (const cert of certifications) {
      await prisma.certification.upsert({
        where: { id: `cert-${cert.order}` },
        update: {},
        create: cert
      })
    }


    // Create homepage content
    console.log('Creating homepage content...')
    await prisma.homepageContent.upsert({
      where: { id: 'default' },
      update: {},
      create: {
        heroTitle: 'Premium Electric',
        heroSubtitle: 'Commercial Vehicles',
        heroDescription: 'Discover elite fleet solutions built for businesses that demand excellence, reliability, and sustainable electric vehicle technology.',
        heroButtonPrimary: 'Explore Fleet',
        heroButtonSecondary: 'Get Quote',
        happyClients: 850,
        yearsExperience: 25,
        satisfactionRate: 98,
        partnersTitle: 'Trusted by Industry Leaders',
        partnersDescription: 'We partner with the world\'s most respected electric vehicle manufacturers to bring you unparalleled quality and sustainability.',
        feature1Title: 'Quality Guarantee',
        feature1Description: 'Every vehicle undergoes rigorous inspection and comes with comprehensive warranty coverage.',
        feature2Title: 'Fast Delivery',
        feature2Description: 'Quick processing and delivery to get your business moving without unnecessary delays.',
        feature3Title: '24/7 Support',
        feature3Description: 'Round-the-clock customer support to assist you with any questions or concerns.'
      }
    }).catch(() => {
      // Homepage content might already exist, that's fine
    })


    // Create technology content
    console.log('Creating technology content...')
    await prisma.technologyContent.upsert({
      where: { id: 'default' },
      update: {},
      create: {
        heroTitle: 'Next-Generation Electric Truck Technology',
        heroSubtitle: 'Advanced electric vehicle technology designed for commercial success and environmental sustainability',
        heroBackgroundImage: '/uploads/Technology_background.png',
        heroBackgroundImageAlt: 'Electric Truck Technology Background',
        section1Title: 'Advanced Battery Technology',
        section1Description: 'Our cutting-edge battery systems provide exceptional range and durability for commercial applications. With state-of-the-art lithium-ion technology, our trucks deliver up to 300 miles of range on a single charge.',
        section2Title: 'Smart Fleet Management',
        section2Description: 'Integrated IoT solutions for real-time monitoring, maintenance prediction, and route optimization. Our advanced telematics system provides comprehensive insights into vehicle performance and driver behavior.',
        section3Title: 'Rapid Charging Infrastructure',
        section3Description: 'Fast-charging capabilities designed to minimize downtime and maximize operational efficiency. Our trucks support DC fast charging with charging times as low as 30 minutes for 80% capacity.',
        section4Title: 'Sustainable Manufacturing',
        section4Description: 'Eco-friendly production processes that reduce environmental impact while maintaining quality. Our manufacturing facilities use renewable energy and sustainable materials wherever possible.'
      }
    }).catch(() => {
      // Technology content might already exist, that's fine
    })

    // Create technology features
    console.log('Creating technology features...')
    const techFeatures = [
      {
        title: 'Long Range Battery',
        description: 'Up to 300 miles range on a single charge with our advanced battery technology',
        iconName: 'Battery',
        order: 1
      },
      {
        title: 'Fast Charging',
        description: 'Rapid charging capabilities with 80% charge in just 30 minutes',
        iconName: 'Zap',
        order: 2
      },
      {
        title: 'Smart Monitoring',
        description: 'Real-time vehicle diagnostics and performance monitoring',
        iconName: 'Wifi',
        order: 3
      },
      {
        title: 'Eco-Friendly',
        description: 'Zero emissions operation with sustainable manufacturing practices',
        iconName: 'Leaf',
        order: 4
      }
    ]

    for (const feature of techFeatures) {
      await prisma.technologyFeature.upsert({
        where: { id: `tech-feature-${feature.order}` },
        update: {},
        create: feature
      })
    }

    // Get counts for summary
    const vehicleCount = await prisma.vehicle.count()
    const categoryCount = await prisma.category.count()
    const inquiryCount = await prisma.inquiry.count()
    const userCount = await prisma.user.count()
    const contactInfoCount = await prisma.contactInfo.count()
    const companyInfoCount = await prisma.companyInfo.count()
    const companyValueCount = await prisma.companyValue.count()
    const certificationCount = await prisma.certification.count()
    const homepageContentCount = await prisma.homepageContent.count()
    const technologyContentCount = await prisma.technologyContent.count()
    const technologyFeatureCount = await prisma.technologyFeature.count()
    
    console.log('✅ Comprehensive database seeding completed successfully!')
    console.log(`Created:`)
    console.log(`- ${userCount} user(s)`)
    console.log(`- ${categoryCount} categories`)
    console.log(`- ${vehicleCount} vehicles`)
    console.log(`- ${inquiryCount} sample inquiries`)
    console.log(`- ${contactInfoCount} contact info record(s)`)
    console.log(`- ${companyInfoCount} company info record(s)`)
    console.log(`- ${companyValueCount} company values`)
    console.log(`- ${certificationCount} certifications`)
    console.log(`- ${homepageContentCount} homepage content record(s)`)
    console.log(`- ${technologyContentCount} technology content record(s)`)
    console.log(`- ${technologyFeatureCount} technology features`)
    console.log('🎉 Your EVTL database is now fully populated!')
    
  } catch (error) {
    console.error('❌ Seeding error details:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error('❌ Fatal error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })