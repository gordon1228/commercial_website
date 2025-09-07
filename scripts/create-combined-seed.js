const fs = require('fs')
const path = require('path')

function createCombinedSeed() {
  console.log('🔄 Creating combined seed file from Supabase export...')

  try {
    // Read the export file
    const exportsDir = path.join(process.cwd(), 'exports')
    const exportFiles = fs.readdirSync(exportsDir)
      .filter(file => file.startsWith('supabase-export-') && file.endsWith('.json'))
      .sort()
      .reverse()

    if (exportFiles.length === 0) {
      throw new Error('No export files found')
    }

    const exportPath = path.join(exportsDir, exportFiles[0])
    const exportData = JSON.parse(fs.readFileSync(exportPath, 'utf8'))

    // Generate TypeScript seed file
    const seedContent = `import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding with imported Supabase data...')

  try {
    // Clear existing data
    console.log('🧹 Clearing existing data...')
    await prisma.inquiry.deleteMany()
    await prisma.vehicle.deleteMany()
    await prisma.category.deleteMany()
    await prisma.user.deleteMany()
    await prisma.technologyFeature.deleteMany()
    await prisma.technologyContent.deleteMany()
    await prisma.contactInfo.deleteMany()
    await prisma.certification.deleteMany()
    await prisma.companyValue.deleteMany()
    await prisma.companyInfo.deleteMany()
    await prisma.homepageContent.deleteMany()

    // Import users
    console.log('Creating users...')
${exportData.users.map(user => `    await prisma.user.create({
      data: {
        id: '${user.id}',
        email: '${user.email}',
        password: '${user.password}',
        role: '${user.role}',
        createdAt: new Date('${user.createdAt}'),
        updatedAt: new Date('${user.updatedAt}')
      }
    })`).join('\n\n')}

    // Import categories
    console.log('Creating categories...')
${exportData.categories.map(category => `    await prisma.category.create({
      data: {
        id: '${category.id}',
        name: '${category.name}',
        slug: '${category.slug}',
        description: ${category.description ? `'${category.description.replace(/'/g, "\\'")}'` : 'null'},
        image: ${category.image ? `'${category.image}'` : 'null'},
        active: ${category.active},
        createdAt: new Date('${category.createdAt}'),
        updatedAt: new Date('${category.updatedAt}')
      }
    })`).join('\n\n')}

    // Import vehicles
    console.log('Creating vehicles...')
${exportData.vehicles.map(vehicle => `    await prisma.vehicle.create({
      data: {
        id: '${vehicle.id}',
        name: '${vehicle.name.replace(/'/g, "\\'")}',
        slug: '${vehicle.slug}',
        description: ${vehicle.description ? `'${vehicle.description.replace(/'/g, "\\'")}'` : 'null'},
        price: ${vehicle.price},
        images: ${JSON.stringify(vehicle.images)},
        specs: ${vehicle.specs ? JSON.stringify(vehicle.specs) : 'null'},
        status: '${vehicle.status}',
        featured: ${vehicle.featured},
        active: ${vehicle.active},
        categoryId: '${vehicle.categoryId}',
        year: ${vehicle.year},
        make: ${vehicle.make ? `'${vehicle.make}'` : 'null'},
        fuelType: ${vehicle.fuelType ? `'${vehicle.fuelType}'` : 'null'},
        transmission: ${vehicle.transmission ? `'${vehicle.transmission}'` : 'null'},
        createdAt: new Date('${vehicle.createdAt}'),
        updatedAt: new Date('${vehicle.updatedAt}')
      }
    })`).join('\n\n')}

    // Import inquiries
    console.log('Creating inquiries...')
${exportData.inquiries.map(inquiry => `    await prisma.inquiry.create({
      data: {
        id: '${inquiry.id}',
        vehicleId: ${inquiry.vehicleId ? `'${inquiry.vehicleId}'` : 'null'},
        userId: ${inquiry.userId ? `'${inquiry.userId}'` : 'null'},
        customerName: '${inquiry.customerName.replace(/'/g, "\\'")}',
        email: '${inquiry.email}',
        phone: ${inquiry.phone ? `'${inquiry.phone}'` : 'null'},
        message: '${inquiry.message.replace(/'/g, "\\'")}',
        notes: ${inquiry.notes ? `'${inquiry.notes.replace(/'/g, "\\'")}'` : 'null'},
        status: '${inquiry.status}',
        createdAt: new Date('${inquiry.createdAt}'),
        updatedAt: new Date('${inquiry.updatedAt}')
      }
    })`).join('\n\n')}

    // Import company info
    console.log('Creating company info...')
${exportData.companyInfo.map(info => `    await prisma.companyInfo.create({
      data: {
        id: '${info.id}',
        companyName: '${info.companyName}',
        companyDescription: '${info.companyDescription.replace(/'/g, "\\'")}',
        foundedYear: ${info.foundedYear},
        totalVehiclesSold: ${info.totalVehiclesSold},
        totalHappyCustomers: ${info.totalHappyCustomers},
        totalYearsExp: ${info.totalYearsExp},
        satisfactionRate: ${info.satisfactionRate},
        storyTitle: '${info.storyTitle}',
        storyParagraph1: '${info.storyParagraph1.replace(/'/g, "\\'")}',
        storyParagraph2: '${info.storyParagraph2.replace(/'/g, "\\'")}',
        storyParagraph3: '${info.storyParagraph3.replace(/'/g, "\\'")}',
        missionTitle: '${info.missionTitle}',
        missionText: '${info.missionText.replace(/'/g, "\\'")}',
        visionTitle: '${info.visionTitle}',
        visionText: '${info.visionText.replace(/'/g, "\\'")}',
        createdAt: new Date('${info.createdAt}'),
        updatedAt: new Date('${info.updatedAt}')
      }
    })`).join('\n\n')}

    // Import company values
    console.log('Creating company values...')
${exportData.companyValues.map(value => `    await prisma.companyValue.create({
      data: {
        id: '${value.id}',
        title: '${value.title}',
        description: '${value.description.replace(/'/g, "\\'")}',
        iconName: '${value.iconName}',
        order: ${value.order},
        active: ${value.active},
        createdAt: new Date('${value.createdAt}'),
        updatedAt: new Date('${value.updatedAt}')
      }
    })`).join('\n\n')}

    // Import certifications
    console.log('Creating certifications...')
${exportData.certifications.map(cert => `    await prisma.certification.create({
      data: {
        id: '${cert.id}',
        name: '${cert.name.replace(/'/g, "\\'")}',
        order: ${cert.order},
        active: ${cert.active},
        createdAt: new Date('${cert.createdAt}'),
        updatedAt: new Date('${cert.updatedAt}')
      }
    })`).join('\n\n')}

    // Import contact info
    console.log('Creating contact info...')
${exportData.contactInfo.map(contact => `    await prisma.contactInfo.create({
      data: {
        id: '${contact.id}',
        salesPhone: '${contact.salesPhone}',
        servicePhone: '${contact.servicePhone}',
        financePhone: '${contact.financePhone}',
        salesEmail: '${contact.salesEmail}',
        serviceEmail: '${contact.serviceEmail}',
        supportEmail: '${contact.supportEmail}',
        address: '${contact.address}',
        city: '${contact.city}',
        directions: '${contact.directions}',
        mondayToFriday: '${contact.mondayToFriday}',
        saturday: '${contact.saturday}',
        sunday: '${contact.sunday}',
        siteName: '${contact.siteName}',
        emailNotifications: ${contact.emailNotifications},
        systemNotifications: ${contact.systemNotifications},
        maintenanceMode: ${contact.maintenanceMode},
        state: '${contact.state}',
        postcode: '${contact.postcode}',
        country: '${contact.country}',
        companyDescription: '${contact.companyDescription.replace(/'/g, "\\'")}',
        facebookUrl: '${contact.facebookUrl}',
        twitterUrl: '${contact.twitterUrl}',
        instagramUrl: '${contact.instagramUrl}',
        linkedinUrl: '${contact.linkedinUrl}',
        privacyPolicyUrl: '${contact.privacyPolicyUrl}',
        termsOfServiceUrl: '${contact.termsOfServiceUrl}',
        createdAt: new Date('${contact.createdAt}'),
        updatedAt: new Date('${contact.updatedAt}')
      }
    })`).join('\n\n')}

    // Import homepage content
    console.log('Creating homepage content...')
${exportData.homepageContent.map(content => `    await prisma.homepageContent.create({
      data: {
        id: '${content.id}',
        heroTitle: '${content.heroTitle}',
        heroSubtitle: '${content.heroSubtitle}',
        heroDescription: '${content.heroDescription.replace(/'/g, "\\'")}',
        heroButtonPrimary: '${content.heroButtonPrimary}',
        heroButtonSecondary: '${content.heroButtonSecondary}',
        happyClients: ${content.happyClients},
        yearsExperience: ${content.yearsExperience},
        satisfactionRate: ${content.satisfactionRate},
        partnersTitle: '${content.partnersTitle}',
        partnersDescription: '${content.partnersDescription.replace(/'/g, "\\'")}',
        feature1Title: '${content.feature1Title}',
        feature1Description: '${content.feature1Description.replace(/'/g, "\\'")}',
        feature2Title: '${content.feature2Title}',
        feature2Description: '${content.feature2Description.replace(/'/g, "\\'")}',
        feature3Title: '${content.feature3Title}',
        feature3Description: '${content.feature3Description.replace(/'/g, "\\'")}',
        comingSoonImage: '${content.comingSoonImage}',
        comingSoonImageAlt: '${content.comingSoonImageAlt}',
        showComingSoonSection: ${content.showComingSoonSection},
        showHeroSection: ${content.showHeroSection},
        showVehicleCategories: ${content.showVehicleCategories},
        showFeaturedVehicles: ${content.showFeaturedVehicles},
        showTrustSection: ${content.showTrustSection},
        createdAt: new Date('${content.createdAt}'),
        updatedAt: new Date('${content.updatedAt}')
      }
    })`).join('\n\n')}

    // Import technology content
    console.log('Creating technology content...')
${exportData.technologyContent.map(tech => `    await prisma.technologyContent.create({
      data: {
        id: '${tech.id}',
        heroTitle: '${tech.heroTitle}',
        heroSubtitle: '${tech.heroSubtitle.replace(/'/g, "\\'")}',
        heroBackgroundImage: '${tech.heroBackgroundImage}',
        heroBackgroundImageAlt: '${tech.heroBackgroundImageAlt}',
        section1Title: '${tech.section1Title}',
        section1Description: '${tech.section1Description.replace(/'/g, "\\'")}',
        section2Title: '${tech.section2Title}',
        section2Description: '${tech.section2Description.replace(/'/g, "\\'")}',
        section3Title: '${tech.section3Title}',
        section3Description: '${tech.section3Description.replace(/'/g, "\\'")}',
        section4Title: '${tech.section4Title}',
        section4Description: '${tech.section4Description.replace(/'/g, "\\'")}',
        createdAt: new Date('${tech.createdAt}'),
        updatedAt: new Date('${tech.updatedAt}')
      }
    })`).join('\n\n')}

    // Import technology features
    console.log('Creating technology features...')
${exportData.technologyFeatures.map(feature => `    await prisma.technologyFeature.create({
      data: {
        id: '${feature.id}',
        title: '${feature.title}',
        description: '${feature.description.replace(/'/g, "\\'")}',
        iconName: '${feature.iconName}',
        order: ${feature.order},
        active: ${feature.active},
        createdAt: new Date('${feature.createdAt}'),
        updatedAt: new Date('${feature.updatedAt}')
      }
    })`).join('\n\n')}

    // Get final counts
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

    console.log('✅ Database seeding completed successfully!')
    console.log('📊 Created:')
    console.log(\`- \${userCount} user(s)\`)
    console.log(\`- \${categoryCount} categories\`)
    console.log(\`- \${vehicleCount} vehicles\`)
    console.log(\`- \${inquiryCount} inquiries\`)
    console.log(\`- \${contactInfoCount} contact info record(s)\`)
    console.log(\`- \${companyInfoCount} company info record(s)\`)
    console.log(\`- \${companyValueCount} company values\`)
    console.log(\`- \${certificationCount} certifications\`)
    console.log(\`- \${homepageContentCount} homepage content record(s)\`)
    console.log(\`- \${technologyContentCount} technology content record(s)\`)
    console.log(\`- \${technologyFeatureCount} technology features\`)
    console.log('🎉 Your EVTL database is now populated with Supabase data!')

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
`

    // Write the new seed file
    const seedPath = path.join(process.cwd(), 'prisma', 'seed-from-supabase.ts')
    fs.writeFileSync(seedPath, seedContent)

    console.log(`✅ Combined seed file created: ${seedPath}`)
    console.log(`📊 Data source: ${exportPath}`)
    console.log(`📅 Export date: ${exportData.exportDate}`)

    return seedPath

  } catch (error) {
    console.error('❌ Failed to create combined seed:', error)
    throw error
  }
}

if (require.main === module) {
  createCombinedSeed()
    .then((seedPath) => {
      console.log(`\n🎉 Combined seed file ready at: ${seedPath}`)
      console.log('💡 You can now run: npm run db:seed-from-supabase')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Failed:', error)
      process.exit(1)
    })
}

module.exports = { createCombinedSeed }