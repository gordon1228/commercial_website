import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { createApiHandler } from '@/lib/api-handler'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export const GET = createApiHandler(async (req: NextRequest) => {
  const session = await getServerSession(authOptions)
  if (!session || session.user?.role !== 'ADMIN') {
    return NextResponse.json(
      { error: 'Admin access required' },
      { status: 403 }
    )
  }

  const { searchParams } = new URL(req.url)
  const folder = searchParams.get('folder') || 'images'

  try {
    const publicPath = path.join(process.cwd(), 'public')
    const folderPath = path.join(publicPath, folder)
    
    // Check if folder exists
    try {
      await fs.access(folderPath)
    } catch {
      return NextResponse.json({ images: [] })
    }

    const files = await fs.readdir(folderPath)
    
    // Filter for image files
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
    const imageFiles = files.filter(file => 
      imageExtensions.some(ext => file.toLowerCase().endsWith(ext))
    )

    // Create full paths
    const images = imageFiles.map(file => ({
      name: file,
      path: `/${folder}/${file}`,
      url: `/${folder}/${file}`
    }))

    // If looking in uploads folder, also check the images folder for default options
    if (folder === 'uploads') {
      try {
        const imagesPath = path.join(publicPath, 'images')
        const defaultFiles = await fs.readdir(imagesPath)
        const defaultImages = defaultFiles
          .filter(file => imageExtensions.some(ext => file.toLowerCase().endsWith(ext)))
          .map(file => ({
            name: file,
            path: `/images/${file}`,
            url: `/images/${file}`,
            isDefault: true
          }))
        
        images.unshift(...defaultImages)
      } catch {
        // Images folder doesn't exist anymore, that's okay
        console.log('No default images folder found - using uploads only')
      }
    }

    return NextResponse.json({ images })
  } catch (error) {
    console.error('Error reading images:', error)
    return NextResponse.json(
      { error: 'Failed to load images' },
      { status: 500 }
    )
  }
})