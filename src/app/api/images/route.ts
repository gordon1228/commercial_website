import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const folder = searchParams.get('folder') || 'uploads'
    
    // Define the directory path
    const uploadsDir = path.join(process.cwd(), 'public', folder)
    
    // Check if directory exists
    try {
      await fs.access(uploadsDir)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      return NextResponse.json({ 
        images: [],
        error: `Folder '${folder}' not found` 
      })
    }
    
    // Read directory contents
    const files = await fs.readdir(uploadsDir)
    
    // Filter for image files only
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']
    const imageFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase()
      return imageExtensions.includes(ext)
    })
    
    // Get file stats and create image objects
    const images = await Promise.all(
      imageFiles.map(async (file) => {
        const filePath = path.join(uploadsDir, file)
        const stats = await fs.stat(filePath)
        
        return {
          name: file,
          path: `/${folder}/${file}`,
          url: `/${folder}/${file}`,
          size: stats.size,
          createdAt: stats.birthtime,
          modifiedAt: stats.mtime,
          isDefault: false
        }
      })
    )
    
    // Sort by creation date (newest first)
    images.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    
    return NextResponse.json({
      images,
      folder,
      count: images.length
    })
    
  } catch (error) {
    console.error('Error fetching images:', error)
    return NextResponse.json(
      { error: 'Failed to fetch images', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const fileName = searchParams.get('file')
    const folder = searchParams.get('folder') || 'uploads'
    
    if (!fileName) {
      return NextResponse.json({ error: 'File name is required' }, { status: 400 })
    }
    
    // Define the file path
    const filePath = path.join(process.cwd(), 'public', folder, fileName)
    
    // Check if file exists
    try {
      await fs.access(filePath)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }
    
    // Validate that it's an image file
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']
    const ext = path.extname(fileName).toLowerCase()
    if (!imageExtensions.includes(ext)) {
      return NextResponse.json({ error: 'File is not an image' }, { status: 400 })
    }
    
    // Delete the file
    await fs.unlink(filePath)
    
    return NextResponse.json({ 
      success: true, 
      message: `File ${fileName} deleted successfully` 
    })
    
  } catch (error) {
    console.error('Error deleting file:', error)
    return NextResponse.json(
      { error: 'Failed to delete file', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}