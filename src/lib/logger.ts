import { NextRequest } from 'next/server'

// Log levels
export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3
}

// Log entry interface
export interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  category: string
  userId?: string
  sessionId?: string
  requestId?: string
  ip?: string
  userAgent?: string
  url?: string
  method?: string
  statusCode?: number
  responseTime?: number
  error?: {
    name: string
    message: string
    stack?: string
    code?: string
  }
  metadata?: Record<string, any>
}

// Logger configuration
export interface LoggerConfig {
  level: LogLevel
  enableConsole: boolean
  enableFile: boolean
  enableRemote: boolean
  filePath?: string
  remoteEndpoint?: string
  apiKey?: string
  maxFileSize?: number
  maxFiles?: number
  sanitizeData?: boolean
}

// Default configuration
const DEFAULT_CONFIG: LoggerConfig = {
  level: process.env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG,
  enableConsole: true,
  enableFile: process.env.NODE_ENV === 'production',
  enableRemote: false,
  filePath: './logs/app.log',
  maxFileSize: 10 * 1024 * 1024, // 10MB
  maxFiles: 5,
  sanitizeData: true
}

// Data sanitization for logging
const SENSITIVE_FIELDS = [
  'password', 'token', 'apiKey', 'secret', 'authorization', 
  'cookie', 'session', 'credit', 'card', 'ssn', 'social',
  'phone', 'email', 'address', 'name'
]

function sanitizeData(data: any): any {
  if (!data || typeof data !== 'object') return data
  
  const sanitized = Array.isArray(data) ? [...data] : { ...data }
  
  for (const [key, value] of Object.entries(sanitized)) {
    const lowerKey = key.toLowerCase()
    
    if (SENSITIVE_FIELDS.some(field => lowerKey.includes(field))) {
      sanitized[key] = '[REDACTED]'
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeData(value)
    }
  }
  
  return sanitized
}

