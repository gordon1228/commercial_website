import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createApiHandler } from '@/lib/api-handler'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

async function getHomepageContent() {
  let content = await prisma.homepageContent.findFirst()
  
  if (!content) {
    // Create default content if none exists
    content = await prisma.homepageContent.create({
      data: {}
    })
  }
  
  return content
}

export const GET = createApiHandler(async (req: NextRequest) => {
  const content = await getHomepageContent()
  return NextResponse.json(content)
})

export const PUT = createApiHandler(async (req: NextRequest) => {
  const session = await getServerSession(authOptions)
  if (!session || session.user?.role !== 'ADMIN') {
    return NextResponse.json(
      { error: 'Admin access required' },
      { status: 403 }
    )
  }

  const data = await req.json()
  
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
      heroTitle: data.heroTitle,
      heroSubtitle: data.heroSubtitle,
      heroDescription: data.heroDescription,
      heroButtonPrimary: data.heroButtonPrimary,
      heroButtonSecondary: data.heroButtonSecondary,
      vehiclesSold: data.vehiclesSold,
      happyClients: data.happyClients,
      yearsExperience: data.yearsExperience,
      satisfactionRate: data.satisfactionRate,
      partnersTitle: data.partnersTitle,
      partnersDescription: data.partnersDescription,
      feature1Title: data.feature1Title,
      feature1Description: data.feature1Description,
      feature2Title: data.feature2Title,
      feature2Description: data.feature2Description,
      feature3Title: data.feature3Title,
      feature3Description: data.feature3Description,
      comingSoonImage: data.comingSoonImage,
      comingSoonImageAlt: data.comingSoonImageAlt,
    }
  })

  return NextResponse.json(updatedContent)
})