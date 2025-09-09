'use client'

import { createContext, useContext, ReactNode } from 'react'

type PreviewMode = 'desktop' | 'tablet' | 'mobile'

interface PreviewContextType {
  previewMode?: PreviewMode
  isPreviewMode?: boolean
  isMobilePreview?: boolean
  isTabletPreview?: boolean
  isDesktopPreview?: boolean
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
  const contextValue = {
    previewMode,
    isPreviewMode,
    isMobilePreview: isPreviewMode && previewMode === 'mobile',
    isTabletPreview: isPreviewMode && previewMode === 'tablet',
    isDesktopPreview: isPreviewMode && previewMode === 'desktop'
  }

  return (
    <PreviewContext.Provider value={contextValue}>
      {children}
    </PreviewContext.Provider>
  )
}

export function usePreview() {
  return useContext(PreviewContext)
}