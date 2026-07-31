import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'

import { useAuthStore } from '@/entities/session'
import settingsService from '@/shared/api/services/settings.service'
import { rememberTenantSlug, safeTenantSlug, tenantThemeHref } from '@/shared/config/tenant-cookie'
import { QUERY_KEYS } from '@/shared/query/query-keys'

const BRANDING_STALE_MS = 5 * 60 * 1000

export function useTenantBranding() {
  const tenantSlug = useAuthStore((s) => s.tenantSlug)
  const setTenantSlug = useAuthStore((s) => s.setTenantSlug)

  const { data: general } = useQuery({
    queryKey: QUERY_KEYS.settings.general,
    queryFn: settingsService.getGeneral,
    staleTime: BRANDING_STALE_MS,
  })

  const { data: theme, dataUpdatedAt: themeUpdatedAt } = useQuery({
    queryKey: QUERY_KEYS.settings.theme,
    queryFn: settingsService.getTheme,
    staleTime: BRANDING_STALE_MS,
  })

  useEffect(() => {
    if (!tenantSlug && general?.slug) setTenantSlug(general.slug)
  }, [tenantSlug, general?.slug, setTenantSlug])

  const slug = safeTenantSlug(tenantSlug ?? general?.slug)

  useEffect(() => {
    if (slug) rememberTenantSlug(slug)
  }, [slug])

  return {
    slug,
    themeCssHref: slug ? tenantThemeHref(slug, themeUpdatedAt) : null,
    name: theme?.branding?.companyName ?? general?.name ?? 'NexoCRM',
    plan: general?.plan ?? null,
    logoUrl: theme?.branding?.logoUrl ?? null,
    darkModeDefault: theme?.darkModeDefault ?? null,
  }
}
