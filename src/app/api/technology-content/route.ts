import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    let content = await prisma.technologyContent.findFirst()
    
    if (!content) {
      // Create default content if none exists
      content = await prisma.technologyContent.create({
        data: {}
      })
    }
    
    return NextResponse.json(content)
  } catch (error) {
    console.error('Error fetching technology content:', error)
    return NextResponse.json(
      { error: 'Failed to fetch technology content' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || !['ADMIN', 'MANAGER'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    // Get the first (and should be only) technology content record
    let content = await prisma.technologyContent.findFirst()
    
    if (!content) {
      // Create if doesn't exist
      content = await prisma.technologyContent.create({
        data: body
      })
    } else {
      // Update existing
      content = await prisma.technologyContent.update({
        where: { id: content.id },
        data: body
      })
    }
    
    return NextResponse.json(content)
  } catch (error) {
    console.error('Error updating technology content:', error)
    return NextResponse.json(
      { error: 'Failed to update technology content' },
      { status: 500 }
    )
  }
}