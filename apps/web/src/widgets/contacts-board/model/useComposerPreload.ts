'use client'

import { useEffect } from 'react'

const IDLE_FALLBACK_MS = 1200

function warmComposerChunks(): void {
  void import('@/features/add-contact-note')
  void import('@/features/tag-contact')
  void import('@/features/compose-message')
}

export function useComposerPreload(): void {
  useEffect(() => {
    if (typeof window.requestIdleCallback === 'function') {
      const id = window.requestIdleCallback(warmComposerChunks)
      return () => window.cancelIdleCallback(id)
    }
    const id = window.setTimeout(warmComposerChunks, IDLE_FALLBACK_MS)
    return () => window.clearTimeout(id)
  }, [])
}
