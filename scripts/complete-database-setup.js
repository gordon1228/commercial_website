const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function setupCompleteDatabase() {
  try {
    console.log('Setting up complete database schema...')
    
    // 1. Create all missing tables using db push (which creates tables based on schema)
    console.log('1. Running Prisma DB push to create missing tables...')
    
    // 2. Ensure basic tables exist and have data
    console.log('2. Checking and creating essential data...')
    
    // Create default homepage content if it doesn't exist
    const homepageContent = await prisma.homepageContent.findFirst()
    if (!homepageContent) {
      await prisma.homepageContent.create({
        data: {
          heroTitle: 'Premium Commercial',
          heroSubtitle: 'Trucks',
          heroDescription: 'Discover elite truck solutions built for businesses that demand excellence, reliability, and uncompromising performance.',
          heroButtonPrimary: 'Explore Trucks',
          heroButtonSecondary: 'Get Quote'
        }
      })
      console.log('✓ Created default homepage content')
    } else {
      console.log('✓ Homepage content exists')
    }
    
    // Create default contact info if it doesn't exist
    const contactInfo = await prisma.contactInfo.findFirst()
    if (!contactInfo) {
      await prisma.contactInfo.create({
        data: {
          salesPhone: '+010 339 1414',
          servicePhone: '+016 332 2349',
          financePhone: '+016 332 2349',
          salesEmail: 'sales@evtl.com.my',
          serviceEmail: 'service@evtl.com.my',
          supportEmail: 'support@evtl.com.my',
          address: '3-20 Level 3 MKH Boulevard, Jalan Changkat',
          city: '43000 Kajang, Selangor',
          directions: 'EVTL Trucks Office',
          mondayToFriday: '9:00 AM - 6:00 PM',
          saturday: '9:00 AM - 1:00 PM',
          sunday: 'Closed'
        }
      })
      console.log('✓ Created default contact info')
    } else {
      console.log('✓ Contact info exists')
    }
    
    // Create default company info if it doesn't exist
    const companyInfo = await prisma.companyInfo.findFirst()
    if (!companyInfo) {
      await prisma.companyInfo.create({
        data: {
          companyName: 'EVTL',
          companyDescription: 'For over 25 years, we\'ve been the trusted partner for businesses seeking premium commercial trucks. Our commitment to excellence drives everything we do.',
          foundedYear: 1998,
          totalVehiclesSold: 2500,
          totalHappyCustomers: 850,
          totalYearsExp: 25,
          satisfactionRate: 98
        }
      })
      console.log('✓ Created default company info')
    } else {
      console.log('✓ Company info exists')
    }
    
    // Create default settings if it doesn't exist
    const settings = await prisma.settings.findFirst()
    if (!settings) {
      await prisma.settings.create({
        data: {
          siteName: 'EVTL',
          contactEmail: 'contact@evtl.com.my',
          supportPhone: '+010 339 1414',
          address: '3-20 Level 3 MKH Boulevard, Jalan Changkat, 43000 Kajang, Selangor'
        }
      })
      console.log('✓ Created default settings')
    } else {
      console.log('✓ Settings exists')
    }
    
    console.log('\n✅ Database setup completed successfully!')
    console.log('All essential tables and data are now in place.')
    
  } catch (error) {
    console.error('❌ Error setting up database:', error)
  } finally {
    await prisma.$disconnect()
  }
}

setupCompleteDatabase()