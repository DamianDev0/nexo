import { describe, expect, it } from 'vitest'

import {
  buildBulkRequest,
  filterSelection,
  idsSelection,
  selectionSize,
} from '@/features/bulk-actions/lib/bulk-request'

describe('filterSelection', () => {
  it('drops paging and sorting so the whole filter is targeted', () => {
    expect(
      filterSelection({ status: 'lost', page: 3, limit: 25, sortBy: 'email', sortDir: 'asc' }),
    ).toEqual({ mode: 'filter', query: { status: 'lost' } })
  })
})

describe('idsSelection', () => {
  it('dedupes ids', () => {
    expect(idsSelection(['a', 'b', 'a'])).toEqual({ mode: 'ids', ids: ['a', 'b'] })
  })
})

describe('buildBulkRequest', () => {
  it('always targets contacts and defaults params to an empty object', () => {
    expect(buildBulkRequest('archive', idsSelection(['a']))).toEqual({
      entity: 'contacts',
      action: 'archive',
      params: {},
      selection: { mode: 'ids', ids: ['a'] },
    })
  })
})

describe('selectionSize', () => {
  it('counts ids for explicit selections and the list total for filters', () => {
    expect(selectionSize(idsSelection(['a', 'b']), 99)).toBe(2)
    expect(selectionSize(filterSelection({}), 99)).toBe(99)
  })
})
