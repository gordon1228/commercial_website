const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient() // Will use Neon connection from .env

async function importToNeon(exportFilePath) {
  console.log('🔄 Starting Neon import process...')
  
  try {
    // Read the export file
    if (!fs.existsSync(exportFilePath)) {
      throw new Error(`Export file not found: ${exportFilePath}`)
    }

    const exportData = JSON.parse(fs.readFileSync(exportFilePath, 'utf8'))
    console.log(`📂 Reading export from: ${exportFilePath}`)
    console.log(`📅 Export date: ${exportData.exportDate}`)

    console.log('\n🧹 Clearing existing data from Neon...')
    
    // Clear existing data in reverse dependency order
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

    console.log('✅ Existing data cleared')

    console.log('\n📥 Importing data to Neon...')

    // Import users first (needed for foreign keys)
    if (exportData.users && exportData.users.length > 0) {
      console.log(`👥 Importing ${exportData.users.length} users...`)
      for (const user of exportData.users) {
        await prisma.user.create({
          data: {
            id: user.id,
            email: user.email,
            password: user.password,
            role: user.role,
            createdAt: new Date(user.createdAt),
            updatedAt: new Date(user.updatedAt)
          }
        })
      }
    }

    // Import categories (needed for vehicles)
    if (exportData.categories && exportData.categories.length > 0) {
      console.log(`📂 Importing ${exportData.categories.length} categories...`)
      for (const category of exportData.categories) {
        await prisma.category.create({
          data: {
            id: category.id,
            name: category.name,
            slug: category.slug,
            description: category.description,
            image: category.image,
            active: category.active,
            createdAt: new Date(category.createdAt),
            updatedAt: new Date(category.updatedAt)
          }
        })
      }
    }

    // Import vehicles
    if (exportData.vehicles && exportData.vehicles.length > 0) {
      console.log(`🚛 Importing ${exportData.vehicles.length} vehicles...`)
      for (const vehicle of exportData.vehicles) {
        await prisma.vehicle.create({
          data: {
            id: vehicle.id,
            name: vehicle.name,
            slug: vehicle.slug,
            description: vehicle.description,
            price: vehicle.price,
            images: vehicle.images,
            specs: vehicle.specs,
            status: vehicle.status,
            featured: vehicle.featured,
            active: vehicle.active,
            categoryId: vehicle.categoryId,
            year: vehicle.year,
            make: vehicle.make,
            fuelType: vehicle.fuelType,
            transmission: vehicle.transmission,
            createdAt: new Date(vehicle.createdAt),
            updatedAt: new Date(vehicle.updatedAt)
          }
        })
      }
    }

    // Import inquiries
    if (exportData.inquiries && exportData.inquiries.length > 0) {
      console.log(`💬 Importing ${exportData.inquiries.length} inquiries...`)
      for (const inquiry of exportData.inquiries) {
        await prisma.inquiry.create({
          data: {
            id: inquiry.id,
            vehicleId: inquiry.vehicleId,
            userId: inquiry.userId,
            customerName: inquiry.customerName,
            email: inquiry.email,
            phone: inquiry.phone,
            message: inquiry.message,
            notes: inquiry.notes,
            status: inquiry.status,
            createdAt: new Date(inquiry.createdAt),
            updatedAt: new Date(inquiry.updatedAt)
          }
        })
      }
    }

    // Import company info
    if (exportData.companyInfo && exportData.companyInfo.length > 0) {
      console.log(`🏢 Importing ${exportData.companyInfo.length} company info records...`)
      for (const info of exportData.companyInfo) {
        await prisma.companyInfo.create({
          data: {
            id: info.id,
            companyName: info.companyName,
            companyDescription: info.companyDescription,
            foundedYear: info.foundedYear,
            totalVehiclesSold: info.totalVehiclesSold,
            totalHappyCustomers: info.totalHappyCustomers,
            totalYearsExp: info.totalYearsExp,
            satisfactionRate: info.satisfactionRate,
            storyTitle: info.storyTitle,
            storyParagraph1: info.storyParagraph1,
            storyParagraph2: info.storyParagraph2,
            storyParagraph3: info.storyParagraph3,
            missionTitle: info.missionTitle,
            missionText: info.missionText,
            visionTitle: info.visionTitle,
            visionText: info.visionText,
            createdAt: new Date(info.createdAt),
            updatedAt: new Date(info.updatedAt)
          }
        })
      }
    }

    // Import company values
    if (exportData.companyValues && exportData.companyValues.length > 0) {
      console.log(`💡 Importing ${exportData.companyValues.length} company values...`)
      for (const value of exportData.companyValues) {
        await prisma.companyValue.create({
          data: {
            id: value.id,
            title: value.title,
            description: value.description,
            iconName: value.iconName,
            order: value.order,
            active: value.active,
            createdAt: new Date(value.createdAt),
            updatedAt: new Date(value.updatedAt)
          }
        })
      }
    }

    // Import certifications
    if (exportData.certifications && exportData.certifications.length > 0) {
      console.log(`🏆 Importing ${exportData.certifications.length} certifications...`)
      for (const cert of exportData.certifications) {
        await prisma.certification.create({
          data: {
            id: cert.id,
            name: cert.name,
            order: cert.order,
            active: cert.active,
            createdAt: new Date(cert.createdAt),
            updatedAt: new Date(cert.updatedAt)
          }
        })
      }
    }

    // Import contact info
    if (exportData.contactInfo && exportData.contactInfo.length > 0) {
      console.log(`📞 Importing ${exportData.contactInfo.length} contact info records...`)
      for (const contact of exportData.contactInfo) {
        await prisma.contactInfo.create({
          data: {
            id: contact.id,
            salesPhone: contact.salesPhone,
            servicePhone: contact.servicePhone,
            financePhone: contact.financePhone,
            salesEmail: contact.salesEmail,
            serviceEmail: contact.serviceEmail,
            supportEmail: contact.supportEmail,
            address: contact.address,
            city: contact.city,
            directions: contact.directions,
            mondayToFriday: contact.mondayToFriday,
            saturday: contact.saturday,
            sunday: contact.sunday,
            siteName: contact.siteName,
            emailNotifications: contact.emailNotifications,
            systemNotifications: contact.systemNotifications,
            maintenanceMode: contact.maintenanceMode,
            state: contact.state,
            postcode: contact.postcode,
            country: contact.country,
            companyDescription: contact.companyDescription,
            facebookUrl: contact.facebookUrl,
            twitterUrl: contact.twitterUrl,
            instagramUrl: contact.instagramUrl,
            linkedinUrl: contact.linkedinUrl,
            privacyPolicyUrl: contact.privacyPolicyUrl,
            termsOfServiceUrl: contact.termsOfServiceUrl,
            createdAt: new Date(contact.createdAt),
            updatedAt: new Date(contact.updatedAt)
          }
        })
      }
    }

    // Import homepage content
    if (exportData.homepageContent && exportData.homepageContent.length > 0) {
      console.log(`🏠 Importing ${exportData.homepageContent.length} homepage content records...`)
      for (const content of exportData.homepageContent) {
        await prisma.homepageContent.create({
          data: {
            id: content.id,
            heroTitle: content.heroTitle,
            heroSubtitle: content.heroSubtitle,
            heroDescription: content.heroDescription,
            heroButtonPrimary: content.heroButtonPrimary,
            heroButtonSecondary: content.heroButtonSecondary,
            happyClients: content.happyClients,
            yearsExperience: content.yearsExperience,
            satisfactionRate: content.satisfactionRate,
            partnersTitle: content.partnersTitle,
            partnersDescription: content.partnersDescription,
            feature1Title: content.feature1Title,
            feature1Description: content.feature1Description,
            feature2Title: content.feature2Title,
            feature2Description: content.feature2Description,
            feature3Title: content.feature3Title,
            feature3Description: content.feature3Description,
            comingSoonImage: content.comingSoonImage,
            comingSoonImageAlt: content.comingSoonImageAlt,
            showComingSoonSection: content.showComingSoonSection,
            showHeroSection: content.showHeroSection,
            showVehicleCategories: content.showVehicleCategories,
            showFeaturedVehicles: content.showFeaturedVehicles,
            showTrustSection: content.showTrustSection,
            createdAt: new Date(content.createdAt),
            updatedAt: new Date(content.updatedAt)
          }
        })
      }
    }

    // Import technology content
    if (exportData.technologyContent && exportData.technologyContent.length > 0) {
      console.log(`⚡ Importing ${exportData.technologyContent.length} technology content records...`)
      for (const tech of exportData.technologyContent) {
        await prisma.technologyContent.create({
          data: {
            id: tech.id,
            heroTitle: tech.heroTitle,
            heroSubtitle: tech.heroSubtitle,
            heroBackgroundImage: tech.heroBackgroundImage,
            heroBackgroundImageAlt: tech.heroBackgroundImageAlt,
            section1Title: tech.section1Title,
            section1Description: tech.section1Description,
            section2Title: tech.section2Title,
            section2Description: tech.section2Description,
            section3Title: tech.section3Title,
            section3Description: tech.section3Description,
            section4Title: tech.section4Title,
            section4Description: tech.section4Description,
            createdAt: new Date(tech.createdAt),
            updatedAt: new Date(tech.updatedAt)
          }
        })
      }
    }

    // Import technology features
    if (exportData.technologyFeatures && exportData.technologyFeatures.length > 0) {
      console.log(`🔧 Importing ${exportData.technologyFeatures.length} technology features...`)
      for (const feature of exportData.technologyFeatures) {
        await prisma.technologyFeature.create({
          data: {
            id: feature.id,
            title: feature.title,
            description: feature.description,
            iconName: feature.iconName,
            order: feature.order,
            active: feature.active,
            createdAt: new Date(feature.createdAt),
            updatedAt: new Date(feature.updatedAt)
          }
        })
      }
    }

    // Get final counts
    const finalCounts = {
      users: await prisma.user.count(),
      categories: await prisma.category.count(),
      vehicles: await prisma.vehicle.count(),
      inquiries: await prisma.inquiry.count(),
      homepageContent: await prisma.homepageContent.count(),
      companyInfo: await prisma.companyInfo.count(),
      companyValues: await prisma.companyValue.count(),
      certifications: await prisma.certification.count(),
      contactInfo: await prisma.contactInfo.count(),
      technologyContent: await prisma.technologyContent.count(),
      technologyFeatures: await prisma.technologyFeature.count()
    }

    console.log('\n✅ Import completed successfully!')
    console.log('\n📈 Final counts in Neon:')
    Object.entries(finalCounts).forEach(([table, count]) => {
      console.log(`  - ${table}: ${count} records`)
    })

    return finalCounts

  } catch (error) {
    console.error('❌ Import failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  // Get the most recent export file
  const exportsDir = path.join(process.cwd(), 'exports')
  const exportFiles = fs.readdirSync(exportsDir)
    .filter(file => file.startsWith('supabase-export-') && file.endsWith('.json'))
    .sort()
    .reverse()

  if (exportFiles.length === 0) {
    console.error('❌ No export files found. Please run export-supabase-data.js first.')
    process.exit(1)
  }

  const latestExportFile = path.join(exportsDir, exportFiles[0])
  console.log(`📂 Using latest export file: ${latestExportFile}`)

  importToNeon(latestExportFile)
    .then((counts) => {
      console.log('\n🎉 Data successfully migrated from Supabase to Neon!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Migration failed:', error)
      process.exit(1)
    })
}

module.exports = { importToNeon }