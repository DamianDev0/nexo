'use client'

import { useTenantThemeDefault } from '../model/useTenantThemeDefault'
import { useTenantBranding } from '../query/useTenantBranding'

export function TenantThemeLoader() {
  const { slug, themeCssHref, darkModeDefault } = useTenantBranding()
  useTenantThemeDefault(slug, darkModeDefault)

  if (!themeCssHref) return null

  return <link rel="stylesheet" href={themeCssHref} />
}
