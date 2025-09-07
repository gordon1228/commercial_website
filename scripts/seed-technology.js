const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function seedTechnologyContent() {
  console.log('🌱 Seeding technology content...')

  try {
    // Check if technology content already exists
    const existingContent = await prisma.technologyContent.findFirst()
    
    if (existingContent) {
      console.log('✅ Technology content already exists')
      return
    }

    // Create default technology content
    const content = await prisma.technologyContent.create({
      data: {
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
    })

    console.log('✅ Created technology content:', content.id)

    // Create some default technology features
    const features = [
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

    for (const feature of features) {
      const created = await prisma.technologyFeature.create({
        data: feature
      })
      console.log('✅ Created technology feature:', created.title)
    }

    console.log('🎉 Technology content seeding completed successfully!')

  } catch (error) {
    console.error('❌ Error seeding technology content:', error)
    throw error
  }
}

if (require.main === module) {
  seedTechnologyContent()
    .catch((e) => {
      console.error(e)
      process.exit(1)
    })
    .finally(async () => {
      await prisma.$disconnect()
    })
}

module.exports = { seedTechnologyContent }