import {
  mergeContactTableState,
  sanitizeContactTableState,
  sanitizeContactViewColumns,
} from '../mappers/contact-table-state.mapper'

describe('sanitizeContactViewColumns', () => {
  it('drops keys that are not in the column catalog', () => {
    const columns = sanitizeContactViewColumns({
      order: ['name', 'select', 'ssn'],
      hidden: ['email', 'nope'],
      pinnedLeft: ['name', 'ghost'],
    })

    expect(columns.order).toEqual(['name'])
    expect(columns.hidden).toEqual(['email'])
    expect(columns.pinnedLeft).toEqual(['name'])
  })

  it('clamps widths to the per-column minimum and the global maximum', () => {
    const columns = sanitizeContactViewColumns({ widths: { name: 10, city: 9999, email: 300.6 } })

    expect(columns.widths).toEqual({ name: 180, city: 480, email: 301 })
  })

  it('drops widths that are not finite numbers', () => {
    const columns = sanitizeContactViewColumns({
      widths: { name: Number.NaN, city: '200', email: null },
    })

    expect(columns.widths).toEqual({})
  })

  it('leaves absent sections undefined so a patch never clears them by accident', () => {
    const columns = sanitizeContactViewColumns({ widths: { name: 200 } })

    expect(columns.order).toBeUndefined()
    expect(columns.hidden).toBeUndefined()
  })

  it('deduplicates and caps pinned columns', () => {
    const columns = sanitizeContactViewColumns({ pinnedLeft: ['name', 'name', 'status'] })

    expect(columns.pinnedLeft).toEqual(['name', 'status'])
  })

  it('returns an empty object for garbage input', () => {
    expect(sanitizeContactViewColumns('nope')).toEqual({})
    expect(sanitizeContactViewColumns(null)).toEqual({})
  })
})

describe('sanitizeContactTableState', () => {
  it('keeps only known densities', () => {
    expect(sanitizeContactTableState({ density: 'compact' }).density).toBe('compact')
    expect(sanitizeContactTableState({ density: 'spacious' }).density).toBeUndefined()
  })

  it('omits the columns key when no section was sent at all', () => {
    expect(sanitizeContactTableState({ columns: {} })).toEqual({})
  })

  it('keeps an explicitly emptied section so the user can clear it', () => {
    expect(sanitizeContactTableState({ columns: { hidden: [] } })).toEqual({
      columns: { hidden: [] },
    })
  })

  it('keeps the smart list order as free-form ids', () => {
    const state = sanitizeContactTableState({ listOrder: ['all', 'new', 'all'] })

    expect(state.listOrder).toEqual(['all', 'new'])
  })
})

describe('mergeContactTableState', () => {
  it('merges column sections field by field instead of replacing them', () => {
    const merged = mergeContactTableState(
      { columns: { order: ['name', 'email'], widths: { name: 200 } }, density: 'compact' },
      { columns: { widths: { email: 300 } } },
    )

    expect(merged).toEqual({
      columns: { order: ['name', 'email'], widths: { email: 300 } },
      density: 'compact',
    })
  })

  it('keeps the stored state when the patch is empty', () => {
    const merged = mergeContactTableState({ density: 'compact' }, undefined)

    expect(merged).toEqual({ density: 'compact' })
  })

  it('cleans legacy junk already stored in the row', () => {
    const merged = mergeContactTableState(
      { foo: 'bar', density: 'spacious' },
      { density: 'compact' },
    )

    expect(merged).toEqual({ density: 'compact' })
  })
})
