import type { ObjectColumnDef } from '@repo/shared-types'
import {
  columnMinWidths,
  mergeTableState,
  sanitizeTableState,
  sanitizeViewColumns,
} from '../mappers/object-table-state.mapper'

function column(key: string, minWidth: number): ObjectColumnDef {
  return {
    key,
    labelKey: '',
    hintKey: '',
    sortField: null,
    defaultVisible: true,
    defaultWidth: minWidth,
    minWidth,
  }
}

const CATALOG = columnMinWidths([
  column('name', 180),
  column('status', 130),
  column('email', 160),
  column('city', 100),
])

describe('sanitizeViewColumns', () => {
  it('drops keys that are not in the column catalog', () => {
    const columns = sanitizeViewColumns(
      {
        order: ['name', 'select', 'ssn'],
        hidden: ['email', 'nope'],
        pinnedLeft: ['name', 'ghost'],
      },
      CATALOG,
    )

    expect(columns.order).toEqual(['name'])
    expect(columns.hidden).toEqual(['email'])
    expect(columns.pinnedLeft).toEqual(['name'])
  })

  it('clamps widths to the per-column minimum and the global maximum', () => {
    const columns = sanitizeViewColumns({ widths: { name: 10, city: 9999, email: 300.6 } }, CATALOG)

    expect(columns.widths).toEqual({ name: 180, city: 480, email: 301 })
  })

  it('drops widths that are not finite numbers', () => {
    const columns = sanitizeViewColumns(
      {
        widths: { name: Number.NaN, city: '200', email: null },
      },
      CATALOG,
    )

    expect(columns.widths).toEqual({})
  })

  it('leaves absent sections undefined so a patch never clears them by accident', () => {
    const columns = sanitizeViewColumns({ widths: { name: 200 } }, CATALOG)

    expect(columns.order).toBeUndefined()
    expect(columns.hidden).toBeUndefined()
  })

  it('deduplicates and caps pinned columns', () => {
    const columns = sanitizeViewColumns({ pinnedLeft: ['name', 'name', 'status'] }, CATALOG)

    expect(columns.pinnedLeft).toEqual(['name', 'status'])
  })

  it('returns an empty object for garbage input', () => {
    expect(sanitizeViewColumns('nope', CATALOG)).toEqual({})
    expect(sanitizeViewColumns(null, CATALOG)).toEqual({})
  })
})

describe('sanitizeTableState', () => {
  it('keeps only known densities', () => {
    expect(sanitizeTableState({ density: 'compact' }, CATALOG).density).toBe('compact')
    expect(sanitizeTableState({ density: 'spacious' }, CATALOG).density).toBeUndefined()
  })

  it('omits the columns key when no section was sent at all', () => {
    expect(sanitizeTableState({ columns: {} }, CATALOG)).toEqual({})
  })

  it('keeps an explicitly emptied section so the user can clear it', () => {
    expect(sanitizeTableState({ columns: { hidden: [] } }, CATALOG)).toEqual({
      columns: { hidden: [] },
    })
  })

  it('keeps the smart list order as free-form ids', () => {
    const state = sanitizeTableState({ listOrder: ['all', 'new', 'all'] }, CATALOG)

    expect(state.listOrder).toEqual(['all', 'new'])
  })
})

describe('mergeTableState', () => {
  it('merges column sections field by field instead of replacing them', () => {
    const merged = mergeTableState(
      { columns: { order: ['name', 'email'], widths: { name: 200 } }, density: 'compact' },
      { columns: { widths: { email: 300 } } },
      CATALOG,
    )

    expect(merged).toEqual({
      columns: { order: ['name', 'email'], widths: { email: 300 } },
      density: 'compact',
    })
  })

  it('keeps the stored state when the patch is empty', () => {
    const merged = mergeTableState({ density: 'compact' }, undefined, CATALOG)

    expect(merged).toEqual({ density: 'compact' })
  })

  it('cleans legacy junk already stored in the row', () => {
    const merged = mergeTableState(
      { foo: 'bar', density: 'spacious' },
      { density: 'compact' },
      CATALOG,
    )

    expect(merged).toEqual({ density: 'compact' })
  })
})
