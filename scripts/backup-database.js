const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

async function backupDatabase() {
  try {
    console.log('🔄 Starting database backup...')
    
    const backupData = {
      timestamp: new Date().toISOString(),
      tables: {}
    }

    // Backup all critical tables
    console.log('📦 Backing up Settings table...')
    backupData.tables.settings = await prisma.settings.findMany()
    
    console.log('📦 Backing up ContactInfo table...')
    backupData.tables.contactInfo = await prisma.contactInfo.findMany()
    
    console.log('📦 Backing up Vehicles table...')
    backupData.tables.vehicles = await prisma.vehicle.findMany({
      include: {
        category: true
      }
    })
    
    console.log('📦 Backing up CompanyValue table...')
    backupData.tables.companyValues = await prisma.companyValue.findMany()
    
    console.log('📦 Backing up TeamMember table...')
    backupData.tables.teamMembers = await prisma.teamMember.findMany()
    
    console.log('📦 Backing up Certification table...')
    backupData.tables.certifications = await prisma.certification.findMany()
    
    console.log('📦 Backing up other essential tables...')
    backupData.tables.users = await prisma.user.findMany()
    backupData.tables.categories = await prisma.category.findMany()
    backupData.tables.inquiries = await prisma.inquiry.findMany()
    backupData.tables.homepageContent = await prisma.homepageContent.findMany()
    backupData.tables.companyInfo = await prisma.companyInfo.findMany()
    backupData.tables.partners = await prisma.partner.findMany()

    // Create backup file
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const backupFileName = `database-backup-${timestamp}.json`
    const backupPath = path.join(__dirname, backupFileName)
    
    fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2))
    
    console.log(`✅ Database backup completed!`)
    console.log(`📁 Backup saved to: ${backupPath}`)
    console.log(`📊 Tables backed up:`)
    
    Object.entries(backupData.tables).forEach(([tableName, data]) => {
      console.log(`   - ${tableName}: ${data.length} records`)
    })
    
    return backupPath
    
  } catch (error) {
    console.error('❌ Error creating database backup:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run backup if called directly
if (require.main === module) {
  backupDatabase()
    .then(() => {
      console.log('🎉 Backup process completed successfully!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Backup process failed:', error)
      process.exit(1)
    })
}

module.exports = { backupDatabase }