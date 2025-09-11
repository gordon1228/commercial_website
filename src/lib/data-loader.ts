'use client'

import { useState, useEffect } from 'react'

/**
 * Custom hook to load and cache JSON data from public files
 */
export function useJsonData<T>(
  fileName: string, 
  fallback: T
): { data: T | null; loading: boolean; error: string | null } {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadJsonData = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/data/${fileName}`)
        
        if (!response.ok) {
          throw new Error(`Failed to load ${fileName}: ${response.status} ${response.statusText}`)
        }

        const jsonData = await response.json()
        setData(jsonData)
      } catch (err) {
        console.warn(`Failed to load ${fileName}, using fallback data:`, err)
        setError(err instanceof Error ? err.message : 'Unknown error')
        setData(fallback)
      } finally {
        setLoading(false)
      }
    }

    if (fileName) {
      loadJsonData()
    }
  }, [fileName, fallback])

  return { data, loading, error }
}