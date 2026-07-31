'use client'

import { relativeLuminance } from '@repo/shared-utils'
import { useEffect, useState } from 'react'

const LIGHT_INK = 'dark'
const DARK_INK = 'light'

function resolve(): typeof LIGHT_INK | typeof DARK_INK {
  const primary = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim()
  if (!primary.startsWith('#')) return DARK_INK
  return relativeLuminance(primary) > 0.4 ? DARK_INK : LIGHT_INK
}

export function usePrimaryOrbTheme(): typeof LIGHT_INK | typeof DARK_INK {
  const [theme, setTheme] = useState<typeof LIGHT_INK | typeof DARK_INK>(DARK_INK)

  useEffect(() => {
    setTheme(resolve())
    const observer = new MutationObserver(() => setTheme(resolve()))
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['style', 'class', 'data-theme'],
    })
    return () => observer.disconnect()
  }, [])

  return theme
}
