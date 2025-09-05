const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function addFooterFields() {
  try {
    console.log('Adding footer management fields to ContactInfo table...')
    
    // Add the new footer columns
    await prisma.$executeRaw`
      ALTER TABLE contact_info 
      ADD COLUMN IF NOT EXISTS "companyDescription" TEXT DEFAULT 'EVTL Sdn. Bhd. is a next-generation mobility startup focusing on Electric Trucks (EV Trucks) and future smart transport solutions.',
      ADD COLUMN IF NOT EXISTS "facebookUrl" VARCHAR(255) DEFAULT '',
      ADD COLUMN IF NOT EXISTS "twitterUrl" VARCHAR(255) DEFAULT '',
      ADD COLUMN IF NOT EXISTS "instagramUrl" VARCHAR(255) DEFAULT '',
      ADD COLUMN IF NOT EXISTS "linkedinUrl" VARCHAR(255) DEFAULT '',
      ADD COLUMN IF NOT EXISTS "privacyPolicyUrl" VARCHAR(255) DEFAULT '/privacy',
      ADD COLUMN IF NOT EXISTS "termsOfServiceUrl" VARCHAR(255) DEFAULT '/terms';
    `
    
    // Update existing records to have the default values
    await prisma.$executeRaw`
      UPDATE contact_info 
      SET 
        "companyDescription" = COALESCE("companyDescription", 'EVTL Sdn. Bhd. is a next-generation mobility startup focusing on Electric Trucks (EV Trucks) and future smart transport solutions.'),
        "facebookUrl" = COALESCE("facebookUrl", ''),
        "twitterUrl" = COALESCE("twitterUrl", ''), 
        "instagramUrl" = COALESCE("instagramUrl", ''),
        "linkedinUrl" = COALESCE("linkedinUrl", ''),
        "privacyPolicyUrl" = COALESCE("privacyPolicyUrl", '/privacy'),
        "termsOfServiceUrl" = COALESCE("termsOfServiceUrl", '/terms')
      WHERE "companyDescription" IS NULL 
         OR "facebookUrl" IS NULL 
         OR "twitterUrl" IS NULL 
         OR "instagramUrl" IS NULL 
         OR "linkedinUrl" IS NULL 
         OR "privacyPolicyUrl" IS NULL 
         OR "termsOfServiceUrl" IS NULL;
    `
    
    console.log('✅ Successfully added footer management fields!')
    
    // Verify the changes
    const contactInfo = await prisma.contactInfo.findFirst()
    console.log('Current footer settings:', {
      companyDescription: contactInfo?.companyDescription?.substring(0, 50) + '...',
      facebookUrl: contactInfo?.facebookUrl,
      twitterUrl: contactInfo?.twitterUrl,
      instagramUrl: contactInfo?.instagramUrl,
      linkedinUrl: contactInfo?.linkedinUrl,
      privacyPolicyUrl: contactInfo?.privacyPolicyUrl,
      termsOfServiceUrl: contactInfo?.termsOfServiceUrl
    })
    
  } catch (error) {
    console.error('❌ Error adding footer fields:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addFooterFields()