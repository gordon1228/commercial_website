const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const defaultPartners = [
  { name: 'Mercedes', logo: '/images/truck1.jpg', order: 1 },
  { name: 'Ford', logo: '/images/truck2.jpg', order: 2 },
  { name: 'Freightliner', logo: '/images/truck3.jpg', order: 3 },
  { name: 'Volvo', logo: '/images/truck4.jpg', order: 4 },
  { name: 'Peterbilt', logo: '/images/truck1.jpg', order: 5 },
  { name: 'Kenworth', logo: '/images/truck2.jpg', order: 6 }
]

async function seedPartners() {
  try {
    console.log('Checking existing partners...')
    
    const existingPartners = await prisma.partner.count()
    
    if (existingPartners > 0) {
      console.log(`Found ${existingPartners} existing partners. Skipping seed.`)
      return
    }

    console.log('Seeding partners...')
    
    for (const partner of defaultPartners) {
      await prisma.partner.create({
        data: partner
      })
      console.log(`Created partner: ${partner.name}`)
    }
    
    console.log('Partners seeded successfully!')
    
  } catch (error) {
    console.error('Error seeding partners:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedPartners()