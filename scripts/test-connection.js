const { PrismaClient } = require('@prisma/client');

// Load environment variables
try {
  require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
} catch (error) {
  console.warn('dotenv not available, using system environment variables');
}

async function testConnection() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔄 Testing database connection...');
    
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Test a simple query
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Database query test successful');
    
    // Check if main tables exist
    try {
      const userCount = await prisma.user.count();
      const vehicleCount = await prisma.vehicle.count();
      const inquiryCount = await prisma.inquiry.count();
      
      console.log(`📊 Database stats:`);
      console.log(`   Users: ${userCount}`);
      console.log(`   Vehicles: ${vehicleCount}`);
      console.log(`   Inquiries: ${inquiryCount}`);
      
    } catch (error) {
      console.log('⚠️  Some tables may not exist yet (this is normal before migration)');
    }
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();