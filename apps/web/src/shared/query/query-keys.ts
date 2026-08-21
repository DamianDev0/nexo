import type { ContactDuplicateProbeQuery, ContactListQuery } from '@repo/shared-types'

const CONTACTS_LIST = ['contacts', 'list'] as const

export const QUERY_KEYS = {
  auth: {
    me: ['auth', 'me'] as const,
  },
  contacts: {
    all: ['contacts'] as const,
    counts: ['contacts', 'counts'] as const,
    workspace: ['contacts', 'workspace'] as const,
    taxonomyUsage: ['contacts', 'taxonomy-usage'] as const,
    lists: CONTACTS_LIST,
    list: (query: ContactListQuery) => [...CONTACTS_LIST, query] as const,
    detail: (id: string) => ['contacts', 'detail', id] as const,
    duplicateProbe: (params: ContactDuplicateProbeQuery) =>
      ['contacts', 'duplicate-probe', params] as const,
    timeline: (id: string) => ['contacts', 'timeline', id] as const,
  },
  notifications: {
    all: ['notifications'] as const,
    unread: (limit: number) => ['notifications', 'unread', limit] as const,
  },
  settings: {
    general: ['settings', 'general'] as const,
    pipelines: ['settings', 'pipelines'] as const,
    nomenclature: ['settings', 'nomenclature'] as const,
    navigation: ['settings', 'navigation'] as const,
    theme: ['settings', 'theme'] as const,
    onboarding: ['settings', 'onboarding'] as const,
    contactTaxonomy: ['settings', 'contact-taxonomy'] as const,
    customFields: (entity: string) => ['settings', 'custom-fields', entity] as const,
  },
  tags: {
    all: ['tags'] as const,
    page: (entityType: string, page: number) => ['tags', entityType, 'page', page] as const,
    catalog: (entityType: string) => ['tags', entityType, 'catalog'] as const,
  },
  geo: {
    departments: ['geo', 'departments'] as const,
    municipalities: (q: string, department?: string) =>
      ['geo', 'municipalities', q, department ?? null] as const,
    addresses: (q: string) => ['geo', 'addresses', q] as const,
  },
} as const
