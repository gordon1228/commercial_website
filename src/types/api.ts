// Generic API response types
export interface ApiResponse<T = unknown> {
  data?: T
  error?: string
  message?: string
  success?: boolean
}

export interface ApiError {
  error: string
  details?: unknown
  status?: number
}

export interface ValidationError {
  error: string
  details: {
    field: string
    message: string
  }[]
}

// Pagination types
export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
    hasNext: boolean
    hasPrevious: boolean
  }
  meta?: {
    totalCount: number
    filteredCount: number
  }
}

// Query parameters for list endpoints
export interface ListQueryParams {
  page?: number
  limit?: number
  sort?: string
  order?: 'asc' | 'desc'
  search?: string
  filter?: Record<string, string | string[]>
}

// Common CRUD operation types
export interface CreateResponse<T> {
  data: T
  message?: string
  success: true
}

export interface UpdateResponse<T> {
  data: T
  message?: string
  success: true
}

export interface DeleteResponse {
  success: true
  message?: string
}

// Status-based responses
export interface StatusToggleResponse {
  success: true
  active: boolean
  message?: string
}

// File upload responses
export interface UploadResponse {
  success: true
  data: {
    filename: string
    originalName: string
    url: string
    size: number
    mimetype: string
  }
}

export interface UploadError {
  error: string
  details?: {
    filename?: string
    reason?: string
  }
}

// Health check and system status
export interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy'
  timestamp: string
  services: {
    database: 'connected' | 'disconnected'
    redis?: 'connected' | 'disconnected'
  }
  uptime: number
}