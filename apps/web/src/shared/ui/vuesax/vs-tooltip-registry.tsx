'use client'

import { useEffect } from 'react'

export function VsTooltipRegistry() {
  useEffect(() => {
    void import('./vs-tooltip')
  }, [])

  return null
}
