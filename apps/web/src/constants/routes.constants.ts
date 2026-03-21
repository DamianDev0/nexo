export const ROUTES = {
  auth: {
    login: '/login',
    onboarding: '/onboarding',
  },
  app: {
    dashboard: '/dashboard',
    contacts: {
      list: '/contacts',
      detail: (id: string) => `/contacts/${id}`,
      new: '/contacts/new',
    },
    companies: {
      list: '/companies',
      detail: (id: string) => `/companies/${id}`,
      new: '/companies/new',
    },
    deals: {
      list: '/deals',
      detail: (id: string) => `/deals/${id}`,
      new: '/deals/new',
    },
    activities: '/activities',
    products: {
      list: '/products',
      detail: (id: string) => `/products/${id}`,
      new: '/products/new',
    },
    settings: {
      general: '/settings/general',
      branding: '/settings/branding',
      pipelines: '/settings/pipelines',
      users: '/settings/users',
    },
  },
} as const
