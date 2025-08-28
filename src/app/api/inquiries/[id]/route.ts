import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/inquiries/[id] - Get a specific inquiry by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const inquiry = await prisma.inquiry.findUnique({
      where: { id: params.id },
      include: {
        vehicle: {
          select: { id: true, name: true, slug: true }
        }
      }
    })

    if (!inquiry) {
      return NextResponse.json(
        { error: 'Inquiry not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(inquiry)
  } catch (error) {
    console.error('Error fetching inquiry:', error)
    return NextResponse.json(
      { error: 'Failed to fetch inquiry' },
      { status: 500 }
    )
  }
}

// PUT /api/inquiries/[id] - Update an inquiry
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { status, notes } = body

    // Check if inquiry exists
    const existingInquiry = await prisma.inquiry.findUnique({
      where: { id: params.id }
    })

    if (!existingInquiry) {
      return NextResponse.json(
        { error: 'Inquiry not found' },
        { status: 404 }
      )
    }

    const inquiry = await prisma.inquiry.update({
      where: { id: params.id },
      data: {
        status: status || existingInquiry.status,
        notes: notes !== undefined ? notes : existingInquiry.notes,
        updatedAt: new Date()
      },
      include: {
        vehicle: {
          select: { id: true, name: true, slug: true }
        }
      }
    })

    return NextResponse.json(inquiry)
  } catch (error) {
    console.error('Error updating inquiry:', error)
    return NextResponse.json(
      { error: 'Failed to update inquiry' },
      { status: 500 }
    )
  }
}

// DELETE /api/inquiries/[id] - Delete an inquiry
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if inquiry exists
    const existingInquiry = await prisma.inquiry.findUnique({
      where: { id: params.id }
    })

    if (!existingInquiry) {
      return NextResponse.json(
        { error: 'Inquiry not found' },
        { status: 404 }
      )
    }

    // Delete the inquiry
    await prisma.inquiry.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Inquiry deleted successfully' })
  } catch (error) {
    console.error('Error deleting inquiry:', error)
    return NextResponse.json(
      { error: 'Failed to delete inquiry' },
      { status: 500 }
    )
  }
}