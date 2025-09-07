const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

// Configure Prisma to use Supabase connection
const supabaseConnectionString = "postgresql://postgres.cynvuexwnnfuhrncfmrn:4K%21j4JhxEWz%3Fk.Q@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=3&pool_timeout=10&connect_timeout=20"

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: supabaseConnectionString
    }
  }
})

async function exportSupabaseData() {
  console.log('🔄 Starting Supabase data export...')
  
  try {
    console.log('📊 Exporting data from all tables...')
    
    // Export all data
    const [
      users,
      categories,
      vehicles,
      inquiries,
      homepageContent,
      companyInfo,
      companyValues,
      certifications,
      contactInfo,
      technologyContent,
      technologyFeatures
    ] = await Promise.all([
      prisma.user.findMany({
        orderBy: { createdAt: 'asc' }
      }).catch(() => []),
      prisma.category.findMany({
        orderBy: { name: 'asc' }
      }).catch(() => []),
      prisma.vehicle.findMany({
        orderBy: { createdAt: 'asc' }
      }).catch(() => []),
      prisma.inquiry.findMany({
        orderBy: { createdAt: 'asc' }
      }).catch(() => []),
      prisma.homepageContent.findMany({
        orderBy: { createdAt: 'asc' }
      }).catch(() => []),
      prisma.companyInfo.findMany({
        orderBy: { createdAt: 'asc' }
      }).catch(() => []),
      prisma.companyValue.findMany({
        orderBy: { order: 'asc' }
      }).catch(() => []),
      prisma.certification.findMany({
        orderBy: { order: 'asc' }
      }).catch(() => []),
      prisma.contactInfo.findMany({
        orderBy: { createdAt: 'asc' }
      }).catch(() => []),
      prisma.technologyContent.findMany({
        orderBy: { createdAt: 'asc' }
      }).catch(() => []),
      prisma.technologyFeature.findMany({
        orderBy: { order: 'asc' }
      }).catch(() => [])
    ])

    const exportData = {
      users,
      categories,
      vehicles,
      inquiries,
      homepageContent,
      companyInfo,
      companyValues,
      certifications,
      contactInfo,
      technologyContent,
      technologyFeatures,
      exportDate: new Date().toISOString(),
      totalRecords: {
        users: users.length,
        categories: categories.length,
        vehicles: vehicles.length,
        inquiries: inquiries.length,
        homepageContent: homepageContent.length,
        companyInfo: companyInfo.length,
        companyValues: companyValues.length,
        certifications: certifications.length,
        contactInfo: contactInfo.length,
        technologyContent: technologyContent.length,
        technologyFeatures: technologyFeatures.length
      }
    }

    // Create export directory if it doesn't exist
    const exportDir = path.join(process.cwd(), 'exports')
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true })
    }

    // Save to JSON file
    const exportPath = path.join(exportDir, `supabase-export-${new Date().toISOString().split('T')[0]}.json`)
    fs.writeFileSync(exportPath, JSON.stringify(exportData, null, 2))

    console.log('\n✅ Export completed successfully!')
    console.log(`📁 Data exported to: ${exportPath}`)
    console.log('\n📈 Export Summary:')
    Object.entries(exportData.totalRecords).forEach(([table, count]) => {
      console.log(`  - ${table}: ${count} records`)
    })

    return exportPath

  } catch (error) {
    console.error('❌ Export failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  exportSupabaseData()
    .then((exportPath) => {
      console.log(`\n🎉 Export completed! File saved to: ${exportPath}`)
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Export failed:', error)
      process.exit(1)
    })
}

module.exports = { exportSupabaseData }