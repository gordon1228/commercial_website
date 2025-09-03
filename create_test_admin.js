// Quick script to create admin user
const bcrypt = require('bcryptjs');

async function createAdmin() {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash('admin123', 10);
        
        // Create or update admin user
        const admin = await prisma.user.upsert({
            where: { email: 'admin@elitefleet.com' },
            update: {
                password: hashedPassword,
                role: 'ADMIN'
            },
            create: {
                id: 'admin123456',
                email: 'admin@elitefleet.com',
                password: hashedPassword,
                role: 'ADMIN'
            }
        });
        
        console.log('Admin user created/updated:', admin.email);
        console.log('Password hash:', hashedPassword);
        
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

createAdmin();