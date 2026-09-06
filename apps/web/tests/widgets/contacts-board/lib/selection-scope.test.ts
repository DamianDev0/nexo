import { describe, expect, it } from 'vitest'

import { collectTags, selectionScopeKey } from '@/widgets/contacts-board/lib/selection-scope'

describe('selectionScopeKey', () => {
  it('ignores pagination and sorting so paging never resets the selection', () => {
    const key = selectionScopeKey({ page: 1, limit: 25, sortBy: 'createdAt', q: 'ana' })

    expect(selectionScopeKey({ page: 2, limit: 50, sortDir: 'asc', q: 'ana' })).toBe(key)
    expect(selectionScopeKey({ page: 1, q: 'beto' })).not.toBe(key)
  })
})

describe('collectTags', () => {
  it('unions tags across rows without duplicates', () => {
    expect(collectTags([{ tags: ['vip', 'seed'] }, { tags: ['seed', 'lead'] }])).toEqual([
      'vip',
      'seed',
      'lead',
    ])
  })
})
