import { prisma } from './prisma'
import type { PrismaClient } from '@prisma/client'

export interface RetryOptions {
  maxAttempts: number
  initialDelay: number
  maxDelay: number
  backoffFactor: number
}

const defaultRetryOptions: RetryOptions = {
  maxAttempts: 3,
  initialDelay: 100,
  maxDelay: 5000,
  backoffFactor: 2
}

export class DatabaseError extends Error {
  constructor(message: string, public originalError?: Error) {
    super(message)
    this.name = 'DatabaseError'
  }
}

export async function withRetry<T>(
  operation: (prisma: PrismaClient) => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  const opts = { ...defaultRetryOptions, ...options }
  let lastError: Error | null = null
  let delay = opts.initialDelay

  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      return await operation(prisma)
    } catch (error) {
      lastError = error as Error
      
      // Check if it's a connection pool timeout or similar database connection error
      const isRetryableError = 
        error instanceof Error && (
          error.message.includes('connection pool') ||
          error.message.includes('timeout') ||
          error.message.includes('ECONNRESET') ||
          error.message.includes('ETIMEDOUT') ||
          error.message.includes('connection refused') ||
          error.message.includes('server closed the connection')
        )
      
      if (!isRetryableError || attempt === opts.maxAttempts) {
        throw new DatabaseError(
          `Database operation failed after ${attempt} attempts: ${error instanceof Error ? error.message : 'Unknown error'}`,
          error instanceof Error ? error : undefined
        )
      }

      console.warn(`Database operation failed (attempt ${attempt}/${opts.maxAttempts}):`, error instanceof Error ? error.message : error)
      console.warn(`Retrying in ${delay}ms...`)
      
      await new Promise(resolve => setTimeout(resolve, delay))
      delay = Math.min(delay * opts.backoffFactor, opts.maxDelay)
    }
  }

  throw new DatabaseError(
    `Database operation failed after ${opts.maxAttempts} attempts`,
    lastError || undefined
  )
}

export async function healthCheck(): Promise<boolean> {
  try {
    await withRetry(async (prisma) => {
      await prisma.$queryRaw`SELECT 1`
    }, { maxAttempts: 1 })
    return true
  } catch (error) {
    console.error('Database health check failed:', error)
    return false
  }
}

export async function getConnectionInfo(): Promise<{
  isConnected: boolean
  connectionCount?: number
  error?: string
}> {
  try {
    const result = await withRetry(async (prisma) => {
      const connectionCount = await prisma.$queryRaw<[{ count: bigint }]>`
        SELECT count(*) 
        FROM pg_stat_activity 
        WHERE state = 'active'
      `
      return { isConnected: true, connectionCount: Number(connectionCount[0].count) }
    }, { maxAttempts: 1 })
    
    return result
  } catch (error) {
    return {
      isConnected: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

export async function closeConnection(): Promise<void> {
  try {
    await prisma.$disconnect()
    console.log('Database connection closed successfully')
  } catch (error) {
    console.error('Error closing database connection:', error)
    throw error
  }
}