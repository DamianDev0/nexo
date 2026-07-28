'use client'

import { useTenantBranding } from '../model/useTenantBranding'
import { useTenantThemeDefault } from '../model/useTenantThemeDefault'

export function TenantThemeLoader() {
  const { slug, themeCssHref, darkModeDefault } = useTenantBranding()
  useTenantThemeDefault(slug, darkModeDefault)

  if (!themeCssHref) return null

  return <link rel="stylesheet" href={themeCssHref} />
}
