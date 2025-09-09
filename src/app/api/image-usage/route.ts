import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

interface ImageUsage {
  url: string
  usedIn: {
    type: string
    id?: string
    name?: string
    context: string
  }[]
}

export async function GET() {
  try {
    // Get all vehicles with their images
    const vehicles = await prisma.vehicle.findMany({
      select: {
        id: true,
        name: true,
        images: true
      }
    })

    // Get technology content with images
    const technologyContent = await prisma.technologyContent.findFirst({
      select: {
        heroBackgroundImage: true
      }
    })

    // Get technology features with images  
    const technologyFeatures = await prisma.technologyFeature.findMany({
      select: {
        id: true,
        title: true,
        iconName: true
      }
    })

    // Get homepage content with images
    const homepageContent = await prisma.homepageContent.findFirst({
      select: {
        comingSoonImage: true,
        comingSoonImageMobile: true
      }
    })

    // Get partner logos
    const partners = await prisma.partner.findMany({
      select: {
        id: true,
        name: true,
        logo: true
      }
    })

    // Get category images
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        image: true
      }
    })

    // Build usage map
    const imageUsageMap = new Map<string, ImageUsage['usedIn']>()

    // Add vehicle images
    vehicles.forEach(vehicle => {
      vehicle.images.forEach(imageUrl => {
        if (!imageUrl) return
        
        if (!imageUsageMap.has(imageUrl)) {
          imageUsageMap.set(imageUrl, [])
        }
        
        imageUsageMap.get(imageUrl)!.push({
          type: 'vehicle',
          id: vehicle.id,
          name: vehicle.name,
          context: 'Vehicle Images'
        })
      })
    })

    // Add technology hero background
    if (technologyContent?.heroBackgroundImage) {
      const imageUrl = technologyContent.heroBackgroundImage
      if (!imageUsageMap.has(imageUrl)) {
        imageUsageMap.set(imageUrl, [])
      }
      
      imageUsageMap.get(imageUrl)!.push({
        type: 'technology',
        name: 'Technology Page',
        context: 'Hero Background'
      })
    }

    // Add technology feature icons (only if they are image URLs starting with /)
    technologyFeatures.forEach(feature => {
      if (feature.iconName && feature.iconName.startsWith('/')) {
        const imageUrl = feature.iconName
        if (!imageUsageMap.has(imageUrl)) {
          imageUsageMap.set(imageUrl, [])
        }
        
        imageUsageMap.get(imageUrl)!.push({
          type: 'technology-feature',
          id: feature.id,
          name: feature.title,
          context: 'Technology Feature Icon'
        })
      }
    })

    // Add homepage images
    if (homepageContent) {
      if (homepageContent.comingSoonImage) {
        const imageUrl = homepageContent.comingSoonImage
        if (!imageUsageMap.has(imageUrl)) {
          imageUsageMap.set(imageUrl, [])
        }
        
        imageUsageMap.get(imageUrl)!.push({
          type: 'homepage',
          name: 'Homepage',
          context: 'Coming Soon Desktop Image'
        })
      }

      if (homepageContent.comingSoonImageMobile) {
        const imageUrl = homepageContent.comingSoonImageMobile
        if (!imageUsageMap.has(imageUrl)) {
          imageUsageMap.set(imageUrl, [])
        }
        
        imageUsageMap.get(imageUrl)!.push({
          type: 'homepage',
          name: 'Homepage',
          context: 'Coming Soon Mobile Image'
        })
      }
    }

    // Add partner logos
    partners.forEach(partner => {
      if (partner.logo) {
        const imageUrl = partner.logo
        if (!imageUsageMap.has(imageUrl)) {
          imageUsageMap.set(imageUrl, [])
        }
        
        imageUsageMap.get(imageUrl)!.push({
          type: 'partner',
          id: partner.id,
          name: partner.name,
          context: 'Partner Logo'
        })
      }
    })

    // Add category images
    categories.forEach(category => {
      if (category.image) {
        const imageUrl = category.image
        if (!imageUsageMap.has(imageUrl)) {
          imageUsageMap.set(imageUrl, [])
        }
        
        imageUsageMap.get(imageUrl)!.push({
          type: 'category',
          id: category.id,
          name: category.name,
          context: 'Category Image'
        })
      }
    })

    // Convert map to array of usage objects
    const imageUsages: ImageUsage[] = Array.from(imageUsageMap.entries()).map(([url, usedIn]) => ({
      url,
      usedIn
    }))

    return NextResponse.json({
      success: true,
      usages: imageUsages
    })

  } catch (error) {
    console.error('Error fetching image usage:', error)
    return NextResponse.json(
      { error: 'Failed to fetch image usage', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}