'use client'

import { useQuery } from '@tanstack/react-query'

import { useAuthStore } from '@/entities/session'
import settingsService from '@/shared/api/services/settings.service'
import { safeTenantSlug, tenantThemeHref } from '@/shared/config/tenant-cookie'
import { QUERY_KEYS } from '@/shared/query/query-keys'

const BRANDING_STALE_MS = 5 * 60 * 1000

export function useTenantBranding() {
  const storedSlug = useAuthStore((state) => state.tenantSlug)

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

  const slug = safeTenantSlug(storedSlug ?? general?.slug)

  return {
    slug,
    themeCssHref: slug ? tenantThemeHref(slug, themeUpdatedAt) : null,
    name: theme?.branding?.companyName ?? general?.name ?? 'NexoCRM',
    plan: general?.plan ?? null,
    logoUrl: theme?.branding?.logoUrl ?? null,
    darkModeDefault: theme?.darkModeDefault ?? null,
  }
}
