import { describe, expect, it } from 'vitest'

import { EMPTY_QUICK_FILTERS } from '@/features/filter-contacts/config/quick-filters.constants'
import {
  contactListQuery,
  contactListQueryFromParams,
} from '@/features/filter-contacts/query/contacts-query'
import { DEFAULT_PAGE_SIZE, FIRST_PAGE } from '@/shared/config/pagination'

describe('contactListQuery', () => {
  it('trims the search value', () => {
    const query = contactListQuery('  maria  ', null)

    expect(query.q).toBe('maria')
  })

  it('turns the archived list into the archived flag instead of a status', () => {
    const query = contactListQuery('', 'archived')

    expect(query.archived).toBe(true)
    expect(query.status).toBeUndefined()
    expect(contactListQuery('', 'new').archived).toBeUndefined()
  })

  it('turns the ownership lists into owner filters instead of a status', () => {
    const mine = contactListQuery('', 'mine', undefined, undefined, [], 'u-1')
    expect(mine.assignedToId).toBe('u-1')
    expect(mine.status).toBeUndefined()
    expect(mine.unassigned).toBeUndefined()

    const unassigned = contactListQuery('', 'unassigned', undefined, undefined, [], 'u-1')
    expect(unassigned.unassigned).toBe(true)
    expect(unassigned.assignedToId).toBeUndefined()
    expect(unassigned.status).toBeUndefined()

    expect(contactListQuery('', 'mine').assignedToId).toBeUndefined()
  })

  it('sets q to undefined for an empty search', () => {
    const query = contactListQuery('   ', null)

    expect(query.q).toBeUndefined()
  })

  it('defaults pagination to the first page and default page size', () => {
    const query = contactListQuery('', null)

    expect(query.page).toBe(FIRST_PAGE)
    expect(query.limit).toBe(DEFAULT_PAGE_SIZE)
  })

  it('accepts explicit pagination', () => {
    const query = contactListQuery('', null, EMPTY_QUICK_FILTERS, { page: 3, limit: 50 })

    expect(query.page).toBe(3)
    expect(query.limit).toBe(50)
  })

  it('maps quick filters to is_any_of advanced conditions', () => {
    const query = contactListQuery('', null, {
      lifecycleStage: ['lead', 'mql'],
      source: ['manual'],
    })

    expect(query.advanced).toEqual([
      { field: 'source', operator: 'is_any_of', value: ['manual'] },
      { field: 'lifecycleStage', operator: 'is_any_of', value: ['lead', 'mql'] },
    ])
  })

  it('maps a null status to undefined', () => {
    const query = contactListQuery('', null)

    expect(query.status).toBeUndefined()
  })

  it('keeps a defined status', () => {
    const query = contactListQuery('', 'qualified')

    expect(query.status).toBe('qualified')
  })
})

describe('contactListQueryFromParams', () => {
  it('reads q, list and filters from a params record', () => {
    const query = contactListQueryFromParams({ q: 'carlos', list: 'qualified', source: 'manual' })

    expect(query.q).toBe('carlos')
    expect(query.status).toBe('qualified')
    expect(query.advanced).toEqual([{ field: 'source', operator: 'is_any_of', value: ['manual'] }])
  })

  it('drops an invalid list value and reports no status', () => {
    const query = contactListQueryFromParams({ list: '123invalid' })

    expect(query.status).toBeUndefined()
  })

  it('defaults to an empty search when q is missing or not a string', () => {
    const query = contactListQueryFromParams({ q: ['carlos'] })

    expect(query.q).toBeUndefined()
  })
})
