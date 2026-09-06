import { describe, expect, it } from 'vitest'

import type { ContactView } from '@repo/shared-types'

import {
  buildViewInput,
  isSnapshotDirty,
  matchesSnapshot,
  viewConditions,
  viewSearch,
  type ViewSnapshot,
} from '@/features/manage-contact-views/lib/view-snapshot'

const view = (overrides: Partial<ContactView>): ContactView => ({
  id: 'v1',
  ownerId: 'u1',
  name: 'VIP',
  description: null,
  filters: {},
  advancedFilters: null,
  columns: {},
  sort: null,
  density: 'comfortable',
  isDefault: false,
  isFavorite: false,
  visibility: 'private',
  position: 0,
  createdAt: '',
  updatedAt: '',
  ...overrides,
})

const snapshot = (overrides: Partial<ViewSnapshot>): ViewSnapshot => ({
  advanced: [],
  search: '',
  sort: null,
  tableState: {},
  ...overrides,
})

describe('view-snapshot', () => {
  it('round-trips conditions through a stored view', () => {
    const stored = view({
      advancedFilters: { conditions: [{ field: 'status', operator: 'is', value: 'new' }] },
    })
    expect(viewConditions(stored)).toEqual([{ field: 'status', operator: 'is', value: 'new' }])
    expect(viewConditions(view({}))).toEqual([])
  })

  it('matches a view against the live snapshot by filters and search', () => {
    const stored = view({
      filters: { q: 'camila' },
      advancedFilters: { conditions: [{ field: 'status', operator: 'is', value: 'new' }] },
    })
    const live = snapshot({
      search: ' camila ',
      advanced: [{ field: 'status', operator: 'is', value: 'new' }],
    })
    expect(matchesSnapshot(stored, live)).toBe(true)
    expect(matchesSnapshot(stored, snapshot({ search: 'otra' }))).toBe(false)
  })

  it('reports dirty only when there is something worth saving', () => {
    expect(isSnapshotDirty(snapshot({}))).toBe(false)
    expect(isSnapshotDirty(snapshot({ search: 'x' }))).toBe(true)
    expect(
      isSnapshotDirty(snapshot({ advanced: [{ field: 'city', operator: 'is', value: 'Cali' }] })),
    ).toBe(true)
  })

  it('builds a view input carrying filters, search, sort and table state', () => {
    const input = buildViewInput(
      { name: '  VIP  ', description: '' },
      snapshot({
        search: 'camila',
        advanced: [{ field: 'status', operator: 'is', value: 'new' }],
        sort: { field: 'createdAt', direction: 'desc' },
        tableState: { columns: { order: ['name'] }, density: 'compact' },
      }),
    )
    expect(input).toEqual({
      name: 'VIP',
      description: null,
      filters: { q: 'camila' },
      advancedFilters: { conditions: [{ field: 'status', operator: 'is', value: 'new' }] },
      sort: { field: 'createdAt', direction: 'desc' },
      columns: { order: ['name'] },
      density: 'compact',
    })
    expect(viewSearch(view({ filters: { q: 'camila' } }))).toBe('camila')
  })
})
