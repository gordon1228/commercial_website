import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  try {
    // Create admin user
    console.log('Creating admin user...')
    const hashedPassword = await bcrypt.hash('admin123', 10)
    
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@elitefleet.com' },
      update: {},
      create: {
        email: 'admin@elitefleet.com',
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
        salesPhone: '+1 (555) 123-4567',
        servicePhone: '+1 (555) 123-4568', 
        financePhone: '+1 (555) 123-4569',
        salesEmail: 'sales@elitefleet.com',
        serviceEmail: 'service@elitefleet.com',
        supportEmail: 'support@elitefleet.com',
        address: '123 Business Avenue',
        city: 'Commercial District',
        state: 'NY',
        postcode: '10001',
        siteName: 'EliteFleet'
      }
    }).catch(() => {
      // Contact info might already exist, that's fine
    })

    // Get counts
    const vehicleCount = await prisma.vehicle.count()
    const categoryCount = await prisma.category.count()
    const inquiryCount = await prisma.inquiry.count()
    const userCount = await prisma.user.count()
    const contactInfoCount = await prisma.contactInfo.count()
    
    console.log('✅ Database seeding completed successfully!')
    console.log(`Created:`)
    console.log(`- ${userCount} user(s)`)
    console.log(`- ${categoryCount} categories`)
    console.log(`- ${vehicleCount} vehicles`)
    console.log(`- ${inquiryCount} sample inquiries`)
    console.log(`- ${contactInfoCount} contact info record(s)`)
    
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