export const ROUTES = {
  auth: {
    login: '/login',
    onboarding: '/onboarding',
  },
  app: {
    dashboard: '/dashboard',
    contacts: { list: '/contacts' },
    companies: { list: '/companies' },
    deals: { list: '/deals' },
    activities: '/activities',
    invoices: { list: '/invoices' },
    reports: '/reports',
    products: { list: '/products' },
    settings: { general: '/settings/general' },
  },
  setup: {
    onboarding: '/onboarding/setup',
  },
} as const
