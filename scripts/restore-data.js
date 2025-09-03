const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

async function restoreData() {
  try {
    console.log('Starting data restore...')

    // Read backup file
    const backupPath = path.join(process.cwd(), 'prisma', 'backup-data.json')
    if (!fs.existsSync(backupPath)) {
      throw new Error('Backup file not found at ' + backupPath)
    }

    const backup = JSON.parse(fs.readFileSync(backupPath, 'utf8'))
    const { users, categories, vehicles, inquiries, settings } = backup.data

    console.log(`Restoring data from backup created at: ${backup.timestamp}`)

    // Restore in order (respecting foreign key dependencies)
    
    // 1. Users first
    console.log('Restoring users...')
    for (const user of users) {
      await prisma.user.upsert({
        where: { id: user.id },
        update: {
          email: user.email,
          password: user.password,
          role: user.role,
          updatedAt: user.updatedAt
        },
        create: {
          id: user.id,
          email: user.email,
          password: user.password,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      })
    }

    // 2. Categories
    console.log('Restoring categories...')
    for (const category of categories) {
      await prisma.category.upsert({
        where: { id: category.id },
        update: {
          name: category.name,
          slug: category.slug,
          description: category.description,
          image: category.image,
          active: true,
          updatedAt: category.updatedAt || new Date()
        },
        create: {
          id: category.id,
          name: category.name,
          slug: category.slug,
          description: category.description,
          image: category.image,
          active: true, // Set all existing categories as active
          createdAt: category.createdAt || new Date(),
          updatedAt: category.updatedAt || new Date()
        }
      })
    }

    // 3. Vehicles
    console.log('Restoring vehicles...')
    for (const vehicle of vehicles) {
      await prisma.vehicle.upsert({
        where: { id: vehicle.id },
        update: {
          name: vehicle.name,
          slug: vehicle.slug,
          description: vehicle.description,
          price: vehicle.price,
          images: vehicle.images,
          specs: vehicle.specs,
          status: vehicle.status,
          featured: vehicle.featured || false,
          active: true,
          categoryId: vehicle.categoryId,
          year: vehicle.year,
          make: vehicle.make,
          model: vehicle.model,
          mileage: vehicle.mileage,
          fuelType: vehicle.fuelType,
          transmission: vehicle.transmission,
          features: vehicle.features || [],
          updatedAt: vehicle.updatedAt
        },
        create: {
          id: vehicle.id,
          name: vehicle.name,
          slug: vehicle.slug,
          description: vehicle.description,
          price: vehicle.price,
          images: vehicle.images,
          specs: vehicle.specs,
          status: vehicle.status,
          featured: vehicle.featured || false,
          active: true, // Set all existing vehicles as active
          categoryId: vehicle.categoryId,
          year: vehicle.year,
          make: vehicle.make,
          model: vehicle.model,
          mileage: vehicle.mileage,
          fuelType: vehicle.fuelType,
          transmission: vehicle.transmission,
          features: vehicle.features || [],
          createdAt: vehicle.createdAt,
          updatedAt: vehicle.updatedAt
        }
      })
    }

    // 4. Inquiries
    console.log('Restoring inquiries...')
    for (const inquiry of inquiries) {
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
          createdAt: inquiry.createdAt,
          updatedAt: inquiry.updatedAt
        }
      })
    }

    // 5. Settings
    console.log('Restoring settings...')
    for (const setting of settings) {
      await prisma.settings.create({
        data: {
          id: setting.id,
          siteName: setting.siteName,
          contactEmail: setting.contactEmail,
          supportPhone: setting.supportPhone,
          address: setting.address,
          emailNotifications: setting.emailNotifications,
          systemNotifications: setting.systemNotifications,
          maintenanceMode: setting.maintenanceMode,
          createdAt: setting.createdAt,
          updatedAt: setting.updatedAt
        }
      })
    }

    console.log('Data restored successfully!')
    console.log(`Restored:`)
    console.log(`- ${users.length} users`)
    console.log(`- ${categories.length} categories (all set as active)`)
    console.log(`- ${vehicles.length} vehicles (all set as active)`)
    console.log(`- ${inquiries.length} inquiries`)
    console.log(`- ${settings.length} settings`)

  } catch (error) {
    console.error('Error restoring data:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

restoreData()