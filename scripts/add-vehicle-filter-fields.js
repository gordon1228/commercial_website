const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function addVehicleFilterFields() {
  try {
    console.log('Adding vehicle filter fields (year, make, fuelType) to Vehicle table...')
    
    // Add the new columns
    await prisma.$executeRaw`
      ALTER TABLE vehicles 
      ADD COLUMN IF NOT EXISTS year INTEGER DEFAULT 2024,
      ADD COLUMN IF NOT EXISTS make VARCHAR(255) DEFAULT 'Isuzu',
      ADD COLUMN IF NOT EXISTS "fuelType" VARCHAR(255) DEFAULT 'Electric';
    `
    
    // Update existing records with default values
    await prisma.$executeRaw`
      UPDATE vehicles 
      SET 
        year = COALESCE(year, 2024),
        make = COALESCE(make, 'Isuzu'),
        "fuelType" = COALESCE("fuelType", 'Electric')
      WHERE year IS NULL OR make IS NULL OR "fuelType" IS NULL;
    `
    
    console.log('✅ Successfully added vehicle filter fields!')
    
    // Verify the changes
    const sampleVehicle = await prisma.vehicle.findFirst()
    if (sampleVehicle) {
      console.log('Sample vehicle data:', {
        name: sampleVehicle.name,
        year: sampleVehicle.year,
        make: sampleVehicle.make, 
        fuelType: sampleVehicle.fuelType
      })
    }
    
  } catch (error) {
    console.error('❌ Error adding vehicle filter fields:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addVehicleFilterFields()