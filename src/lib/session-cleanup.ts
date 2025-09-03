import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

let hasCleanedUp = false

export async function cleanupExpiredSessions() {
  // Only run cleanup once when server starts
  if (hasCleanedUp) {
    return
  }
  
  try {
    console.log('🧹 Cleaning up expired sessions on server startup...')
    hasCleanedUp = true
    
    // Delete all expired sessions
    const deletedCount = await prisma.session.deleteMany({
      where: {
        expiresAt: {
          lt: new Date()
        }
      }
    })
    
    console.log(`✅ Cleaned up ${deletedCount.count} expired sessions`)
    
  } catch (error) {
    console.error('❌ Failed to cleanup sessions:', error)
  }
}

// Run cleanup when this module is imported (only once)
cleanupExpiredSessions()