import { describe, expect, it } from 'vitest'

import {
  moveColumn,
  normalizePinning,
  reconcileOrder,
  seedLayout,
  toLayout,
} from '@/shared/ui/organisms/data-table/lib/layout'

const ORDER = ['select', 'name', 'status', 'jobTitle', 'city']

describe('normalizePinning', () => {
  it('anchors the selection column even when nothing else is pinned', () => {
    expect(normalizePinning([], ORDER)).toEqual({ left: ['select'], right: [] })
  })

  it('keeps the selection column first when a later column is pinned', () => {
    expect(normalizePinning(['city'], ORDER).left).toEqual(['select', 'city'])
  })

  it('never lets the selection column be dropped', () => {
    expect(normalizePinning(['name'], ORDER).left).toEqual(['select', 'name'])
  })

  it('sorts pinned columns by the current column order, not by pin time', () => {
    expect(normalizePinning(['city', 'name', 'status'], ORDER).left).toEqual([
      'select',
      'name',
      'status',
      'city',
    ])
  })

  it('follows a reordered table instead of the original definition order', () => {
    const reordered = ['select', 'city', 'name', 'status', 'jobTitle']

    expect(normalizePinning(['name', 'city'], reordered).left).toEqual(['select', 'city', 'name'])
  })

  it('drops ids that no longer exist and de-duplicates', () => {
    expect(normalizePinning(['name', 'name', 'ghost'], ORDER).left).toEqual(['select', 'name'])
  })

  it('omits the anchor when the table has no selection column', () => {
    expect(normalizePinning(['name'], ['name', 'status']).left).toEqual(['name'])
  })

  it('never pins to the right — the action rail owns that edge', () => {
    expect(normalizePinning(['name'], ORDER).right).toEqual([])
  })
})

describe('reconcileOrder', () => {
  it('uses the definition order when nothing was stored', () => {
    expect(reconcileOrder(undefined, ORDER)).toEqual(ORDER)
  })

  it('drops stored ids that no longer exist', () => {
    expect(reconcileOrder(['city', 'ghost', 'name'], ORDER)).toEqual([
      'select',
      'city',
      'status',
      'jobTitle',
      'name',
    ])
  })

  it('appends columns added after the layout was stored', () => {
    expect(reconcileOrder(['name'], ['name', 'brandNew'])).toEqual(['name', 'brandNew'])
  })
})

describe('seedLayout', () => {
  it('starts from the definition order with no stored layout', () => {
    const state = seedLayout({}, ORDER)

    expect(state).toEqual({
      order: ORDER,
      sizing: {},
      pinning: { left: ['select'], right: [] },
      visibility: {},
      density: 'comfortable',
    })
  })

  it('marks stored hidden columns as invisible and ignores unknown ids', () => {
    const state = seedLayout({ hidden: ['city', 'ghost'] }, ORDER)

    expect(state.visibility).toEqual({ city: false })
  })

  it('anchors the selection column even when the stored pinning omits it', () => {
    const state = seedLayout({ pinnedLeft: ['city'] }, ORDER)

    expect(state.pinning.left).toEqual(['select', 'city'])
  })
})

describe('toLayout', () => {
  it('never persists the selection column — it is a UI concern', () => {
    const layout = toLayout(seedLayout({ pinnedLeft: ['name'] }, ORDER))

    expect(layout.order).not.toContain('select')
    expect(layout.pinnedLeft).toEqual(['name'])
  })

  it('round-trips a layout through the seed', () => {
    const stored = {
      order: ['status', 'name', 'jobTitle', 'city'],
      hidden: ['city'],
      widths: { name: 300 },
      pinnedLeft: ['name'],
      density: 'compact' as const,
    }

    expect(toLayout(seedLayout(stored, ORDER))).toEqual({ ...stored, order: stored.order })
  })
})

describe('moveColumn', () => {
  it('moves a column to the target index', () => {
    expect(moveColumn(ORDER, 'city', 'name')).toEqual([
      'select',
      'city',
      'name',
      'status',
      'jobTitle',
    ])
  })

  it('returns null when the move is a no-op so no save is triggered', () => {
    expect(moveColumn(ORDER, 'name', 'name')).toBeNull()
    expect(moveColumn(ORDER, 'name', 'ghost')).toBeNull()
  })
})

describe('reconcileOrder — columns the stored layout never knew about', () => {
  it('puts the selection column back at the front instead of the tail', () => {
    const stored = ['name', 'status', 'jobTitle', 'city']

    expect(reconcileOrder(stored, ORDER)).toEqual(ORDER)
  })

  it('inserts a newly added column at its definition index, not at the end', () => {
    const columnIds = ['select', 'name', 'brandNew', 'status']

    expect(reconcileOrder(['name', 'status'], columnIds)).toEqual([
      'select',
      'name',
      'brandNew',
      'status',
    ])
  })

  it('keeps the order the user actually dragged', () => {
    expect(reconcileOrder(['city', 'name'], ['select', 'name', 'city'])).toEqual([
      'select',
      'city',
      'name',
    ])
  })
})
