export const CREATE_PARAM = 'new'

export const ROUTES = {
  auth: {
    login: '/login',
    onboarding: '/onboarding',
  },
  app: {
    dashboard: '/dashboard',
    contacts: {
      list: '/contacts',
      import: '/contacts/import',
      detail: (id: string) => `/contacts/${id}`,
    },
    companies: { list: '/companies' },
    deals: { list: '/deals' },
    activities: '/activities',
    invoices: { list: '/invoices' },
    reports: '/reports',
    products: { list: '/products' },
    settings: {
      root: '/settings',
      profile: '/settings/profile',
      notifications: '/settings/notifications',
      company: '/settings/company',
      team: '/settings/team',
      appearance: {
        root: '/settings/appearance',
        brand: '/settings/appearance/brand',
        theme: '/settings/appearance/theme',
        typography: '/settings/appearance/typography',
      },
      navigation: '/settings/navigation',
      nomenclature: '/settings/nomenclature',
      pipelines: '/settings/pipelines',
      contacts: {
        root: '/settings/contacts',
        status: '/settings/contacts/status',
        sources: '/settings/contacts/sources',
        types: '/settings/contacts/types',
        tags: '/settings/contacts/tags',
      },
    },
  },
  setup: {
    onboarding: '/onboarding/setup',
  },
} as const
