import { NextResponse } from 'next/server'
import { list } from '@vercel/blob'

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const prefix = searchParams.get('folder') || ''
    
    // List all blobs from Vercel Blob Storage
    const { blobs } = await list({ prefix })
    
    // Filter for image files only and format the data
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']
    const images = blobs
      .filter(blob => {
        const ext = blob.pathname.toLowerCase().split('.').pop()
        return ext && imageExtensions.includes(`.${ext}`)
      })
      .map(blob => ({
        name: blob.pathname.split('/').pop() || blob.pathname,
        path: blob.pathname,
        url: blob.url,
        size: blob.size,
        createdAt: blob.uploadedAt,
        modifiedAt: blob.uploadedAt,
        isDefault: false
      }))
    
    // Sort by creation date (newest first)
    images.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    
    return NextResponse.json({
      images,
      folder: prefix,
      count: images.length
    })
    
  } catch (error) {
    console.error('Error fetching images from Vercel Blob:', error)
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
    
    if (!fileName) {
      return NextResponse.json({ error: 'File name is required' }, { status: 400 })
    }
    
    // Import del function from @vercel/blob
    const { del } = await import('@vercel/blob')
    
    // Find the blob by filename
    const { blobs } = await list()
    const blobToDelete = blobs.find(blob => 
      blob.pathname.split('/').pop() === fileName || blob.pathname === fileName
    )
    
    if (!blobToDelete) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }
    
    // Validate that it's an image file
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']
    const ext = blobToDelete.pathname.toLowerCase().split('.').pop()
    if (!ext || !imageExtensions.includes(`.${ext}`)) {
      return NextResponse.json({ error: 'File is not an image' }, { status: 400 })
    }
    
    // Delete the blob
    await del(blobToDelete.url)
    
    return NextResponse.json({ 
      success: true, 
      message: `File ${fileName} deleted successfully` 
    })
    
  } catch (error) {
    console.error('Error deleting file from Vercel Blob:', error)
    return NextResponse.json(
      { error: 'Failed to delete file', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}