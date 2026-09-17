import { describe, expect, it, vi } from 'vitest'

import {
  isFixedContactList,
  quickFilterSources,
  toBoardViewsTable,
  type ContactViewsTable,
} from '@/widgets/contacts-board/lib/contact-board-lists'

function makeTable(): ContactViewsTable {
  return {
    advanced: [],
    search: '',
    sort: null,
    isFiltered: false,
    handleAdvanced: vi.fn(),
    handleSearch: vi.fn(),
    handleSort: vi.fn(),
    handleStatus: vi.fn(),
  }
}

describe('isFixedContactList', () => {
  it('pins ownership and archived lists ahead of the user order', () => {
    expect(isFixedContactList('mine')).toBe(true)
    expect(isFixedContactList('unassigned')).toBe(true)
    expect(isFixedContactList('archived')).toBe(true)
    expect(isFixedContactList('new')).toBe(false)
  })
})

describe('toBoardViewsTable', () => {
  it('drops a saved view sort on a field contacts cannot sort by', () => {
    const table = makeTable()

    toBoardViewsTable(table).handleSort({ field: 'probability', direction: 'asc' })

    expect(table.handleSort).toHaveBeenCalledWith(null)
  })

  it('forwards a sortable view sort to the contact table', () => {
    const table = makeTable()

    toBoardViewsTable(table).handleSort({ field: 'createdAt', direction: 'desc' })

    expect(table.handleSort).toHaveBeenCalledWith({ field: 'createdAt', direction: 'desc' })
  })

  it('maps list selection to the status filter and resets it for saved views', () => {
    const table = makeTable()
    const views = toBoardViewsTable(table)

    views.resetList()
    views.selectList('all')

    expect(table.handleStatus).toHaveBeenNthCalledWith(1, null)
    expect(table.handleStatus).toHaveBeenCalledTimes(2)
  })
})

describe('quickFilterSources', () => {
  it('keeps only the taxonomy and usage the quick filters read', () => {
    const sources = quickFilterSources(
      { sources: [], lifecycleStages: [] },
      { sources: { web: 2 }, lifecycleStages: { lead: 1 } },
    )

    expect(sources.usage).toEqual({ sources: { web: 2 }, lifecycleStages: { lead: 1 } })
  })
})
