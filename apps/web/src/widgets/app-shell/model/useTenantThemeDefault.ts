import { useTheme } from 'next-themes'
import { useEffect } from 'react'

import type { TenantTheme } from '@repo/shared-types'

const APPLIED_KEY_PREFIX = 'nexo-theme-applied:'

export function useTenantThemeDefault(
  slug: string | null,
  darkModeDefault: TenantTheme['darkModeDefault'] | null,
) {
  const { setTheme } = useTheme()

  useEffect(() => {
    if (!slug || !darkModeDefault) return
    const key = `${APPLIED_KEY_PREFIX}${slug}`
    if (localStorage.getItem(key)) return
    localStorage.setItem(key, darkModeDefault)
    setTheme(darkModeDefault)
  }, [slug, darkModeDefault, setTheme])
}
