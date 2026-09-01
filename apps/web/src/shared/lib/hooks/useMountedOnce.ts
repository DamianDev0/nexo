'use client'

import { useState } from 'react'

export function useMountedOnce(active: boolean): boolean {
  const [mounted, setMounted] = useState(false)
  if (active && !mounted) setMounted(true)
  return mounted
}
