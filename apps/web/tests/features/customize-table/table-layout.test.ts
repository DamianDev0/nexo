import { describe, expect, it } from 'vitest'

import { CONTACT_COLUMNS_FIXTURE } from '../../msw/handlers'

import {
  defaultHiddenColumns,
  toTableState,
  toDataTableLayout,
} from '@/features/customize-table/lib/table-layout'

const PINNED = ['name']

describe('toDataTableLayout', () => {
  it('falls back to the catalog defaults when the user never touched the table', () => {
    const layout = toDataTableLayout({}, CONTACT_COLUMNS_FIXTURE, PINNED)

    expect(layout.hidden).toEqual(defaultHiddenColumns(CONTACT_COLUMNS_FIXTURE))
    expect(layout.pinnedLeft).toEqual(['name'])
    expect(layout.order).toBeUndefined()
    expect(layout.widths).toBeUndefined()
  })

  it('prefers the stored layout over the catalog defaults', () => {
    const layout = toDataTableLayout(
      {
        columns: {
          order: ['status', 'name'],
          hidden: [],
          widths: { name: 300 },
          pinnedLeft: ['status'],
        },
        density: 'compact',
      },
      CONTACT_COLUMNS_FIXTURE,
      PINNED,
    )

    expect(layout).toEqual({
      order: ['status', 'name'],
      hidden: [],
      widths: { name: 300 },
      pinnedLeft: ['status'],
      density: 'compact',
    })
  })

  it('keeps an explicitly emptied hidden list instead of re-hiding the defaults', () => {
    const layout = toDataTableLayout({ columns: { hidden: [] } }, CONTACT_COLUMNS_FIXTURE, PINNED)

    expect(layout.hidden).toEqual([])
  })
})

describe('toTableState', () => {
  it('sends every column section so a cleared list actually clears server-side', () => {
    const state = toTableState({
      order: ['name'],
      hidden: [],
      widths: {},
      pinnedLeft: [],
      density: 'comfortable',
    })

    expect(state).toEqual({
      columns: { order: ['name'], hidden: [], widths: {}, pinnedLeft: [] },
      density: 'comfortable',
    })
  })

  it('round-trips a stored layout without losing anything', () => {
    const stored = {
      columns: {
        order: ['status', 'name'],
        hidden: ['tags'],
        widths: { name: 300 },
        pinnedLeft: ['name'],
      },
      density: 'compact' as const,
    }

    expect(toTableState(toDataTableLayout(stored, CONTACT_COLUMNS_FIXTURE, PINNED))).toEqual(stored)
  })
})
