const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createAllMissingTables() {
  try {
    console.log('Creating all missing database tables...')
    
    // Create company_info table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "public"."company_info" (
          "id" TEXT NOT NULL,
          "companyName" TEXT NOT NULL DEFAULT 'EVTL',
          "companyDescription" TEXT NOT NULL DEFAULT 'For over 25 years, we''ve been the trusted partner for businesses seeking premium commercial trucks.',
          "foundedYear" INTEGER NOT NULL DEFAULT 1998,
          "totalVehiclesSold" INTEGER NOT NULL DEFAULT 2500,
          "totalHappyCustomers" INTEGER NOT NULL DEFAULT 850,
          "totalYearsExp" INTEGER NOT NULL DEFAULT 25,
          "satisfactionRate" INTEGER NOT NULL DEFAULT 98,
          "storyTitle" TEXT NOT NULL DEFAULT 'Our Story',
          "storyParagraph1" TEXT NOT NULL DEFAULT 'Founded in 1998, EVTL began as a small family business.',
          "storyParagraph2" TEXT NOT NULL DEFAULT 'Over the years, we''ve built our reputation on quality.',
          "storyParagraph3" TEXT NOT NULL DEFAULT 'Today, we continue to evolve with the industry.',
          "missionTitle" TEXT NOT NULL DEFAULT 'Our Mission',
          "missionText" TEXT NOT NULL DEFAULT 'To empower businesses with premium commercial trucks.',
          "visionTitle" TEXT NOT NULL DEFAULT 'Our Vision',
          "visionText" TEXT NOT NULL DEFAULT 'To be the leading commercial truck provider.',
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "company_info_pkey" PRIMARY KEY ("id")
      );
    `
    console.log('✓ Created company_info table')
    
    // Create company_values table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "public"."company_values" (
          "id" TEXT NOT NULL,
          "title" TEXT NOT NULL,
          "description" TEXT NOT NULL,
          "iconName" TEXT NOT NULL,
          "order" INTEGER NOT NULL DEFAULT 0,
          "active" BOOLEAN NOT NULL DEFAULT true,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "company_values_pkey" PRIMARY KEY ("id")
      );
    `
    console.log('✓ Created company_values table')
    
    // Create team_members table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "public"."team_members" (
          "id" TEXT NOT NULL,
          "name" TEXT NOT NULL,
          "position" TEXT NOT NULL,
          "description" TEXT NOT NULL,
          "image" TEXT,
          "order" INTEGER NOT NULL DEFAULT 0,
          "active" BOOLEAN NOT NULL DEFAULT true,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "team_members_pkey" PRIMARY KEY ("id")
      );
    `
    console.log('✓ Created team_members table')
    
    // Create certifications table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "public"."certifications" (
          "id" TEXT NOT NULL,
          "name" TEXT NOT NULL,
          "order" INTEGER NOT NULL DEFAULT 0,
          "active" BOOLEAN NOT NULL DEFAULT true,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "certifications_pkey" PRIMARY KEY ("id")
      );
    `
    console.log('✓ Created certifications table')
    
    // Create partners table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "public"."partners" (
          "id" TEXT NOT NULL,
          "name" TEXT NOT NULL,
          "logo" TEXT NOT NULL,
          "website" TEXT,
          "active" BOOLEAN NOT NULL DEFAULT true,
          "order" INTEGER NOT NULL DEFAULT 0,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "partners_pkey" PRIMARY KEY ("id")
      );
    `
    console.log('✓ Created partners table')
    
    // Create settings table  
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "public"."settings" (
          "id" TEXT NOT NULL,
          "siteName" TEXT NOT NULL DEFAULT 'EVTL',
          "contactEmail" TEXT NOT NULL DEFAULT 'contact@evtl.com',
          "supportPhone" TEXT NOT NULL DEFAULT '+1 (555) 123-4567',
          "address" TEXT NOT NULL DEFAULT '123 Business Avenue',
          "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
          "systemNotifications" BOOLEAN NOT NULL DEFAULT true,
          "maintenanceMode" BOOLEAN NOT NULL DEFAULT false,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
      );
    `
    console.log('✓ Created settings table')
    
    console.log('\n✅ All missing tables created successfully!')
    
  } catch (error) {
    console.error('❌ Error creating tables:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAllMissingTables()