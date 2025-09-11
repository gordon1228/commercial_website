import { readFile } from 'fs/promises'
import { join } from 'path'

/**
 * Load fallback data from JSON files for API routes
 * This function is used server-side to load configuration data
 * when database queries fail or return empty results
 */
export async function loadApiFallbackData<T>(fileName: string): Promise<T | null> {
  try {
    // Try to load from public/data directory first
    const publicPath = join(process.cwd(), 'public', 'data', fileName)
    
    try {
      const fileContent = await readFile(publicPath, 'utf-8')
      const jsonData = JSON.parse(fileContent)
      return jsonData as T
    } catch (publicError) {
      // If public/data doesn't exist, try loading from data directory in project root
      const rootPath = join(process.cwd(), 'data', fileName)
      
      try {
        const fileContent = await readFile(rootPath, 'utf-8')
        const jsonData = JSON.parse(fileContent)
        return jsonData as T
      } catch (rootError) {
        console.warn(`Failed to load fallback data from both paths for ${fileName}:`)
        console.warn(`Public path error:`, publicError instanceof Error ? publicError.message : String(publicError))
        console.warn(`Root path error:`, rootError instanceof Error ? rootError.message : String(rootError))
        return null
      }
    }
  } catch (error) {
    console.error(`Error loading API fallback data for ${fileName}:`, error instanceof Error ? error.message : String(error))
    return null
  }
}