import { unlink } from 'fs/promises'
import { join } from 'path'

/**
 * Delete a file from the uploads directory
 * @param fileUrl - The file URL (e.g., '/uploads/filename.jpg')
 * @returns Promise<boolean> - true if deleted successfully, false if file doesn't exist or error
 */
export async function deleteUploadFile(fileUrl: string): Promise<boolean> {
  try {
    // Extract filename from URL (e.g., '/uploads/filename.jpg' -> 'filename.jpg')
    if (!fileUrl || !fileUrl.startsWith('/uploads/')) {
      console.warn('Invalid file URL for deletion:', fileUrl)
      return false
    }

    const fileName = fileUrl.replace('/uploads/', '')
    if (!fileName) {
      console.warn('No filename extracted from URL:', fileUrl)
      return false
    }

    // Build full path to file
    const filePath = join(process.cwd(), 'public', 'uploads', fileName)
    
    // Delete the file
    await unlink(filePath)
    console.log('Successfully deleted file:', filePath)
    return true
    
  } catch (error) {
    // File doesn't exist or other error - don't throw, just log
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      console.warn('File not found for deletion:', fileUrl)
    } else {
      console.error('Error deleting file:', fileUrl, error)
    }
    return false
  }
}

/**
 * Delete multiple files from the uploads directory
 * @param fileUrls - Array of file URLs
 * @returns Promise<{ deleted: number, failed: number }> - Summary of deletion results
 */
export async function deleteUploadFiles(fileUrls: string[]): Promise<{ deleted: number, failed: number }> {
  if (!Array.isArray(fileUrls) || fileUrls.length === 0) {
    return { deleted: 0, failed: 0 }
  }

  let deleted = 0
  let failed = 0

  // Process deletions in parallel for better performance
  const results = await Promise.allSettled(
    fileUrls.map(url => deleteUploadFile(url))
  )

  results.forEach((result, index) => {
    if (result.status === 'fulfilled' && result.value) {
      deleted++
    } else {
      failed++
      if (result.status === 'rejected') {
        console.error('Failed to delete file:', fileUrls[index], result.reason)
      }
    }
  })

  console.log(`File deletion summary: ${deleted} deleted, ${failed} failed`)
  return { deleted, failed }
}

/**
 * Get the difference between two image arrays and return removed images
 * @param oldImages - Previous image array
 * @param newImages - New image array  
 * @returns string[] - Array of image URLs that were removed
 */
export function getRemovedImages(oldImages: string[], newImages: string[]): string[] {
  if (!Array.isArray(oldImages) || !Array.isArray(newImages)) {
    return []
  }
  
  return oldImages.filter(oldImage => !newImages.includes(oldImage))
}