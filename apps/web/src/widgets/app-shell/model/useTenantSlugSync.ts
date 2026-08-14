'use client'

import { useEffect } from 'react'

import { useAuthStore } from '@/entities/session'
import { rememberTenantSlug } from '@/shared/config/tenant-cookie'

export function useTenantSlugSync(slug: string | null) {
  const storedSlug = useAuthStore((state) => state.tenantSlug)
  const setTenantSlug = useAuthStore((state) => state.setTenantSlug)

  useEffect(() => {
    if (!slug) return
    rememberTenantSlug(slug)
    if (!storedSlug) setTenantSlug(slug)
  }, [slug, storedSlug, setTenantSlug])
}
