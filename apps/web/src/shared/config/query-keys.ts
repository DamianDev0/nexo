export const QUERY_KEYS = {
  auth: {
    me: ['auth', 'me'] as const,
  },
  settings: {
    general: ['settings', 'general'] as const,
    pipelines: ['settings', 'pipelines'] as const,
    nomenclature: ['settings', 'nomenclature'] as const,
    navigation: ['settings', 'navigation'] as const,
    theme: ['settings', 'theme'] as const,
  },
} as const
