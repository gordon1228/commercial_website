import { NextRequest } from 'next/server'
import { healthCheck, getConnectionInfo, withRetry } from '@/lib/db-utils'
import { createApiHandler, apiResponse, apiError } from '@/lib/api-handler'

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

// GET /api/health - Database health check
export const GET = createApiHandler(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url)
    const detailed = searchParams.get('detailed') === 'true'
    
    if (!detailed) {
      // Simple health check
      const isHealthy = await healthCheck()
      return apiResponse({
        status: isHealthy ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString()
      })
    }

    // Detailed health check
    const connectionInfo = await getConnectionInfo()
    
    // Test various database operations with retry
    const testResults = await Promise.allSettled([
      withRetry(async (prisma) => {
        const count = await prisma.vehicle.count()
        return { test: 'vehicle_count', result: count, status: 'success' }
      }),
      withRetry(async (prisma) => {
        const count = await prisma.category.count()
        return { test: 'category_count', result: count, status: 'success' }
      }),
      withRetry(async (prisma) => {
        const result = await prisma.$queryRaw`SELECT version()` as Array<{ version: string }>
        return { test: 'postgres_version', result: result[0]?.version?.substring(0, 50), status: 'success' }
      }),
      withRetry(async (prisma) => {
        const result = await prisma.$queryRaw`SELECT count(*) as active_connections FROM pg_stat_activity WHERE state = 'active'` as Array<{ active_connections: bigint }>
        return { test: 'active_connections', result: Number(result[0]?.active_connections || 0), status: 'success' }
      })
    ])

    const tests = testResults.map(result => 
      result.status === 'fulfilled' 
        ? result.value 
        : { test: 'unknown', result: null, status: 'failed', error: (result.reason as Error)?.message }
    )

    return apiResponse({
      status: connectionInfo.isConnected ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      database: {
        connected: connectionInfo.isConnected,
        connectionCount: connectionInfo.connectionCount,
        error: connectionInfo.error
      },
      tests,
      environment: {
        nodeEnv: process.env.NODE_ENV,
        databaseUrl: process.env.DATABASE_URL ? 'configured' : 'missing'
      }
    })
  } catch (error) {
    console.error('Health check failed:', error)
    return apiError('Health check failed', 500, {
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    })
  }
}, {
  rateLimit: 'api'
})