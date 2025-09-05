// import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createApiHandler, apiResponse, apiError } from '@/lib/api-handler'

// GET /api/vehicles/[id] - Get a specific vehicle by ID
export const GET = createApiHandler(async (req, { params }) => {
  const vehicle = await prisma.vehicle.findUnique({
    where: { id: params.id },
    include: {
      category: {
        select: { id: true, name: true }
      }
    }
  })

  if (!vehicle) {
    return apiError('Vehicle not found', 404)
  }

  return apiResponse(vehicle)
}, {
  rateLimit: 'api'
})

// PUT /api/vehicles/[id] - Update a vehicle
export const PUT = createApiHandler(async (req, { params }) => {
  const body = await req.json()
  
  const {
    name,
    description,
    price,
    categoryId,
    specs,
    images,
    features,
    status,
    featured
  } = body

  // Validate required fields
  if (!name || !price || !categoryId) {
    return apiError('Missing required fields: name, price, categoryId', 400)
  }

  // Check if vehicle exists
  const existingVehicle = await prisma.vehicle.findUnique({
    where: { id: params.id }
  })

  if (!existingVehicle) {
    return apiError('Vehicle not found', 404)
  }

  // Generate new slug if name changed
  let slug = existingVehicle.slug
  if (name && name !== existingVehicle.name) {
    const newSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    // Check if new slug already exists
    const slugExists = await prisma.vehicle.findFirst({
      where: { 
        slug: newSlug,
        id: { not: params.id }
      }
    })

    if (slugExists) {
      return apiError('A vehicle with this name already exists', 409)
    }

    slug = newSlug
  }

  // Merge features into specs if they exist
  const mergedSpecs = specs ? { ...specs } : {}
  if (features && Array.isArray(features)) {
    mergedSpecs.features = features
  }

  const updateData = {
    name,
    slug,
    description,
    price: Number(price),
    categoryId,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    specs: mergedSpecs as any,
    images: images || [],
    status: status || 'AVAILABLE',
    featured: Boolean(featured)
  }
  
  const vehicle = await prisma.vehicle.update({
    where: { id: params.id },
    data: updateData,
    include: {
      category: {
        select: { id: true, name: true }
      }
    }
  })

  return apiResponse(vehicle)
}, {
  requireAuth: true,
  requireAdmin: true,
  rateLimit: 'api'
})

// DELETE /api/vehicles/[id] - Delete a vehicle
export const DELETE = createApiHandler(async (req, { params }) => {
  // Check if vehicle exists
  const existingVehicle = await prisma.vehicle.findUnique({
    where: { id: params.id }
  })

  if (!existingVehicle) {
    return apiError('Vehicle not found', 404)
  }

  // Delete the vehicle
  await prisma.vehicle.delete({
    where: { id: params.id }
  })

  return apiResponse({ message: 'Vehicle deleted successfully' })
}, {
  requireAuth: true,
  requireAdmin: true,
  rateLimit: 'api'
})