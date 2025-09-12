/**
 * Script to retrieve current data from database tables
 * This will help us update the fallback data with actual database values
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function getCurrentData() {
  console.log('🔍 Retrieving current data from database...')
  
  try {
    // Get current company info
    const companyInfo = await prisma.companyInfo.findFirst()
    console.log('\n📊 Company Info:')
    console.log(JSON.stringify(companyInfo, null, 2))

    // Get current contact info
    const contactInfo = await prisma.contactInfo.findFirst()
    console.log('\n📞 Contact Info:')
    console.log(JSON.stringify(contactInfo, null, 2))

    // Get current homepage content
    const homepageContent = await prisma.homepageContent.findFirst()
    console.log('\n🏠 Homepage Content:')
    console.log(JSON.stringify(homepageContent, null, 2))

    // Get current technology content
    const technologyContent = await prisma.technologyContent.findFirst()
    console.log('\n🔧 Technology Content:')
    console.log(JSON.stringify(technologyContent, null, 2))

    return {
      companyInfo,
      contactInfo,
      homepageContent,
      technologyContent
    }
  } catch (error) {
    console.error('❌ Error retrieving data:', error)
    throw error
  }
}

async function main() {
  try {
    const data = await getCurrentData()
    console.log('\n✅ Data retrieval completed successfully!')
    return data
  } catch (error) {
    console.error('💥 Failed to retrieve data:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
if (require.main === module) {
  main()
}

module.exports = { getCurrentData }