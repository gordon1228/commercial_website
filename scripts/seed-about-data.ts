import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedAboutData() {
  console.log('🌱 Seeding about page data...');

  try {
    // Seed Company Info
    const companyInfo = await prisma.companyInfo.upsert({
      where: { id: 'default' },
      update: {},
      create: {
        id: 'default',
        companyName: 'EliteFleet',
        companyDescription: 'For over 25 years, we\'ve been the trusted partner for businesses seeking premium commercial vehicles. Our commitment to excellence drives everything we do.',
        foundedYear: 1998,
        totalVehiclesSold: 2500,
        totalHappyCustomers: 850,
        totalYearsExp: 25,
        satisfactionRate: 98,
        storyTitle: 'Our Story',
        storyParagraph1: 'Founded in 1998, EliteFleet began as a small family business with a simple mission: to provide high-quality commercial vehicles to businesses that demand excellence. What started as a modest dealership has grown into one of the region\'s most trusted commercial vehicle providers.',
        storyParagraph2: 'Over the years, we\'ve built our reputation on three core principles: quality vehicles, exceptional service, and honest business practices. Our experienced team understands that choosing the right commercial vehicle is crucial for your business success.',
        storyParagraph3: 'Today, we continue to evolve with the industry, embracing new technologies and sustainable practices while maintaining the personal touch and attention to detail that our customers have come to expect.',
        missionTitle: 'Our Mission',
        missionText: 'To empower businesses with premium commercial vehicles and exceptional service, enabling them to achieve their goals while building long-lasting partnerships based on trust and mutual success.',
        visionTitle: 'Our Vision',
        visionText: 'To be the leading commercial vehicle provider, recognized for our commitment to quality, innovation, and customer satisfaction, while contributing to sustainable transportation solutions for future generations.'
      }
    });

    console.log('✅ Company info created');

    // Seed Company Values
    const values = [
      { title: 'Quality Assurance', description: 'Every vehicle undergoes rigorous inspection and comes with comprehensive warranty coverage to ensure your peace of mind.', iconName: 'Shield', order: 1 },
      { title: 'Trust & Integrity', description: 'We build lasting relationships through honest dealings, transparent pricing, and reliable service that you can count on.', iconName: 'Handshake', order: 2 },
      { title: 'Timely Service', description: 'We understand your business needs. Our quick processing and delivery services keep your operations running smoothly.', iconName: 'Clock', order: 3 },
      { title: 'Customer First', description: '24/7 customer support and personalized service ensure that your experience with us exceeds expectations every time.', iconName: 'Heart', order: 4 }
    ];

    // Clear existing values first, then create new ones
    await prisma.companyValue.deleteMany({});
    
    for (const value of values) {
      await prisma.companyValue.create({
        data: value
      });
    }

    console.log('✅ Company values created');

    // Seed Team Members
    const teamMembers = [
      { name: 'Michael Chen', position: 'Founder & CEO', description: '25+ years in commercial vehicle industry', image: null, order: 1 },
      { name: 'Sarah Johnson', position: 'Head of Sales', description: 'Expert in fleet management solutions', image: null, order: 2 },
      { name: 'David Rodriguez', position: 'Service Director', description: 'Certified mechanical engineer & service expert', image: null, order: 3 },
      { name: 'Emily Zhang', position: 'Finance Manager', description: 'Specializes in commercial vehicle financing', image: null, order: 4 }
    ];

    // Clear existing team members first, then create new ones
    await prisma.teamMember.deleteMany({});
    
    for (const member of teamMembers) {
      await prisma.teamMember.create({
        data: member
      });
    }

    console.log('✅ Team members created');

    // Seed Certifications
    const certifications = [
      { name: 'Better Business Bureau A+ Rating', order: 1 },
      { name: 'Commercial Vehicle Dealer License', order: 2 },
      { name: 'ISO 9001:2015 Quality Management', order: 3 },
      { name: 'Green Business Certification', order: 4 },
      { name: 'Industry Association Member', order: 5 },
      { name: 'Customer Excellence Award 2023', order: 6 }
    ];

    // Clear existing certifications first, then create new ones
    await prisma.certification.deleteMany({});
    
    for (const cert of certifications) {
      await prisma.certification.create({
        data: cert
      });
    }

    console.log('✅ Certifications created');

    // Seed Contact Info
    const contactInfo = await prisma.contactInfo.upsert({
      where: { id: 'default' },
      update: {},
      create: {
        id: 'default',
        salesPhone: '+1 (555) 123-4567',
        servicePhone: '+1 (555) 123-4568',
        financePhone: '+1 (555) 123-4569',
        salesEmail: 'sales@elitefleet.com',
        serviceEmail: 'service@elitefleet.com',
        supportEmail: 'support@elitefleet.com',
        address: '123 Business Avenue',
        city: 'Commercial District, NY 10001',
        directions: 'Near Metro Station',
        mondayToFriday: '8:00 AM - 6:00 PM',
        saturday: '9:00 AM - 4:00 PM',
        sunday: 'Closed'
      }
    });

    console.log('✅ Contact info created');
    console.log('🎉 About page data seeding completed successfully!');

  } catch (error) {
    console.error('❌ Error seeding about page data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedAboutData();