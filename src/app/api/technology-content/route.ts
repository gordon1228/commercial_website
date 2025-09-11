import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    console.log('GET /api/technology-content called')
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
    console.log('PUT /api/technology-content called')
    const session = await getServerSession(authOptions)
    console.log('Session in technology-content PUT:', {
      hasSession: !!session,
      hasUser: !!session?.user,
      role: session?.user?.role,
      email: session?.user?.email
    })
    
    if (!session?.user || !['ADMIN', 'MANAGER'].includes(session.user.role)) {
      console.log('Unauthorized access attempt to technology-content PUT')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    console.log('Request body:', JSON.stringify(body, null, 2))
    
    // Validate required fields are present
    const requiredFields = ['heroTitle', 'heroSubtitle', 'heroBackgroundImage', 'heroBackgroundImageAlt', 
                           'section1Title', 'section1Description', 'section2Title', 'section2Description',
                           'section3Title', 'section3Description', 'section4Title', 'section4Description']
    
    const validData: any = {}
    for (const field of requiredFields) {
      if (body[field] !== undefined) {
        validData[field] = body[field]
      }
    }
    
    console.log('Valid data to update:', JSON.stringify(validData, null, 2))
    
    // Get the first (and should be only) technology content record
    let content = await prisma.technologyContent.findFirst()
    
    if (!content) {
      // Create if doesn't exist
      console.log('Creating new technology content record')
      content = await prisma.technologyContent.create({
        data: validData
      })
      console.log('Created technology content:', content)
    } else {
      // Update existing
      console.log('Updating existing technology content with ID:', content.id)
      content = await prisma.technologyContent.update({
        where: { id: content.id },
        data: validData
      })
      console.log('Updated technology content:', content)
    }
    
    return NextResponse.json(content)
  } catch (error) {
    console.error('Error updating technology content:', error)
    
    // Enhanced error logging
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
    
    // Check for specific Prisma errors
    if ((error as any)?.code === 'P2002') {
      return NextResponse.json(
        { error: 'A unique constraint violation occurred' },
        { status: 400 }
      )
    }
    
    if ((error as any)?.code === 'P2021' || (error as any)?.message?.includes('does not exist')) {
      return NextResponse.json(
        { error: 'Database table does not exist. Please run: npx prisma db push' },
        { status: 503 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to update technology content', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}