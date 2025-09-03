const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

async function backupData() {
  try {
    console.log('Starting data backup...')

    // Fetch all data
    const [users, categories, vehicles, inquiries, settings] = await Promise.all([
      prisma.user.findMany(),
      prisma.category.findMany(),
      prisma.vehicle.findMany({
        include: {
          category: true
        }
      }),
      prisma.inquiry.findMany({
        include: {
          vehicle: true,
          user: true
        }
      }),
      prisma.settings.findMany()
    ])

    const backup = {
      timestamp: new Date().toISOString(),
      data: {
        users,
        categories,
        vehicles,
        inquiries,
        settings
      }
    }

    // Save backup to file
    const backupPath = path.join(process.cwd(), 'prisma', 'backup-data.json')
    fs.writeFileSync(backupPath, JSON.stringify(backup, null, 2))

    console.log(`Data backed up successfully to ${backupPath}`)
    console.log(`Backup contains:`)
    console.log(`- ${users.length} users`)
    console.log(`- ${categories.length} categories`)
    console.log(`- ${vehicles.length} vehicles`)
    console.log(`- ${inquiries.length} inquiries`)
    console.log(`- ${settings.length} settings`)

  } catch (error) {
    console.error('Error backing up data:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

backupData()