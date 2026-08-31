import { renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import type { ContactColumnDef } from '@repo/shared-types'

import { useAdvancedFilterFields } from '@/features/filter-contacts'


vi.mock('@/entities/contact-taxonomy', () => ({
  useContactTaxonomy: () => ({
    statuses: [{ key: 'new', label: 'Nuevo', color: '#60A5FA' }],
    sources: [],
    lifecycleStages: [],
  }),
}))

vi.mock('@/entities/tag', () => ({
  useTagCatalog: () => new Map([['vip', { name: 'vip', color: '#000' }]]),
}))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => `t:${key}` }),
}))

const CATALOG: ContactColumnDef[] = [
  {
    key: 'status',
    labelKey: 'contacts.columns.status',
    hintKey: 'x',
    sortField: null,
    defaultVisible: true,
    defaultWidth: 100,
    minWidth: 60,
  },
  {
    key: 'tags',
    labelKey: 'contacts.columns.tags',
    hintKey: 'x',
    sortField: null,
    defaultVisible: true,
    defaultWidth: 100,
    minWidth: 60,
  },
]

describe('useAdvancedFilterFields', () => {
  it('derives filter fields from the workspace catalog with taxonomy and tag options', () => {
    const { result } = renderHook(() => useAdvancedFilterFields(CATALOG))

    expect(result.current.map((field) => field.key)).toEqual(['status', 'tags'])
    expect(result.current[0]?.options).toEqual([
      { value: 'new', label: 'Nuevo', color: '#60A5FA' },
    ])
    expect(result.current[1]?.options).toEqual([{ value: 'vip', label: 'vip' }])
  })
})
