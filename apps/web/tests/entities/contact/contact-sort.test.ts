import { describe, expect, it } from 'vitest'

import { contactSortFrom, parseSortParam, serializeSort } from '@/entities/contact/lib/contact-sort'

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

describe('contactSortFrom', () => {
  it('accepts a saved view sort on a sortable contact field', () => {
    expect(contactSortFrom({ field: 'createdAt', direction: 'desc' })).toEqual({
      field: 'createdAt',
      direction: 'desc',
    })
  })

  it('drops a saved view sort on a field contacts cannot sort by', () => {
    expect(contactSortFrom({ field: 'probability', direction: 'asc' })).toBeNull()
    expect(contactSortFrom(null)).toBeNull()
  })
})
