const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkTableColumns() {
  try {
    console.log('🔍 Checking table column names...')
    
    // Check sessions table columns
    const sessionsColumns = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'sessions' 
      ORDER BY ordinal_position
    `
    
    console.log('📋 Sessions table columns:')
    sessionsColumns.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type}`)
    })
    
    // Check vehicles table columns
    const vehiclesColumns = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'vehicles' 
      ORDER BY ordinal_position
    `
    
    console.log('📋 Vehicles table columns:')
    vehiclesColumns.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type}`)
    })
    
  } catch (error) {
    console.error('❌ Error checking columns:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkTableColumns()