import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    console.log('Large file upload API called')
    
    // Check if Vercel Blob token is configured
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error('BLOB_READ_WRITE_TOKEN not configured')
      return NextResponse.json({ error: 'Storage not configured' }, { status: 500 })
    }
    
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      console.error('No file provided in request')
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    console.log('Large file received:', { name: file.name, size: file.size, type: file.type })

    // Validate file type
    if (!file.type.startsWith('image/')) {
      console.error('Invalid file type:', file.type)
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 })
    }

    // Validate file size (10MB limit for large uploads)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      console.error('File too large:', file.size)
      return NextResponse.json({ 
        error: 'File size must be less than 10MB',
        details: `Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB.`
      }, { status: 400 })
    }

    // Generate unique filename
    const fileExtension = file.name.split('.').pop()
    const fileName = `${uuidv4()}.${fileExtension}`
    
    console.log('Generated filename for large upload:', fileName)

    // Upload to Vercel Blob Storage using streaming for large files
    console.log('Uploading large file to Vercel Blob Storage...', {
      fileName,
      fileSize: file.size,
      fileType: file.type,
      hasToken: !!process.env.BLOB_READ_WRITE_TOKEN
    })
    
    const blob = await put(fileName, file, {
      access: 'public',
    })

    console.log('Large file upload successful, URL:', blob.url)
    return NextResponse.json({ url: blob.url }, { status: 200 })

  } catch (error) {
    console.error('Error uploading large file:', error)
    
    let errorMessage = 'Failed to upload large file'
    let statusCode = 500
    
    if (error instanceof Error) {
      if (error.message.includes('UNAUTHORIZED') || error.message.includes('401')) {
        errorMessage = 'Blob storage not authorized - check BLOB_READ_WRITE_TOKEN'
        statusCode = 401
      } else if (error.message.includes('FORBIDDEN') || error.message.includes('403')) {
        errorMessage = 'Blob storage access forbidden'
        statusCode = 403
      } else if (error.message.includes('REQUEST_TOO_LARGE') || error.message.includes('413')) {
        errorMessage = 'File too large for upload'
        statusCode = 413
      } else if (error.message.includes('NETWORK') || error.message.includes('ENOTFOUND')) {
        errorMessage = 'Network error connecting to blob storage'
        statusCode = 502
      } else {
        errorMessage = error.message
      }
    }
    
    return NextResponse.json({ 
      error: errorMessage,
      details: error instanceof Error ? error.message : 'Unknown error',
      hasToken: !!process.env.BLOB_READ_WRITE_TOKEN
    }, { status: statusCode })
  }
}