import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createApiHandler } from '@/lib/api-handler'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

export const GET = createApiHandler(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url)
  const includeInactive = searchParams.get('includeInactive') === 'true'

  const where = includeInactive ? {} : { active: true }

  const partners = await prisma.partner.findMany({
    where,
    orderBy: { order: 'asc' }
  })

  return NextResponse.json({ partners })
})

export const POST = createApiHandler(async (req: NextRequest) => {
  const session = await getServerSession(authOptions)
  if (!session || session.user?.role !== 'ADMIN') {
    return NextResponse.json(
      { error: 'Admin access required' },
      { status: 403 }
    )
  }

  const data = await req.json()
  
  // Get the highest order value and increment by 1
  const lastPartner = await prisma.partner.findFirst({
    orderBy: { order: 'desc' }
  })
  
  const newOrder = lastPartner ? lastPartner.order + 1 : 1

  const partner = await prisma.partner.create({
    data: {
      name: data.name,
      logo: data.logo,
      website: data.website,
      active: data.active ?? true,
      order: data.order ?? newOrder
    }
  })

  return NextResponse.json(partner)
})

export const PUT = createApiHandler(async (req: NextRequest) => {
  const session = await getServerSession(authOptions)
  if (!session || session.user?.role !== 'ADMIN') {
    return NextResponse.json(
      { error: 'Admin access required' },
      { status: 403 }
    )
  }

  const partners = await req.json()
  
  // Update all partners with new data
  const updatePromises = partners.map((partner: { id?: string; name: string; logo: string; website?: string; active?: boolean; order: number }) => 
    prisma.partner.upsert({
      where: { id: partner.id || 'new' },
      update: {
        name: partner.name,
        logo: partner.logo,
        website: partner.website,
        active: partner.active,
        order: partner.order
      },
      create: {
        name: partner.name,
        logo: partner.logo,
        website: partner.website || null,
        active: partner.active ?? true,
        order: partner.order
      }
    })
  )

  const updatedPartners = await Promise.all(updatePromises)

  return NextResponse.json({ partners: updatedPartners })
})