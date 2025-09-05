// Migration script to add comingSoonImage field
const { PrismaClient } = require('@prisma/client')

async function migrate() {
  const prisma = new PrismaClient()
  
  try {
    console.log('Adding comingSoonImage field to homepage_content table...')
    
    // Execute raw SQL to add the column
    await prisma.$executeRaw`
      ALTER TABLE homepage_content 
      ADD COLUMN IF NOT EXISTS "comingSoonImage" TEXT DEFAULT '/uploads/Technology_background.png'
    `
    
    console.log('✅ Migration completed successfully!')
    
    // Test by fetching the data
    const content = await prisma.homepageContent.findFirst()
    console.log('Current homepage content:', content)
    
  } catch (error) {
    console.error('Migration failed:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

migrate()