// Logger class
export class Logger {
  private config: LoggerConfig
  private logBuffer: LogEntry[] = []
  private flushInterval?: NodeJS.Timeout

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    
    // Set up periodic flush for remote logging
    if (this.config.enableRemote) {
      this.flushInterval = setInterval(() => this.flush(), 10000) // Flush every 10 seconds
    }
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    category: string,
    metadata?: Record<string, any>
  ): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      category,
      metadata: this.config.sanitizeData ? sanitizeData(metadata) : metadata
    }

    return entry
  }

  private shouldLog(level: LogLevel): boolean {
    return level <= this.config.level
  }

  private formatConsoleMessage(entry: LogEntry): string {
    const levelNames = ['ERROR', 'WARN', 'INFO', 'DEBUG']
    const levelName = levelNames[entry.level]
    const timestamp = new Date(entry.timestamp).toLocaleTimeString()
    
    return `[${timestamp}] ${levelName} [${entry.category}] ${entry.message}`
  }

  private async writeToConsole(entry: LogEntry): Promise<void> {
    if (!this.config.enableConsole) return

    const message = this.formatConsoleMessage(entry)
    
    switch (entry.level) {
      case LogLevel.ERROR:
        console.error(message, entry.error || '', entry.metadata || '')
        break
      case LogLevel.WARN:
        console.warn(message, entry.metadata || '')
        break
      case LogLevel.INFO:
        console.info(message, entry.metadata || '')
        break
      case LogLevel.DEBUG:
        console.debug(message, entry.metadata || '')
        break
    }
  }

  private async writeToFile(entry: LogEntry): Promise<void> {
    if (!this.config.enableFile || typeof window !== 'undefined') return

    try {
      const fs = await import('fs/promises')
      const path = await import('path')
      
      if (!this.config.filePath) return
      
      const logDir = path.dirname(this.config.filePath)
      await fs.mkdir(logDir, { recursive: true })
      
      const logLine = JSON.stringify(entry) + '\n'
      await fs.appendFile(this.config.filePath, logLine)
      
      // TODO: Implement log rotation based on file size and count
    } catch (error) {
      console.error('Failed to write log to file:', error)
    }
  }

  private async writeToRemote(entry: LogEntry): Promise<void> {
    if (!this.config.enableRemote || !this.config.remoteEndpoint) return

    this.logBuffer.push(entry)
    
    // Flush if buffer is getting large
    if (this.logBuffer.length >= 100) {
      await this.flush()
    }
  }

  private async flush(): Promise<void> {
    if (this.logBuffer.length === 0) return

    try {
      const logs = [...this.logBuffer]
      this.logBuffer = []

      if (this.config.remoteEndpoint) {
        await fetch(this.config.remoteEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
          },
          body: JSON.stringify({ logs })
        })
      }
    } catch (error) {
      console.error('Failed to flush logs to remote endpoint:', error)
      // Put logs back in buffer for retry
      this.logBuffer.unshift(...this.logBuffer)
    }
  }

  private async writeLog(entry: LogEntry): Promise<void> {
    await Promise.all([
      this.writeToConsole(entry),
      this.writeToFile(entry),
      this.writeToRemote(entry)
    ])
  }

  // Public logging methods
  async error(message: string, error?: Error | string, metadata?: Record<string, any>): Promise<void> {
    if (!this.shouldLog(LogLevel.ERROR)) return

    const entry = this.createLogEntry(LogLevel.ERROR, message, 'APPLICATION', metadata)
    
    if (error) {
      if (error instanceof Error) {
        entry.error = {
          name: error.name,
          message: error.message,
          stack: error.stack,
          code: (error as any).code
        }
      } else {
        entry.error = {
          name: 'Error',
          message: error.toString()
        }
      }
    }

    await this.writeLog(entry)
  }

  async warn(message: string, metadata?: Record<string, any>): Promise<void> {
    if (!this.shouldLog(LogLevel.WARN)) return
    
    const entry = this.createLogEntry(LogLevel.WARN, message, 'APPLICATION', metadata)
    await this.writeLog(entry)
  }

  async info(message: string, metadata?: Record<string, any>): Promise<void> {
    if (!this.shouldLog(LogLevel.INFO)) return
    
    const entry = this.createLogEntry(LogLevel.INFO, message, 'APPLICATION', metadata)
    await this.writeLog(entry)
  }

  async debug(message: string, metadata?: Record<string, any>): Promise<void> {
    if (!this.shouldLog(LogLevel.DEBUG)) return
    
    const entry = this.createLogEntry(LogLevel.DEBUG, message, 'APPLICATION', metadata)
    await this.writeLog(entry)
  }

  // Specialized logging methods
  async security(message: string, metadata?: Record<string, any>): Promise<void> {
    const entry = this.createLogEntry(LogLevel.WARN, message, 'SECURITY', metadata)
    await this.writeLog(entry)
  }

  async performance(message: string, responseTime: number, metadata?: Record<string, any>): Promise<void> {
    const entry = this.createLogEntry(LogLevel.INFO, message, 'PERFORMANCE', {
      ...metadata,
      responseTime
    })
    await this.writeLog(entry)
  }

  async audit(message: string, userId?: string, metadata?: Record<string, any>): Promise<void> {
    const entry = this.createLogEntry(LogLevel.INFO, message, 'AUDIT', metadata)
    entry.userId = userId
    await this.writeLog(entry)
  }

  // Request logging
  async logRequest(
    req: NextRequest,
    statusCode: number,
    responseTime: number,
    userId?: string
  ): Promise<void> {
    const entry = this.createLogEntry(
      statusCode >= 400 ? LogLevel.WARN : LogLevel.INFO,
      `${req.method} ${req.nextUrl.pathname}`,
      'REQUEST',
      {
        headers: Object.fromEntries(req.headers.entries()),
        query: Object.fromEntries(req.nextUrl.searchParams.entries())
      }
    )

    entry.method = req.method
    entry.url = req.nextUrl.pathname
    entry.statusCode = statusCode
    entry.responseTime = responseTime
    entry.userId = userId
    entry.ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    entry.userAgent = req.headers.get('user-agent') || 'unknown'

    await this.writeLog(entry)
  }

  // Database logging
  async logDatabase(operation: string, table: string, duration: number, metadata?: Record<string, any>): Promise<void> {
    const entry = this.createLogEntry(
      LogLevel.DEBUG,
      `DB ${operation} on ${table}`,
      'DATABASE',
      {
        ...metadata,
        operation,
        table,
        duration
      }
    )

    await this.writeLog(entry)
  }

  // Authentication logging
  async logAuth(event: string, userId?: string, success: boolean = true, metadata?: Record<string, any>): Promise<void> {
    const entry = this.createLogEntry(
      success ? LogLevel.INFO : LogLevel.WARN,
      `Auth ${event}: ${success ? 'SUCCESS' : 'FAILURE'}`,
      'AUTHENTICATION',
      metadata
    )

    entry.userId = userId
    await this.writeLog(entry)
  }

  // Cleanup method
  cleanup(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval)
    }
    // Final flush
    this.flush()
  }
}

