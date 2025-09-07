import { readFile } from 'fs/promises'
import { join } from 'path'

/**
 * Server-side JSON data loader for API routes
 * Loads JSON files from public/data directory
 */
export async function loadApiJsonData<T>(filename: string): Promise<T | null> {
  try {
    const filePath = join(process.cwd(), 'public', 'data', filename)
    const fileContent = await readFile(filePath, 'utf8')
    const data = JSON.parse(fileContent) as T
    return data
  } catch (error) {
    console.error(`Error loading JSON file ${filename}:`, error)
    return null
  }
}

/**
 * Load API fallback data with error handling
 * Returns the loaded data or null if failed
 */
export async function loadApiFallbackData<T>(filename: string): Promise<T | null> {
  return await loadApiJsonData<T>(`api/${filename}`)
}