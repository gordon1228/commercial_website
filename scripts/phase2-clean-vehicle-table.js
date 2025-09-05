const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function cleanVehicleTable() {
  try {
    console.log('🔄 Phase 2: Cleaning Vehicle table...')
    
    // Remove unused columns from Vehicle table
    console.log('🧹 Removing unused Vehicle fields...')
    await prisma.$executeRaw`
      DO $$ 
      BEGIN
          -- Remove unused Vehicle fields
          IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vehicles' AND column_name = 'year') THEN
              ALTER TABLE "public"."vehicles" DROP COLUMN IF EXISTS "year";
              RAISE NOTICE 'Dropped year column';
          END IF;
          
          IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vehicles' AND column_name = 'make') THEN
              ALTER TABLE "public"."vehicles" DROP COLUMN IF EXISTS "make";
              RAISE NOTICE 'Dropped make column';
          END IF;
          
          IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vehicles' AND column_name = 'model') THEN
              ALTER TABLE "public"."vehicles" DROP COLUMN IF EXISTS "model";
              RAISE NOTICE 'Dropped model column';
          END IF;
          
          IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vehicles' AND column_name = 'mileage') THEN
              ALTER TABLE "public"."vehicles" DROP COLUMN IF EXISTS "mileage";
              RAISE NOTICE 'Dropped mileage column';
          END IF;
          
          IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vehicles' AND column_name = 'fuelType') THEN
              ALTER TABLE "public"."vehicles" DROP COLUMN IF EXISTS "fuelType";
              RAISE NOTICE 'Dropped fuelType column';
          END IF;
          
          IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vehicles' AND column_name = 'transmission') THEN
              ALTER TABLE "public"."vehicles" DROP COLUMN IF EXISTS "transmission";
              RAISE NOTICE 'Dropped transmission column';
          END IF;
          
          IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vehicles' AND column_name = 'features') THEN
              ALTER TABLE "public"."vehicles" DROP COLUMN IF EXISTS "features";
              RAISE NOTICE 'Dropped features column';
          END IF;
          
          RAISE NOTICE 'Vehicle table cleanup completed successfully!';
          RAISE NOTICE 'Removed 7 unused columns from vehicles table.';
      END $$;
    `
    
    // Drop the Settings table since it's now consolidated into ContactInfo
    console.log('🗑️ Dropping unused Settings table...')
    await prisma.$executeRaw`
      DO $$ 
      BEGIN
          IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'settings') THEN
              DROP TABLE IF EXISTS "public"."settings";
              RAISE NOTICE 'Dropped settings table successfully!';
          ELSE
              RAISE NOTICE 'Settings table does not exist or already dropped.';
          END IF;
      END $$;
    `
    
    // Verify the cleanup
    console.log('🔍 Verifying Vehicle table structure...')
    const vehicleColumns = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'vehicles' 
      ORDER BY ordinal_position
    `
    
    console.log('📊 Current Vehicle table columns:')
    vehicleColumns.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type}`)
    })
    
    console.log('✅ Phase 2 - Vehicle table cleanup completed!')
    
  } catch (error) {
    console.error('❌ Error in Phase 2:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run cleanup if called directly
if (require.main === module) {
  cleanVehicleTable()
    .then(() => {
      console.log('🎉 Phase 2 vehicle cleanup completed successfully!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Phase 2 failed:', error)
      process.exit(1)
    })
}

module.exports = { cleanVehicleTable }