// Global logger instance
export const logger = new Logger()

// Request logger middleware helper
export function createRequestLogger() {
  return async (req: NextRequest, statusCode: number, responseTime: number, userId?: string) => {
    await logger.logRequest(req, statusCode, responseTime, userId)
  }
}

// Error boundary logger
export function logErrorBoundary(error: Error, errorInfo?: any): void {
  logger.error('React Error Boundary caught an error', error, {
    componentStack: errorInfo?.componentStack,
    errorBoundary: true
  })
}

// Unhandled rejection handler
if (typeof process !== 'undefined') {
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Promise Rejection', reason as Error, {
      promise: promise.toString(),
      type: 'unhandledRejection'
    })
  })

  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception', error, {
      type: 'uncaughtException'
    })
    // Don't exit the process in production, but log it
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1)
    }
  })
}

// Browser error handler
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    logger.error('Browser Error', event.error || new Error(event.message), {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      type: 'browserError'
    })
  })

  window.addEventListener('unhandledrejection', (event) => {
    logger.error('Unhandled Promise Rejection in browser', event.reason, {
      type: 'unhandledRejection'
    })
  })
}

// Log rotation utility (for file logging)
export async function rotateLogFiles(logFilePath: string, maxFiles: number = 5): Promise<void> {
  if (typeof window !== 'undefined') return // Browser environment

  try {
    const fs = await import('fs/promises')
    const path = await import('path')

    const logDir = path.dirname(logFilePath)
    const baseName = path.basename(logFilePath, path.extname(logFilePath))
    const extension = path.extname(logFilePath)

    // Archive current log file
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const archivedName = `${baseName}-${timestamp}${extension}`
    const archivedPath = path.join(logDir, archivedName)

    try {
      await fs.access(logFilePath)
      await fs.rename(logFilePath, archivedPath)
    } catch {
      // File doesn't exist, nothing to rotate
      return
    }

    // Remove old log files if we exceed maxFiles
    const files = await fs.readdir(logDir)
    const logFiles = files
      .filter(file => file.startsWith(baseName) && file !== path.basename(logFilePath))
      .map(file => ({
        name: file,
        path: path.join(logDir, file),
        stat: fs.stat(path.join(logDir, file))
      }))

    // Sort by creation time (newest first)
    const sortedFiles = await Promise.all(
      logFiles.map(async file => ({
        ...file,
        stat: await file.stat
      }))
    )

    sortedFiles.sort((a, b) => b.stat.mtime.getTime() - a.stat.mtime.getTime())

    // Remove excess files
    if (sortedFiles.length > maxFiles) {
      const filesToDelete = sortedFiles.slice(maxFiles)
      await Promise.all(
        filesToDelete.map(file => fs.unlink(file.path))
      )
    }
  } catch (error) {
    console.error('Failed to rotate log files:', error)
  }
}

export { LogLevel }