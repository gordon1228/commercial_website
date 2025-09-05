const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testDatabaseConnection() {
  try {
    console.log('Testing database connection to Supabase...')
    console.log('DATABASE_URL from env:', process.env.DATABASE_URL ? 'Found' : 'Missing')
    
    // Test basic connection
    await prisma.$connect()
    console.log('✅ Successfully connected to database!')
    
    // Test query execution
    console.log('\nTesting query execution...')
    const result = await prisma.$queryRaw`SELECT 1 as test`
    console.log('✅ Query execution successful:', result)
    
    // Check if we can see our tables
    console.log('\nChecking database tables...')
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `
    
    console.log('📋 Available tables:')
    tables.forEach(table => {
      console.log(`  - ${table.table_name}`)
    })
    
    // Test data retrieval from our key tables
    console.log('\n🔍 Testing data retrieval:')
    
    try {
      const homepageContent = await prisma.homepageContent.findFirst()
      console.log('  ✅ Homepage content:', homepageContent ? 'Found' : 'Empty')
    } catch (e) {
      console.log('  ❌ Homepage content error:', e.message)
    }
    
    try {
      const contactInfo = await prisma.contactInfo.findFirst()
      console.log('  ✅ Contact info:', contactInfo ? 'Found' : 'Empty')
    } catch (e) {
      console.log('  ❌ Contact info error:', e.message)
    }
    
    try {
      const companyInfo = await prisma.companyInfo.findFirst()
      console.log('  ✅ Company info:', companyInfo ? 'Found' : 'Empty')
    } catch (e) {
      console.log('  ❌ Company info error:', e.message)
    }
    
    console.log('\n✅ Database connection test completed successfully!')
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message)
    console.error('Full error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testDatabaseConnection()