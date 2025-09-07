'use client'

import { createContext, useContext, ReactNode } from 'react'

type PreviewMode = 'desktop' | 'tablet' | 'mobile'

interface PreviewContextType {
  previewMode?: PreviewMode
  isPreviewMode?: boolean
}

const PreviewContext = createContext<PreviewContextType>({})

export function PreviewProvider({ 
  children, 
  previewMode, 
  isPreviewMode = false 
}: { 
  children: ReactNode
  previewMode?: PreviewMode
  isPreviewMode?: boolean
}) {
  return (
    <PreviewContext.Provider value={{ previewMode, isPreviewMode }}>
      {children}
    </PreviewContext.Provider>
  )
}

export function usePreview() {
  return useContext(PreviewContext)
}