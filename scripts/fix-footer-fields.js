const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function fixFooterFields() {
  try {
    console.log('Fixing footer management fields...')
    
    // Try to add the columns one by one to avoid conflicts
    const queries = [
      `ALTER TABLE contact_info ADD COLUMN IF NOT EXISTS "companyDescription" TEXT DEFAULT 'EVTL Sdn. Bhd. is a next-generation mobility startup focusing on Electric Trucks (EV Trucks) and future smart transport solutions.'`,
      `ALTER TABLE contact_info ADD COLUMN IF NOT EXISTS "facebookUrl" VARCHAR(255) DEFAULT ''`,
      `ALTER TABLE contact_info ADD COLUMN IF NOT EXISTS "twitterUrl" VARCHAR(255) DEFAULT ''`,
      `ALTER TABLE contact_info ADD COLUMN IF NOT EXISTS "instagramUrl" VARCHAR(255) DEFAULT ''`,
      `ALTER TABLE contact_info ADD COLUMN IF NOT EXISTS "linkedinUrl" VARCHAR(255) DEFAULT ''`,
      `ALTER TABLE contact_info ADD COLUMN IF NOT EXISTS "privacyPolicyUrl" VARCHAR(255) DEFAULT '/privacy'`,
      `ALTER TABLE contact_info ADD COLUMN IF NOT EXISTS "termsOfServiceUrl" VARCHAR(255) DEFAULT '/terms'`
    ]
    
    for (const query of queries) {
      try {
        await prisma.$executeRawUnsafe(query)
        console.log('✅ Executed:', query.split('ADD COLUMN IF NOT EXISTS')[1]?.split('DEFAULT')[0]?.trim())
      } catch (error) {
        console.log('⚠️ Skipped (already exists):', query.split('ADD COLUMN IF NOT EXISTS')[1]?.split('DEFAULT')[0]?.trim())
      }
    }
    
    // Update existing records
    await prisma.contactInfo.updateMany({
      data: {
        companyDescription: 'EVTL Sdn. Bhd. is a next-generation mobility startup focusing on Electric Trucks (EV Trucks) and future smart transport solutions.',
        facebookUrl: '',
        twitterUrl: '',
        instagramUrl: '',
        linkedinUrl: '',
        privacyPolicyUrl: '/privacy',
        termsOfServiceUrl: '/terms'
      }
    })
    
    console.log('✅ Successfully fixed footer management fields!')
    
    // Verify the changes
    const contactInfo = await prisma.contactInfo.findFirst()
    console.log('Current footer settings:', {
      companyDescription: contactInfo?.companyDescription?.substring(0, 50) + '...',
      facebookUrl: contactInfo?.facebookUrl || 'empty',
      twitterUrl: contactInfo?.twitterUrl || 'empty',
      instagramUrl: contactInfo?.instagramUrl || 'empty', 
      linkedinUrl: contactInfo?.linkedinUrl || 'empty',
      privacyPolicyUrl: contactInfo?.privacyPolicyUrl,
      termsOfServiceUrl: contactInfo?.termsOfServiceUrl
    })
    
  } catch (error) {
    console.error('❌ Error fixing footer fields:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixFooterFields()