export const ROUTES = {
  auth: {
    login: '/login',
    onboarding: '/onboarding',
  },
  app: {
    dashboard: '/dashboard',
    contacts: { list: '/contacts', detail: (id: string) => `/contacts/${id}` },
    companies: { list: '/companies' },
    deals: { list: '/deals' },
    activities: '/activities',
    invoices: { list: '/invoices' },
    reports: '/reports',
    products: { list: '/products' },
    settings: {
      general: '/settings/general',
      appearance: '/settings/appearance',
      navigation: '/settings/navigation',
      nomenclature: '/settings/nomenclature',
    },
  },
  setup: {
    onboarding: '/onboarding/setup',
  },
} as const
