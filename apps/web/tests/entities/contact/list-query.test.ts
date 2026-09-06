import { describe, expect, it } from 'vitest'

import { listQueryFilters } from '@/entities/contact/lib/list-query'

describe('listQueryFilters', () => {
  it('drops pagination and sorting but keeps every filter', () => {
    expect(
      listQueryFilters({
        page: 3,
        limit: 50,
        sortBy: 'createdAt',
        sortDir: 'desc',
        q: 'ana',
        status: 'new',
        archived: false,
      }),
    ).toEqual({ q: 'ana', status: 'new', archived: false })
  })
})
