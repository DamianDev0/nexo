let tenantSlug: string | null = null

export const tenantRef = {
  get: (): string | null => tenantSlug,
  set: (slug: string | null): void => {
    tenantSlug = slug
  },
}
