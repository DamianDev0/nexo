import { describe, expect, it } from 'vitest'

import { CONTACT_COLUMNS_FIXTURE } from '../../msw/handlers'

import { fromColumnSort, toColumnSort } from '@/entities/object-descriptor/lib/column-sort'

describe('column bridge', () => {
  it('maps an API sort field back to the column that owns it', () => {
    const sort = toColumnSort({ field: 'firstName', direction: 'asc' }, CONTACT_COLUMNS_FIXTURE)

    expect(sort).toEqual({ field: 'name', direction: 'asc' })
  })

  it('maps a clicked column to the API sort field', () => {
    const sort = fromColumnSort({ field: 'name', direction: 'desc' }, CONTACT_COLUMNS_FIXTURE)

    expect(sort).toEqual({ field: 'firstName', direction: 'desc' })
  })

  it('ignores columns the backend cannot sort by', () => {
    expect(fromColumnSort({ field: 'tags', direction: 'asc' }, CONTACT_COLUMNS_FIXTURE)).toBeNull()
  })

  it('ignores a stored sort whose column is gone from the catalog', () => {
    expect(
      toColumnSort({ field: 'updatedAt', direction: 'asc' }, CONTACT_COLUMNS_FIXTURE),
    ).toBeNull()
  })

  it('passes null straight through in both directions', () => {
    expect(toColumnSort(null, CONTACT_COLUMNS_FIXTURE)).toBeNull()
    expect(fromColumnSort(null, CONTACT_COLUMNS_FIXTURE)).toBeNull()
  })
})
