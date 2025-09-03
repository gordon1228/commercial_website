const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

async function seedFromExport() {
  try {
    console.log('🌱 Seeding database from exported data...')
    
    // Read exported data
    const exportPath = path.join(__dirname, './exported-data.json')
    const exportData = JSON.parse(fs.readFileSync(exportPath, 'utf8'))
    
    console.log(`📄 Loaded export from: ${exportData.exportedAt}`)
    
    // Seed Users
    console.log('👤 Seeding users...')
    for (const user of exportData.users) {
      await prisma.user.upsert({
        where: { id: user.id },
        update: {},
        create: {
          id: user.id,
          email: user.email,
          password: user.password,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        }
      })
    }
    console.log(`✅ Created ${exportData.users.length} users`)

    // Seed Categories
    console.log('🏷️  Seeding categories...')
    for (const category of exportData.categories) {
      await prisma.category.upsert({
        where: { id: category.id },
        update: {},
        create: {
          id: category.id,
          name: category.name,
          slug: category.slug,
          description: category.description,
          image: category.image,
        }
      })
    }
    console.log(`✅ Created ${exportData.categories.length} categories`)

    // Seed Vehicles
    console.log('🚛 Seeding vehicles...')
    for (const vehicle of exportData.vehicles) {
      await prisma.vehicle.upsert({
        where: { id: vehicle.id },
        update: {},
        create: {
          id: vehicle.id,
          name: vehicle.name,
          slug: vehicle.slug,
          description: vehicle.description,
          price: vehicle.price,
          images: vehicle.images,
          specs: vehicle.specs,
          status: vehicle.status,
          featured: vehicle.featured,
          categoryId: vehicle.categoryId,
          year: vehicle.year,
          make: vehicle.make,
          model: vehicle.model,
          mileage: vehicle.mileage,
          fuelType: vehicle.fuelType,
          transmission: vehicle.transmission,
          features: vehicle.features,
          createdAt: vehicle.createdAt,
          updatedAt: vehicle.updatedAt,
        }
      })
    }
    console.log(`✅ Created ${exportData.vehicles.length} vehicles`)

    // Seed Inquiries
    console.log('💬 Seeding inquiries...')
    for (const inquiry of exportData.inquiries) {
      await prisma.inquiry.upsert({
        where: { id: inquiry.id },
        update: {},
        create: {
          id: inquiry.id,
          vehicleId: inquiry.vehicleId,
          userId: inquiry.userId,
          customerName: inquiry.customerName,
          email: inquiry.email,
          phone: inquiry.phone,
          message: inquiry.message,
          notes: inquiry.notes,
          status: inquiry.status,
          createdAt: inquiry.createdAt,
          updatedAt: inquiry.updatedAt,
        }
      })
    }
    console.log(`✅ Created ${exportData.inquiries.length} inquiries`)

    // Seed Settings
    console.log('⚙️  Seeding settings...')
    for (const setting of exportData.settings) {
      await prisma.settings.upsert({
        where: { id: setting.id },
        update: {},
        create: {
          id: setting.id,
          siteName: setting.siteName,
          contactEmail: setting.contactEmail,
          supportPhone: setting.supportPhone,
          address: setting.address,
          emailNotifications: setting.emailNotifications,
          systemNotifications: setting.systemNotifications,
          maintenanceMode: setting.maintenanceMode,
          createdAt: setting.createdAt,
          updatedAt: setting.updatedAt,
        }
      })
    }
    console.log(`✅ Created ${exportData.settings.length} settings`)

    console.log('🎉 Database seeded successfully with all existing data!')
    console.log(`📊 Summary:`)
    console.log(`   - Users: ${exportData.users.length}`)
    console.log(`   - Categories: ${exportData.categories.length}`)
    console.log(`   - Vehicles: ${exportData.vehicles.length}`)
    console.log(`   - Inquiries: ${exportData.inquiries.length}`)
    console.log(`   - Settings: ${exportData.settings.length}`)

  } catch (error) {
    console.error('❌ Seeding failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run if called directly
if (require.main === module) {
  seedFromExport()
    .then(() => process.exit(0))
    .catch(() => process.exit(1))
}

module.exports = { seedFromExport }