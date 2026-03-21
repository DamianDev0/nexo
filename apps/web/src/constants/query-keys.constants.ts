export const QUERY_KEYS = {
  auth: {
    me: ['auth', 'me'] as const,
  },
  contacts: {
    all: ['contacts'] as const,
    list: (filters?: unknown) => ['contacts', 'list', filters] as const,
    detail: (id: string) => ['contacts', 'detail', id] as const,
    timeline: (id: string) => ['contacts', 'timeline', id] as const,
  },
  companies: {
    all: ['companies'] as const,
    list: (filters?: unknown) => ['companies', 'list', filters] as const,
    detail: (id: string) => ['companies', 'detail', id] as const,
    summary: (id: string) => ['companies', 'summary', id] as const,
  },
  deals: {
    all: ['deals'] as const,
    list: (filters?: unknown) => ['deals', 'list', filters] as const,
    detail: (id: string) => ['deals', 'detail', id] as const,
    forecast: ['deals', 'forecast'] as const,
  },
  activities: {
    all: ['activities'] as const,
    list: (filters?: unknown) => ['activities', 'list', filters] as const,
    calendar: (from: string, to: string) => ['activities', 'calendar', from, to] as const,
  },
  products: {
    all: ['products'] as const,
    list: (filters?: unknown) => ['products', 'list', filters] as const,
    detail: (id: string) => ['products', 'detail', id] as const,
    lowStock: ['products', 'low-stock'] as const,
  },
  dashboard: {
    all: ['dashboard'] as const,
    full: ['dashboard', 'full'] as const,
    metrics: ['dashboard', 'metrics'] as const,
    config: ['dashboard', 'config'] as const,
  },
  notifications: {
    all: ['notifications'] as const,
    list: (filters?: unknown) => ['notifications', 'list', filters] as const,
    preferences: ['notifications', 'preferences'] as const,
  },
  settings: {
    general: ['settings', 'general'] as const,
    pipelines: ['settings', 'pipelines'] as const,
    activityTypes: ['settings', 'activity-types'] as const,
  },
  tags: {
    all: ['tags'] as const,
    byEntity: (entityType: string) => ['tags', entityType] as const,
  },
  savedFilters: {
    all: ['saved-filters'] as const,
    byEntity: (entityType: string) => ['saved-filters', entityType] as const,
  },
} as const
