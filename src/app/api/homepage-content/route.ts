import { NextRequest, NextResponse } from 'next/server'
// import { prisma } from '@/lib/prisma'
import { createApiHandler } from '@/lib/api-handler'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

async function getHomepageContent() {
  try {
    // Direct Prisma import to avoid potential import issues
    const { prisma } = await import('@/lib/prisma')
    let content = await prisma.homepageContent.findFirst()
    
    if (!content) {
      // Create default content if none exists
      content = await prisma.homepageContent.create({
        data: {}
      })
    }
    
    return content
  } catch (error) {
    console.error('Database error in getHomepageContent:', error)
    
    // Return simplified fallback data for truck website
    return {
      id: 'fallback',
      heroTitle: 'Premium Commercial',
      heroSubtitle: 'Trucks',
      heroDescription: 'Discover elite truck solutions built for businesses that demand excellence, reliability, and uncompromising performance.',
      heroButtonPrimary: 'Explore Trucks',
      heroButtonSecondary: 'Get Quote',
      comingSoonImage: '/uploads/ComingSoon.png',
      comingSoonImageMobile: '/uploads/ComingSoon-mobile.png',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }
}

export const GET = createApiHandler(async () => {
  const content = await getHomepageContent()
  return NextResponse.json(content)
})

export const PUT = createApiHandler(async (req: NextRequest) => {
  const session = await getServerSession(authOptions)
  if (!session || (session.user?.role !== 'ADMIN' && session.user?.role !== 'MANAGER')) {
    return NextResponse.json(
      { error: 'Admin access required' },
      { status: 403 }
    )
  }

  const data = await req.json()
  
  // Direct Prisma import to avoid potential import issues  
  const { prisma } = await import('@/lib/prisma')
  
  // Get existing content or create if none exists
  let existingContent = await prisma.homepageContent.findFirst()
  
  if (!existingContent) {
    existingContent = await prisma.homepageContent.create({
      data: {}
    })
  }

  const updatedContent = await prisma.homepageContent.update({
    where: { id: existingContent.id },
    data: {
      // Essential hero section fields only
      heroTitle: data.heroTitle,
      heroSubtitle: data.heroSubtitle,
      heroDescription: data.heroDescription,
      heroButtonPrimary: data.heroButtonPrimary,
      heroButtonSecondary: data.heroButtonSecondary,
      // Coming soon section
      comingSoonImage: data.comingSoonImage,
      comingSoonImageMobile: data.comingSoonImageMobile,
    }
  })

  return NextResponse.json(updatedContent)
})