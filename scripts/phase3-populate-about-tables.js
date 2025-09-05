const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function populateAboutTables() {
  try {
    console.log('🔄 Phase 3: Populating About page tables with real data...')
    
    // 1. Populate CompanyValue table
    console.log('📝 Populating CompanyValue table...')
    
    const companyValues = [
      {
        title: 'Quality Assurance',
        description: 'Every vehicle undergoes rigorous inspection and comes with comprehensive warranty coverage to ensure your peace of mind.',
        iconName: 'Shield',
        order: 1
      },
      {
        title: 'Trust & Integrity',
        description: 'We build lasting relationships through honest dealings, transparent pricing, and reliable service that you can count on.',
        iconName: 'Handshake',
        order: 2
      },
      {
        title: 'Timely Service',
        description: 'We understand your business needs. Our quick processing and delivery services keep your operations running smoothly.',
        iconName: 'Clock',
        order: 3
      },
      {
        title: 'Customer First',
        description: '24/7 customer support and personalized service ensure that your experience with us exceeds expectations every time.',
        iconName: 'Heart',
        order: 4
      }
    ]
    
    for (const value of companyValues) {
      await prisma.companyValue.upsert({
        where: { id: `value-${value.order}` },
        update: value,
        create: {
          id: `value-${value.order}`,
          ...value
        }
      })
    }
    console.log(`✅ Added ${companyValues.length} company values`)
    
    // 2. Populate TeamMember table
    console.log('📝 Populating TeamMember table...')
    
    const teamMembers = [
      {
        name: 'Ahmad Rahman',
        position: 'Founder & CEO',
        description: 'Visionary leader in sustainable mobility and green technology with over 15 years of experience in the commercial vehicle industry.',
        image: null,
        order: 1
      },
      {
        name: 'Dr. Lee Wei Ming',
        position: 'Chief Technology Officer',
        description: 'Expert in electric vehicle technology and smart transport systems, leading our innovation and development initiatives.',
        image: null,
        order: 2
      },
      {
        name: 'Siti Nurhaliza',
        position: 'Head of Operations',
        description: 'Specialist in logistics optimization and fleet management, ensuring smooth operations and customer satisfaction.',
        image: null,
        order: 3
      },
      {
        name: 'James Tan',
        position: 'Partnership Director',
        description: 'Building strategic alliances with local and international partners to expand our reach and service capabilities.',
        image: null,
        order: 4
      }
    ]
    
    for (const member of teamMembers) {
      await prisma.teamMember.upsert({
        where: { id: `team-${member.order}` },
        update: member,
        create: {
          id: `team-${member.order}`,
          ...member
        }
      })
    }
    console.log(`✅ Added ${teamMembers.length} team members`)
    
    // 3. Populate Certification table
    console.log('📝 Populating Certification table...')
    
    const certifications = [
      {
        name: 'Malaysia Commercial Vehicle Association Member',
        order: 1
      },
      {
        name: 'ISO 9001:2015 Quality Management Certification',
        order: 2
      },
      {
        name: 'Green Business Certification Malaysia',
        order: 3
      },
      {
        name: 'Better Business Bureau A+ Rating',
        order: 4
      },
      {
        name: 'Sustainable Transportation Excellence Award 2023',
        order: 5
      },
      {
        name: 'Customer Excellence Recognition 2024',
        order: 6
      }
    ]
    
    for (const cert of certifications) {
      await prisma.certification.upsert({
        where: { id: `cert-${cert.order}` },
        update: cert,
        create: {
          id: `cert-${cert.order}`,
          ...cert
        }
      })
    }
    console.log(`✅ Added ${certifications.length} certifications`)
    
    // 4. Verify the data
    console.log('🔍 Verifying populated data...')
    
    const valueCount = await prisma.companyValue.count()
    const teamCount = await prisma.teamMember.count()
    const certCount = await prisma.certification.count()
    
    console.log('📊 Data population summary:')
    console.log(`   - Company Values: ${valueCount} records`)
    console.log(`   - Team Members: ${teamCount} records`)
    console.log(`   - Certifications: ${certCount} records`)
    
    console.log('✅ Phase 3 - About page data population completed!')
    
  } catch (error) {
    console.error('❌ Error in Phase 3:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run population if called directly
if (require.main === module) {
  populateAboutTables()
    .then(() => {
      console.log('🎉 Phase 3 about page data population completed successfully!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Phase 3 failed:', error)
      process.exit(1)
    })
}

module.exports = { populateAboutTables }