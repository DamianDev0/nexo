import { describe, expect, it } from 'vitest'

import type { Column } from '@tanstack/react-table'

import { clampColumnWidth, columnWidth } from '@/shared/ui/organisms/data-table/lib/column-size'

describe('clampColumnWidth', () => {
  it('keeps a width that already sits inside the range', () => {
    expect(clampColumnWidth(200, 90, 480)).toBe(200)
  })

  it('never shrinks past the minimum', () => {
    expect(clampColumnWidth(10, 90, 480)).toBe(90)
  })

  it('never grows past the maximum', () => {
    expect(clampColumnWidth(9000, 90, 480)).toBe(480)
  })

  it('rounds sub-pixel drags so the column never jitters', () => {
    expect(clampColumnWidth(200.4, 90, 480)).toBe(200)
    expect(clampColumnWidth(200.6, 90, 480)).toBe(201)
  })

  it('clamps before rounding matters at the edges', () => {
    expect(clampColumnWidth(89.6, 90, 480)).toBe(90)
  })
})

function fakeColumn(options: {
  grow?: boolean
  pinned?: 'left' | false
  lastPinned?: boolean
  size?: number
}): Column<unknown, unknown> {
  return {
    id: 'name',
    columnDef: { meta: options.grow === true ? { grow: true } : {} },
    getIsPinned: () => options.pinned ?? false,
    getIsLastColumn: () => options.lastPinned ?? false,
    getSize: () => options.size ?? 240,
  } as unknown as Column<unknown, unknown>
}

describe('columnWidth', () => {
  it('gives fixed columns their declared size', () => {
    expect(columnWidth(fakeColumn({ size: 150 }), {})).toBe(150)
  })

  it('lets an unpinned grow column absorb the leftover space', () => {
    expect(columnWidth(fakeColumn({ grow: true }), {})).toBeUndefined()
  })

  it('keeps growing while it is the last pinned column', () => {
    expect(
      columnWidth(fakeColumn({ grow: true, pinned: 'left', lastPinned: true }), {}),
    ).toBeUndefined()
  })

  it('freezes its width once another column is pinned behind it', () => {
    expect(columnWidth(fakeColumn({ grow: true, pinned: 'left', lastPinned: false }), {})).toBe(240)
  })

  it('stops growing once the user has resized it by hand', () => {
    expect(columnWidth(fakeColumn({ grow: true, size: 360 }), { name: 360 })).toBe(360)
  })
})
