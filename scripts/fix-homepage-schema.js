const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function fixHomepageSchema() {
  try {
    console.log('Fixing homepage content schema...')
    
    // Execute the SQL to drop the trucksSold column if it exists
    await prisma.$executeRaw`
      DO $$ 
      BEGIN
          IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'homepage_content' AND column_name = 'trucksSold') THEN
              ALTER TABLE "public"."homepage_content" DROP COLUMN IF EXISTS "trucksSold";
              RAISE NOTICE 'Dropped trucksSold column';
          END IF;
          
          IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'homepage_content' AND column_name = 'vehiclesSold') THEN
              ALTER TABLE "public"."homepage_content" DROP COLUMN IF EXISTS "vehiclesSold";
              RAISE NOTICE 'Dropped vehiclesSold column';
          END IF;
      END $$;
    `
    
    console.log('✓ Homepage content schema fixed successfully!')
    
    // Test the API by trying to fetch homepage content
    const content = await prisma.homepageContent.findFirst()
    console.log('✓ Database query test successful:', content ? 'Content found' : 'No content found')
    
  } catch (error) {
    console.error('Error fixing schema:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixHomepageSchema()