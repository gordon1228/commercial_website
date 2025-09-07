import { PrismaClient } from '@prisma/client'

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined
}

const createPrismaClient = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  })
}

export const prisma = globalThis.__prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma
}

// Only handle actual process termination (not development hot reloads)
if (process.env.NODE_ENV === 'production') {
  const gracefulShutdown = async () => {
    console.log('Disconnecting Prisma client...')
    await prisma.$disconnect()
    console.log('Prisma client disconnected')
  }

  // Handle process termination signals only in production
  process.on('SIGINT', gracefulShutdown)
  process.on('SIGTERM', gracefulShutdown)
}