import type { ContactListQuery } from '@repo/shared-types'

export const QUERY_KEYS = {
  auth: {
    me: ['auth', 'me'] as const,
  },
  contacts: {
    all: ['contacts'] as const,
    list: (query: ContactListQuery) => ['contacts', 'list', query] as const,
    detail: (id: string) => ['contacts', 'detail', id] as const,
    timeline: (id: string) => ['contacts', 'timeline', id] as const,
  },
  settings: {
    general: ['settings', 'general'] as const,
    pipelines: ['settings', 'pipelines'] as const,
    nomenclature: ['settings', 'nomenclature'] as const,
    navigation: ['settings', 'navigation'] as const,
    theme: ['settings', 'theme'] as const,
  },
} as const
