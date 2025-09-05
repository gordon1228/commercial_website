const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function consolidateSettingsToContactInfo() {
  try {
    console.log('🔄 Phase 1: Consolidating Settings into ContactInfo table...')
    
    // Step 1: Add Settings fields to ContactInfo table
    console.log('📝 Adding Settings fields to ContactInfo table...')
    await prisma.$executeRaw`
      DO $$ 
      BEGIN
          -- Add Settings fields to ContactInfo table if they don't exist
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contact_info' AND column_name = 'siteName') THEN
              ALTER TABLE "public"."contact_info" ADD COLUMN "siteName" TEXT DEFAULT 'EVTL';
          END IF;
          
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contact_info' AND column_name = 'emailNotifications') THEN
              ALTER TABLE "public"."contact_info" ADD COLUMN "emailNotifications" BOOLEAN DEFAULT true;
          END IF;
          
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contact_info' AND column_name = 'systemNotifications') THEN
              ALTER TABLE "public"."contact_info" ADD COLUMN "systemNotifications" BOOLEAN DEFAULT true;
          END IF;
          
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contact_info' AND column_name = 'maintenanceMode') THEN
              ALTER TABLE "public"."contact_info" ADD COLUMN "maintenanceMode" BOOLEAN DEFAULT false;
          END IF;
          
          RAISE NOTICE 'Settings fields added to ContactInfo table successfully!';
      END $$;
    `
    
    // Step 2: Migrate existing Settings data to ContactInfo
    console.log('🔄 Migrating Settings data to ContactInfo...')
    
    // Get existing Settings and ContactInfo data
    const existingSettings = await prisma.settings.findFirst()
    const existingContactInfo = await prisma.contactInfo.findFirst()
    
    if (existingSettings && existingContactInfo) {
      console.log('📋 Found existing Settings data, migrating to ContactInfo...')
      
      // Update ContactInfo with Settings data
      await prisma.$executeRaw`
        UPDATE "public"."contact_info" 
        SET 
          "siteName" = ${existingSettings.siteName},
          "emailNotifications" = ${existingSettings.emailNotifications},
          "systemNotifications" = ${existingSettings.systemNotifications},
          "maintenanceMode" = ${existingSettings.maintenanceMode},
          "updatedAt" = CURRENT_TIMESTAMP
        WHERE "id" = ${existingContactInfo.id}
      `
      
      console.log('✅ Settings data migrated to ContactInfo successfully!')
      
      // Show merged data for verification
      const updatedContactInfo = await prisma.contactInfo.findFirst()
      console.log('📊 Updated ContactInfo data:')
      console.log(`   - Site Name: ${updatedContactInfo.siteName}`)
      console.log(`   - Contact Email: ${updatedContactInfo.salesEmail}`)
      console.log(`   - Support Phone: ${updatedContactInfo.salesPhone}`)
      console.log(`   - Email Notifications: ${updatedContactInfo.emailNotifications}`)
      console.log(`   - System Notifications: ${updatedContactInfo.systemNotifications}`)
      console.log(`   - Maintenance Mode: ${updatedContactInfo.maintenanceMode}`)
      
    } else {
      console.log('⚠️ No existing Settings data found, using defaults')
    }
    
    console.log('✅ Phase 1 - Database consolidation completed!')
    
  } catch (error) {
    console.error('❌ Error in Phase 1:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run consolidation if called directly
if (require.main === module) {
  consolidateSettingsToContactInfo()
    .then(() => {
      console.log('🎉 Phase 1 database consolidation completed successfully!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Phase 1 failed:', error)
      process.exit(1)
    })
}

module.exports = { consolidateSettingsToContactInfo }