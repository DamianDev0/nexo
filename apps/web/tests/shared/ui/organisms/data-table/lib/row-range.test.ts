import { describe, expect, it } from 'vitest'

import type { Row, Table } from '@tanstack/react-table'

import { rowRange, selectRowRange } from '@/shared/ui/organisms/data-table/lib/row-range'

const IDS = ['a', 'b', 'c', 'd', 'e']

describe('rowRange', () => {
  it('returns every id between the anchor and the target, inclusive, in either direction', () => {
    expect(rowRange(IDS, 'b', 'd')).toEqual(['b', 'c', 'd'])
    expect(rowRange(IDS, 'd', 'b')).toEqual(['b', 'c', 'd'])
  })

  it('falls back to the target alone without an anchor or when the anchor left the page', () => {
    expect(rowRange(IDS, null, 'c')).toEqual(['c'])
    expect(rowRange(IDS, 'zz', 'c')).toEqual(['c'])
  })
})

describe('selectRowRange', () => {
  function fakeTable(anchor: string | null) {
    const selection: Record<string, boolean> = {}
    const meta = { selectionAnchor: { current: anchor } }
    const table = {
      options: { meta },
      getRowModel: () => ({ rows: IDS.map((id) => ({ id })) }),
      setRowSelection: (update: (previous: Record<string, boolean>) => Record<string, boolean>) =>
        Object.assign(selection, update(selection)),
    } as unknown as Table<{ id: string }>
    return { table, meta, selection }
  }
  const rowOf = (id: string) => ({ id }) as Row<{ id: string }>

  it('only moves the anchor on a plain click', () => {
    const { table, meta, selection } = fakeTable(null)
    expect(selectRowRange(table, rowOf('b'), false)).toBe(false)
    expect(meta.selectionAnchor.current).toBe('b')
    expect(selection).toEqual({})
  })

  it('selects from the anchor to the shift-clicked row and reports it handled', () => {
    const { table, selection } = fakeTable('b')
    expect(selectRowRange(table, rowOf('d'), true)).toBe(true)
    expect(selection).toEqual({ b: true, c: true, d: true })
  })

  it('treats a shift-click without an anchor as a plain click', () => {
    const { table, meta } = fakeTable(null)
    expect(selectRowRange(table, rowOf('c'), true)).toBe(false)
    expect(meta.selectionAnchor.current).toBe('c')
  })
})
