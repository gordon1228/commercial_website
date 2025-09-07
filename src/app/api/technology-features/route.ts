import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    const features = await prisma.technologyFeature.findMany({
      where: { active: true },
      orderBy: { order: 'asc' }
    })
    
    return NextResponse.json(features)
  } catch (error) {
    console.error('Error fetching technology features:', error)
    return NextResponse.json(
      { error: 'Failed to fetch technology features' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || !['ADMIN', 'MANAGER'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    const feature = await prisma.technologyFeature.create({
      data: body
    })
    
    return NextResponse.json(feature, { status: 201 })
  } catch (error) {
    console.error('Error creating technology feature:', error)
    return NextResponse.json(
      { error: 'Failed to create technology feature' },
      { status: 500 }
    )
  }
}