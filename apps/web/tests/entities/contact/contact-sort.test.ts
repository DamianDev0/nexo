import { describe, expect, it } from 'vitest'

import { CONTACT_COLUMNS_FIXTURE } from '../../msw/handlers'

import {
  fromColumnSort,
  parseSortParam,
  serializeSort,
  toColumnSort,
} from '@/entities/contact/lib/contact-sort'

describe('parseSortParam', () => {
  it('reads an ascending field', () => {
    expect(parseSortParam('email')).toEqual({ field: 'email', direction: 'asc' })
  })

  it('reads a descending field from the leading dash', () => {
    expect(parseSortParam('-createdAt')).toEqual({ field: 'createdAt', direction: 'desc' })
  })

  it('rejects fields the API does not accept so the query never 400s', () => {
    expect(parseSortParam('password')).toBeNull()
    expect(parseSortParam('-')).toBeNull()
    expect(parseSortParam(null)).toBeNull()
  })
})

describe('serializeSort', () => {
  it('round-trips through the URL param', () => {
    const sort = parseSortParam('-createdAt')

    expect(serializeSort(sort)).toBe('-createdAt')
  })

  it('drops the param when nothing is sorted', () => {
    expect(serializeSort(null)).toBeNull()
  })
})

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
