import { renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { useBulkChoiceOptions } from '@/features/bulk-actions/model/useBulkChoiceOptions'

vi.mock('@/entities/contact-taxonomy', () => ({
  useContactTaxonomy: () => ({
    statuses: [{ key: 'new', label: 'Nuevo', color: '#60A5FA' }],
    lifecycleStages: [{ key: 'lead', label: 'Lead', color: null }],
    sources: [],
  }),
}))

vi.mock('@/entities/team-member', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/entities/team-member')>()),
  useTeamMembers: () => [
    { id: 'u-1', fullName: 'Ana Ruiz', email: 'ana@x.co', avatarUrl: null, role: 'admin' },
    { id: 'u-2', fullName: 'Beto Díaz', email: 'beto@x.co', avatarUrl: null, role: 'viewer' },
  ],
}))

vi.mock('@/entities/session', () => ({ useAuth: () => ({ data: { id: 'u-1' } }) }))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}))

describe('useBulkChoiceOptions', () => {
  it('maps taxonomy choices for status and lifecycle', () => {
    expect(renderHook(() => useBulkChoiceOptions('status')).result.current).toEqual([
      { value: 'new', label: 'Nuevo', color: '#60A5FA' },
    ])
    expect(renderHook(() => useBulkChoiceOptions('lifecycle')).result.current).toEqual([
      { value: 'lead', label: 'Lead', color: null },
    ])
  })

  it('builds rich member options marking the viewer and translating roles', () => {
    const { result } = renderHook(() => useBulkChoiceOptions('assign'))

    expect(result.current).toEqual([
      {
        value: 'u-1',
        label: 'Ana Ruiz (contacts.lists.you)',
        description: 'ana@x.co',
        badge: 'common.roles.admin',
        initials: 'AR',
      },
      {
        value: 'u-2',
        label: 'Beto Díaz',
        description: 'beto@x.co',
        badge: 'common.roles.viewer',
        initials: 'BD',
      },
    ])
  })
})
