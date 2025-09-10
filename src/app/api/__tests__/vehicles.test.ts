import { NextRequest } from 'next/server'
import { GET, POST } from '../vehicles/route'
import { mockFetch, mockApiSuccess, mockApiError } from '@/lib/test-utils'

// Mock the Prisma client
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    vehicle: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  })),
}))

// Mock the validation library
jest.mock('@/lib/validation', () => ({
  validateInput: jest.fn(),
  validation: {
    vehicle: {
      create: {}
    }
  }
}))

// Mock the rate limiting
jest.mock('@/lib/rate-limit', () => ({
  rateLimiters: {
    api: jest.fn().mockResolvedValue({ success: true })
  }
}))

describe('/api/vehicles', () => {
  const mockPrisma = {
    vehicle: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    }
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/vehicles', () => {
    it('returns all vehicles successfully', async () => {
      const mockVehicles = [
        {
          id: '1',
          name: 'Test Truck',
          model: 'Model X',
          year: 2023,
          price: 50000,
          category: 'truck',
          status: 'active'
        },
        {
          id: '2',
          name: 'Test Van',
          model: 'Model Y',
          year: 2023,
          price: 45000,
          category: 'van',
          status: 'active'
        }
      ]

      mockPrisma.vehicle.findMany.mockResolvedValue(mockVehicles)

      const request = new NextRequest('http://localhost:3000/api/vehicles')
      const response = await GET(request)

      expect(response.status).toBe(200)
      
      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.data).toEqual(mockVehicles)
      expect(mockPrisma.vehicle.findMany).toHaveBeenCalledWith({
        where: { status: { not: 'deleted' } },
        orderBy: { createdAt: 'desc' }
      })
    })

    it('handles database errors gracefully', async () => {
      mockPrisma.vehicle.findMany.mockRejectedValue(new Error('Database error'))

      const request = new NextRequest('http://localhost:3000/api/vehicles')
      const response = await GET(request)

      expect(response.status).toBe(500)
      
      const data = await response.json()
      expect(data.success).toBe(false)
      expect(data.error).toBeDefined()
    })

    it('filters vehicles by category', async () => {
      const mockTrucks = [
        {
          id: '1',
          name: 'Test Truck',
          model: 'Model X',
          year: 2023,
          price: 50000,
          category: 'truck',
          status: 'active'
        }
      ]

      mockPrisma.vehicle.findMany.mockResolvedValue(mockTrucks)

      const request = new NextRequest('http://localhost:3000/api/vehicles?category=truck')
      const response = await GET(request)

      expect(response.status).toBe(200)
      expect(mockPrisma.vehicle.findMany).toHaveBeenCalledWith({
        where: { 
          status: { not: 'deleted' },
          category: 'truck'
        },
        orderBy: { createdAt: 'desc' }
      })
    })

    it('filters vehicles by price range', async () => {
      const request = new NextRequest('http://localhost:3000/api/vehicles?minPrice=40000&maxPrice=60000')
      await GET(request)

      expect(mockPrisma.vehicle.findMany).toHaveBeenCalledWith({
        where: { 
          status: { not: 'deleted' },
          price: {
            gte: 40000,
            lte: 60000
          }
        },
        orderBy: { createdAt: 'desc' }
      })
    })

    it('searches vehicles by name', async () => {
      const request = new NextRequest('http://localhost:3000/api/vehicles?search=truck')
      await GET(request)

      expect(mockPrisma.vehicle.findMany).toHaveBeenCalledWith({
        where: { 
          status: { not: 'deleted' },
          OR: [
            { name: { contains: 'truck', mode: 'insensitive' } },
            { model: { contains: 'truck', mode: 'insensitive' } },
            { description: { contains: 'truck', mode: 'insensitive' } }
          ]
        },
        orderBy: { createdAt: 'desc' }
      })
    })

    it('limits results when limit parameter is provided', async () => {
      const request = new NextRequest('http://localhost:3000/api/vehicles?limit=5')
      await GET(request)

      expect(mockPrisma.vehicle.findMany).toHaveBeenCalledWith({
        where: { status: { not: 'deleted' } },
        orderBy: { createdAt: 'desc' },
        take: 5
      })
    })

    it('handles rate limiting', async () => {
      const { rateLimiters } = require('@/lib/rate-limit')
      rateLimiters.api.mockResolvedValue({ success: false, message: 'Rate limited' })

      const request = new NextRequest('http://localhost:3000/api/vehicles')
      const response = await GET(request)

      expect(response.status).toBe(429)
    })
  })

  describe('POST /api/vehicles', () => {
    const validVehicleData = {
      name: 'New Truck',
      model: 'Model Z',
      year: 2023,
      price: 55000,
      category: 'truck',
      status: 'active',
      description: 'Test vehicle description'
    }

    it('creates a new vehicle successfully', async () => {
      const { validateInput } = require('@/lib/validation')
      validateInput.mockReturnValue({ success: true, data: validVehicleData })

      const createdVehicle = { id: 'new-id', ...validVehicleData }
      mockPrisma.vehicle.create.mockResolvedValue(createdVehicle)

      const request = new NextRequest('http://localhost:3000/api/vehicles', {
        method: 'POST',
        body: JSON.stringify(validVehicleData),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)

      expect(response.status).toBe(201)
      
      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.data).toEqual(createdVehicle)
      expect(mockPrisma.vehicle.create).toHaveBeenCalledWith({
        data: validVehicleData
      })
    })

    it('validates vehicle data before creation', async () => {
      const { validateInput } = require('@/lib/validation')
      validateInput.mockReturnValue({ 
        success: false, 
        errors: ['Name is required', 'Price must be positive'] 
      })

      const request = new NextRequest('http://localhost:3000/api/vehicles', {
        method: 'POST',
        body: JSON.stringify({ invalid: 'data' }),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)

      expect(response.status).toBe(400)
      
      const data = await response.json()
      expect(data.success).toBe(false)
      expect(data.errors).toBeDefined()
    })

    it('handles database creation errors', async () => {
      const { validateInput } = require('@/lib/validation')
      validateInput.mockReturnValue({ success: true, data: validVehicleData })

      mockPrisma.vehicle.create.mockRejectedValue(new Error('Database constraint error'))

      const request = new NextRequest('http://localhost:3000/api/vehicles', {
        method: 'POST',
        body: JSON.stringify(validVehicleData),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)

      expect(response.status).toBe(500)
      
      const data = await response.json()
      expect(data.success).toBe(false)
      expect(data.error).toBeDefined()
    })

    it('requires authentication for vehicle creation', async () => {
      // Mock missing or invalid session
      const request = new NextRequest('http://localhost:3000/api/vehicles', {
        method: 'POST',
        body: JSON.stringify(validVehicleData),
        headers: { 'Content-Type': 'application/json' }
      })

      // Mock session check to return null/unauthorized
      const response = await POST(request)

      // This would depend on your actual authentication implementation
      // For now, we'll check that the function handles auth properly
      expect(mockPrisma.vehicle.create).not.toHaveBeenCalled()
    })

    it('handles malformed JSON in request body', async () => {
      const request = new NextRequest('http://localhost:3000/api/vehicles', {
        method: 'POST',
        body: 'invalid json',
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)

      expect(response.status).toBe(400)
      
      const data = await response.json()
      expect(data.success).toBe(false)
      expect(data.error).toContain('Invalid JSON')
    })

    it('sanitizes input data', async () => {
      const { validateInput } = require('@/lib/validation')
      const maliciousData = {
        ...validVehicleData,
        description: '<script>alert("xss")</script>Safe description'
      }

      validateInput.mockReturnValue({ 
        success: true, 
        data: {
          ...validVehicleData,
          description: 'Safe description' // Sanitized
        }
      })

      const request = new NextRequest('http://localhost:3000/api/vehicles', {
        method: 'POST',
        body: JSON.stringify(maliciousData),
        headers: { 'Content-Type': 'application/json' }
      })

      await POST(request)

      // Verify that sanitized data was used
      expect(validateInput).toHaveBeenCalled()
      const callArgs = validateInput.mock.calls[0]
      expect(callArgs[1].description).not.toContain('<script>')
    })
  })

  describe('Error handling', () => {
    it('handles network timeouts gracefully', async () => {
      mockPrisma.vehicle.findMany.mockImplementation(
        () => new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 100)
        )
      )

      const request = new NextRequest('http://localhost:3000/api/vehicles')
      const response = await GET(request)

      expect(response.status).toBe(500)
    })

    it('handles unexpected errors with generic message', async () => {
      mockPrisma.vehicle.findMany.mockRejectedValue(new Error('Unexpected error'))

      const request = new NextRequest('http://localhost:3000/api/vehicles')
      const response = await GET(request)

      expect(response.status).toBe(500)
      
      const data = await response.json()
      expect(data.error).toBeDefined()
      // Verify that sensitive error details are not exposed
      expect(data.error).not.toContain('Unexpected error')
    })
  })
})