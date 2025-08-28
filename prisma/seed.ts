import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

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
  const vehicle1 = await prisma.vehicle.upsert({
    where: { slug: 'mercedes-sprinter-3500' },
    update: {},
    create: {
      name: 'Mercedes Sprinter 3500',
      slug: 'mercedes-sprinter-3500',
      description: 'Premium commercial van with excellent fuel efficiency and cargo capacity. Perfect for delivery services, passenger transport, and commercial applications.',
      price: 75000,
      categoryId: vansCategory.id,
      status: 'AVAILABLE',
      images: ['/images/truck1.jpg'],
      specs: {
        fuel: '21 MPG',
        capacity: '15 seats',
        weight: '11,030 lbs',
        engine: '3.0L V6 Turbo Diesel',
        horsepower: '188 HP'
      }
    }
  })

  const vehicle2 = await prisma.vehicle.upsert({
    where: { slug: 'ford-f650-box-truck' },
    update: {},
    create: {
      name: 'Ford F-650 Box Truck',
      slug: 'ford-f650-box-truck',
      description: 'Heavy-duty commercial truck with spacious cargo box. Ideal for moving, delivery services, and commercial freight applications.',
      price: 89000,
      categoryId: trucksCategory.id,
      status: 'AVAILABLE',
      images: ['/images/truck2.jpg'],
      specs: {
        fuel: '12 MPG',
        capacity: '2 seats',
        weight: '25,950 lbs',
        engine: '6.7L V8 Power Stroke Diesel',
        horsepower: '270 HP'
      }
    }
  })

  const vehicle3 = await prisma.vehicle.upsert({
    where: { slug: 'freightliner-cascadia' },
    update: {},
    create: {
      name: 'Freightliner Cascadia',
      slug: 'freightliner-cascadia',
      description: 'Professional over-the-road truck with advanced aerodynamics and fuel efficiency. Built for long-haul transportation and heavy freight.',
      price: 165000,
      categoryId: trucksCategory.id,
      status: 'AVAILABLE',
      images: ['/images/truck3.jpg'],
      specs: {
        fuel: '7.5 MPG',
        capacity: '2 seats',
        weight: '80,000 lbs',
        engine: 'Detroit DD15 14.8L',
        horsepower: '505 HP'
      }
    }
  })

  const vehicle4 = await prisma.vehicle.upsert({
    where: { slug: 'blue-bird-school-bus' },
    update: {},
    create: {
      name: 'Blue Bird School Bus',
      slug: 'blue-bird-school-bus',
      description: 'Safe and reliable school bus with modern safety features. Perfect for educational institutions and passenger transportation services.',
      price: 125000,
      categoryId: busesCategory.id,
      status: 'RESERVED',
      images: ['/images/truck4.jpg'],
      specs: {
        fuel: '8 MPG',
        capacity: '72 seats',
        weight: '34,000 lbs',
        engine: 'Cummins ISB 6.7L',
        horsepower: '260 HP'
      }
    }
  })

  const vehicle5 = await prisma.vehicle.upsert({
    where: { slug: 'isuzu-npr-hd' },
    update: {},
    create: {
      name: 'Isuzu NPR HD',
      slug: 'isuzu-npr-hd',
      description: 'Versatile medium-duty truck perfect for local deliveries and commercial applications. Known for reliability and fuel efficiency.',
      price: 58000,
      categoryId: trucksCategory.id,
      status: 'AVAILABLE',
      images: ['/images/truck1.jpg'],
      specs: {
        fuel: '13 MPG',
        capacity: '3 seats',
        weight: '14,500 lbs',
        engine: '5.2L Turbo Diesel',
        horsepower: '215 HP'
      }
    }
  })

  const vehicle6 = await prisma.vehicle.upsert({
    where: { slug: 'ford-transit-350' },
    update: {},
    create: {
      name: 'Ford Transit 350',
      slug: 'ford-transit-350',
      description: 'Popular commercial van with excellent maneuverability and cargo space. Ideal for small businesses and delivery services.',
      price: 42000,
      categoryId: vansCategory.id,
      status: 'AVAILABLE',
      images: ['/images/truck2.jpg'],
      specs: {
        fuel: '18 MPG',
        capacity: '12 seats',
        weight: '9,070 lbs',
        engine: '3.5L V6 EcoBoost',
        horsepower: '310 HP'
      }
    }
  })

  // Create sample inquiries
  console.log('Creating sample inquiries...')
  await prisma.inquiry.upsert({
    where: { id: 'inquiry-1' },
    update: {},
    create: {
      id: 'inquiry-1',
      vehicleId: vehicle1.id,
      customerName: 'John Smith',
      email: 'john.smith@company.com',
      phone: '+1 (555) 123-4567',
      message: 'I\'m interested in purchasing this Mercedes Sprinter for my delivery business. Can you provide a detailed quote including financing options?',
      status: 'NEW'
    }
  })

  await prisma.inquiry.upsert({
    where: { id: 'inquiry-2' },
    update: {},
    create: {
      id: 'inquiry-2',
      vehicleId: vehicle2.id,
      customerName: 'Sarah Johnson',
      email: 'sarah.johnson@logistics.com',
      phone: '+1 (555) 987-6543',
      message: 'Would like to schedule a visit to inspect this box truck. When would be the best time this week?',
      status: 'RESPONDED'
    }
  })

  await prisma.inquiry.upsert({
    where: { id: 'inquiry-3' },
    update: {},
    create: {
      id: 'inquiry-3',
      vehicleId: vehicle3.id,
      customerName: 'Mike Wilson',
      email: 'mike.wilson@transport.com',
      phone: '+1 (555) 456-7890',
      message: 'Looking for information about financing programs and lease options for this Freightliner.',
      status: 'NEW'
    }
  })

  console.log('✅ Database seeding completed successfully!')
  console.log(`Created:`)
  console.log(`- 3 categories`)
  console.log(`- 6 vehicles`)
  console.log(`- 3 sample inquiries`)
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })