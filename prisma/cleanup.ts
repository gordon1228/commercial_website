import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function cleanup() {
  console.log('Cleaning up database data...')
  
  try {
    // Delete all inquiries with problematic statuses
    const deletedInquiries = await prisma.inquiry.deleteMany({
      where: {
        OR: [
          { status: 'READ' as any },
          { status: 'RESPONDED' as any }
        ]
      }
    })
    console.log(`Deleted ${deletedInquiries.count} inquiries with old statuses`)
    
    // Delete users with problematic roles 
    const deletedUsers = await prisma.user.deleteMany({
      where: {
        role: 'STAFF' as any
      }
    })
    console.log(`Deleted ${deletedUsers.count} users with old roles`)
    
    console.log('Database cleanup completed!')
  } catch (error) {
    console.error('Cleanup failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

cleanup()