const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function addAddressFields() {
  try {
    console.log('Adding new address fields to ContactInfo table...')
    
    // Add the new columns with default values
    await prisma.$executeRaw`
      ALTER TABLE contact_info 
      ADD COLUMN IF NOT EXISTS state VARCHAR(255) DEFAULT 'NY',
      ADD COLUMN IF NOT EXISTS postcode VARCHAR(255) DEFAULT '10001',
      ADD COLUMN IF NOT EXISTS country VARCHAR(255) DEFAULT 'United States';
    `
    
    // Update existing records to have the default values
    await prisma.$executeRaw`
      UPDATE contact_info 
      SET 
        state = COALESCE(state, 'NY'),
        postcode = COALESCE(postcode, '10001'), 
        country = COALESCE(country, 'United States')
      WHERE state IS NULL OR postcode IS NULL OR country IS NULL;
    `
    
    // Also update the city field to remove the state/postcode that was previously there
    await prisma.$executeRaw`
      UPDATE contact_info 
      SET city = 'Commercial District'
      WHERE city = 'Commercial District, NY 10001';
    `
    
    console.log('✅ Successfully added address fields!')
    
    // Verify the changes
    const contactInfo = await prisma.contactInfo.findFirst()
    console.log('Current contact info:', {
      address: contactInfo?.address,
      city: contactInfo?.city,
      state: contactInfo?.state,
      postcode: contactInfo?.postcode,
      country: contactInfo?.country
    })
    
  } catch (error) {
    console.error('❌ Error adding address fields:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addAddressFields()