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
      slug: 'trucks',
      description: 'Heavy-duty commercial trucks for freight and cargo transport',
      image: '/images/truck3.jpg'
    }
  })

  const vansCategory = await prisma.category.upsert({
    where: { slug: 'vans' },
    update: {},
    create: {
      name: 'Delivery Vans',
      slug: 'vans',
      description: 'Commercial vans perfect for deliveries and small cargo transport',
      image: '/images/truck1.jpg'
    }
  })

  const busesCategory = await prisma.category.upsert({
    where: { slug: 'buses' },
    update: {},
    create: {
      name: 'Passenger Buses',
      slug: 'buses',
      description: 'Comfortable buses for passenger transportation',
      image: '/images/truck4.jpg'
    }
  })

  // Create vehicles
  console.log('Creating vehicles...')
  await prisma.vehicle.upsert({
    where: { slug: 'mercedes-sprinter-3500' },
    update: {},
    create: {
      name: 'Mercedes Sprinter 3500',
      slug: 'mercedes-sprinter-3500',
      description: 'Premium commercial van with excellent fuel efficiency and cargo capacity. Perfect for delivery services, passenger transport, and commercial applications.',
      price: 75000,
      year: 2023,
      make: 'Mercedes-Benz',
      model: 'Sprinter 3500',
      mileage: 12500,
      fuelType: 'DIESEL',
      transmission: 'AUTOMATIC',
      categoryId: vansCategory.id,
      status: 'AVAILABLE',
      images: ['/images/truck1.jpg'],
      specifications: {
        engine: '3.0L V6 Turbo Diesel',
        horsepower: '188 HP',
        torque: '325 lb-ft',
        fuelCapacity: '24.5 gallons',
        cargoVolume: '319 cubic feet',
        payloadCapacity: '5,415 lbs',
        towingCapacity: '7,500 lbs',
        wheelbase: '144 inches'
      },
      features: [
        'Mercedes MBUX infotainment system',
        'Advanced safety features',
        'LED headlights',
        'Power sliding doors',
        'Rear-view camera',
        'Bluetooth connectivity',
        'USB charging ports',
        'Climate control'
      ]
    }
  })

  await prisma.vehicle.upsert({
    where: { slug: 'ford-f650-box-truck' },
    update: {},
    create: {
      name: 'Ford F-650 Box Truck',
      slug: 'ford-f650-box-truck',
      description: 'Heavy-duty commercial truck with spacious cargo box. Ideal for moving, delivery services, and commercial freight applications.',
      price: 89000,
      year: 2022,
      make: 'Ford',
      model: 'F-650',
      mileage: 25000,
      fuelType: 'DIESEL',
      transmission: 'AUTOMATIC',
      categoryId: trucksCategory.id,
      status: 'AVAILABLE',
      images: ['/images/truck2.jpg'],
      specifications: {
        engine: '6.7L V8 Power Stroke Diesel',
        horsepower: '270 HP',
        torque: '675 lb-ft',
        gvwr: '25,950 lbs',
        cargoBoxLength: '24 feet',
        cargoBoxWidth: '8 feet',
        cargoBoxHeight: '9 feet',
        wheelbase: '228 inches'
      },
      features: [
        'Power liftgate',
        'Roll-up rear door',
        'Side access doors',
        'Non-slip flooring',
        'Interior lighting',
        'Tie-down rails',
        'SYNC 3 infotainment',
        'Air conditioning'
      ]
    }
  })

  await prisma.vehicle.upsert({
    where: { slug: 'freightliner-cascadia' },
    update: {},
    create: {
      name: 'Freightliner Cascadia',
      slug: 'freightliner-cascadia',
      description: 'Professional over-the-road truck with advanced aerodynamics and fuel efficiency. Built for long-haul transportation and heavy freight.',
      price: 165000,
      year: 2024,
      make: 'Freightliner',
      model: 'Cascadia',
      mileage: 5000,
      fuelType: 'DIESEL',
      transmission: 'AUTOMATIC',
      categoryId: trucksCategory.id,
      status: 'AVAILABLE',
      images: ['/images/truck3.jpg'],
      specifications: {
        engine: 'Detroit DD15 14.8L',
        horsepower: '505 HP',
        torque: '1,850 lb-ft',
        gvwr: '80,000 lbs',
        fuelCapacity: '150 gallons',
        sleeperSize: '72-inch mid-roof',
        wheelbase: '244 inches',
        axleConfiguration: '6x4'
      },
      features: [
        'Detroit Assurance suite',
        'Collision mitigation',
        'Lane departure warning',
        'Adaptive cruise control',
        'Premium sleeper berth',
        'Refrigerator and microwave',
        'LED lighting package',
        'Air suspension seats'
      ]
    }
  })

  await prisma.vehicle.upsert({
    where: { slug: 'blue-bird-school-bus' },
    update: {},
    create: {
      name: 'Blue Bird School Bus',
      slug: 'blue-bird-school-bus',
      description: 'Safe and reliable school bus with modern safety features. Perfect for educational institutions and passenger transportation services.',
      price: 125000,
      year: 2023,
      make: 'Blue Bird',
      model: 'Vision',
      mileage: 8000,
      fuelType: 'DIESEL',
      transmission: 'AUTOMATIC',
      categoryId: busesCategory.id,
      status: 'RESERVED',
      images: ['/images/truck4.jpg'],
      specifications: {
        engine: 'Cummins ISB 6.7L',
        horsepower: '260 HP',
        torque: '660 lb-ft',
        capacity: '72 passengers',
        length: '40 feet',
        width: '8 feet',
        height: '10.5 feet',
        wheelbase: '254 inches'
      },
      features: [
        'Advanced safety systems',
        'LED lighting throughout',
        'Security cameras',
        'GPS tracking',
        'Wheelchair accessibility',
        'Air conditioning',
        'Public address system',
        'Emergency exits'
      ]
    }
  })

  await prisma.vehicle.upsert({
    where: { slug: 'isuzu-npr-hd' },
    update: {},
    create: {
      name: 'Isuzu NPR HD',
      slug: 'isuzu-npr-hd',
      description: 'Versatile medium-duty truck perfect for local deliveries and commercial applications. Known for reliability and fuel efficiency.',
      price: 58000,
      year: 2023,
      make: 'Isuzu',
      model: 'NPR HD',
      mileage: 15000,
      fuelType: 'DIESEL',
      transmission: 'AUTOMATIC',
      categoryId: trucksCategory.id,
      status: 'AVAILABLE',
      images: ['/images/truck1.jpg'],
      specifications: {
        engine: '5.2L Turbo Diesel',
        horsepower: '215 HP',
        torque: '452 lb-ft',
        gvwr: '14,500 lbs',
        cargoArea: '14 x 7.5 x 6 feet',
        wheelbase: '150 inches',
        turningRadius: '21.7 feet'
      },
      features: [
        'Eco-Max transmission',
        'Anti-lock braking system',
        'Electronic stability control',
        'Tilt and telescoping wheel',
        'Power windows and locks',
        'AM/FM/CD stereo',
        'Air conditioning',
        'Cruise control'
      ]
    }
  })

  await prisma.vehicle.upsert({
    where: { slug: 'ford-transit-350' },
    update: {},
    create: {
      name: 'Ford Transit 350',
      slug: 'ford-transit-350',
      description: 'Popular commercial van with excellent maneuverability and cargo space. Ideal for small businesses and delivery services.',
      price: 42000,
      year: 2022,
      make: 'Ford',
      model: 'Transit 350',
      mileage: 35000,
      fuelType: 'GASOLINE',
      transmission: 'AUTOMATIC',
      categoryId: vansCategory.id,
      status: 'AVAILABLE',
      images: ['/images/truck2.jpg'],
      specifications: {
        engine: '3.5L V6 EcoBoost',
        horsepower: '310 HP',
        torque: '400 lb-ft',
        cargoVolume: '246 cubic feet',
        payloadCapacity: '4,650 lbs',
        towingCapacity: '6,500 lbs',
        fuelCapacity: '25 gallons'
      },
      features: [
        'SYNC 3 with 8-inch touchscreen',
        'Rear-view camera',
        'Ford Co-Pilot360',
        'Power windows and locks',
        'Keyless entry',
        'Dual sliding doors',
        'Partition wall',
        'Floor tie-downs'
      ]
    }
  })

  // Create sample inquiries
  console.log('Creating sample inquiries...')
  const sprinterVehicle = await prisma.vehicle.findUnique({ where: { slug: 'mercedes-sprinter-3500' } })
  const fordTruck = await prisma.vehicle.findUnique({ where: { slug: 'ford-f650-box-truck' } })

  if (sprinterVehicle) {
    await prisma.inquiry.upsert({
      where: { id: 'inquiry-1' },
      update: {},
      create: {
        id: 'inquiry-1',
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@company.com',
        phone: '+1 (555) 123-4567',
        company: 'Smith Logistics',
        inquiryType: 'QUOTE',
        vehicleId: sprinterVehicle.id,
        message: 'I\'m interested in purchasing this Mercedes Sprinter for my delivery business. Can you provide a detailed quote including financing options?',
        preferredContact: 'EMAIL',
        status: 'NEW'
      }
    })
  }

  if (fordTruck) {
    await prisma.inquiry.upsert({
      where: { id: 'inquiry-2' },
      update: {},
      create: {
        id: 'inquiry-2',
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.johnson@logistics.com',
        phone: '+1 (555) 987-6543',
        company: 'Johnson Freight',
        inquiryType: 'VISIT',
        vehicleId: fordTruck.id,
        message: 'Would like to schedule a visit to inspect this box truck. When would be the best time this week?',
        preferredContact: 'PHONE',
        status: 'RESPONDED'
      }
    })
  }

  await prisma.inquiry.upsert({
    where: { id: 'inquiry-3' },
    update: {},
    create: {
      id: 'inquiry-3',
      firstName: 'Mike',
      lastName: 'Wilson',
      email: 'mike.wilson@transport.com',
      phone: '+1 (555) 456-7890',
      company: 'Wilson Transport',
      inquiryType: 'GENERAL',
      message: 'Looking for information about your financing programs and what types of commercial vehicles you have available for lease.',
      preferredContact: 'EMAIL',
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