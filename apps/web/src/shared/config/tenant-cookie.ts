export const TENANT_COOKIE = 'nexo_tenant'

const SLUG_PATTERN = /^[a-z0-9][a-z0-9-]{0,62}$/

export function safeTenantSlug(value: string | undefined | null): string | null {
  return value && SLUG_PATTERN.test(value) ? value : null
}

export function rememberTenantSlug(slug: string): void {
  document.cookie = `${TENANT_COOKIE}=${slug}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`
}

export function forgetTenantSlug(): void {
  document.cookie = `${TENANT_COOKIE}=; path=/; max-age=0; samesite=lax`
}

export function tenantThemeHref(slug: string, version?: number): string {
  const base = process.env.NEXT_PUBLIC_API_URL ?? '/api/v1'
  return version
    ? `${base}/tenant/${slug}/theme.css?v=${version}`
    : `${base}/tenant/${slug}/theme.css`
}
