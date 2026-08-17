import { describe, expect, it } from 'vitest'

import {
  capPins,
  defaultPins,
  moveColumn,
  moveIntoPins,
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

  it('sorts pinned columns by the current column order, not by pin time', () => {
    expect(normalizePinning(['city', 'name'], ORDER).left).toEqual(['select', 'name', 'city'])
  })

  it('drops ids that no longer exist and de-duplicates', () => {
    expect(normalizePinning(['name', 'name', 'ghost'], ORDER).left).toEqual(['select', 'name'])
  })

  it('never pins to the right — the action rail owns that edge', () => {
    expect(normalizePinning(['name'], ORDER).right).toEqual([])
  })
})

describe('defaultPins', () => {
  it('pins the first three visible columns when the user has never chosen', () => {
    expect(defaultPins(ORDER, {})).toEqual(['name', 'status', 'jobTitle'])
  })

  it('skips hidden columns so the zone always holds three visible ones', () => {
    expect(defaultPins(ORDER, { status: false })).toEqual(['name', 'jobTitle', 'city'])
  })
})

describe('capPins', () => {
  it('keeps at most three pins, dropping the rightmost', () => {
    expect(capPins(['city', 'name', 'status', 'jobTitle'], ORDER)).toEqual([
      'name',
      'status',
      'jobTitle',
    ])
  })

  it('leaves a single pin alone — the user decides how many to keep', () => {
    expect(capPins(['city'], ORDER)).toEqual(['city'])
    expect(capPins([], ORDER)).toEqual([])
  })
})

describe('moveIntoPins', () => {
  it('places a newly pinned column right after the pins it joins', () => {
    expect(moveIntoPins(ORDER, 'city', ['name', 'status'])).toEqual([
      'select',
      'name',
      'status',
      'city',
      'jobTitle',
    ])
  })

  it('places the first pin right after the selection column', () => {
    expect(moveIntoPins(ORDER, 'city', [])).toEqual([
      'select',
      'city',
      'name',
      'status',
      'jobTitle',
    ])
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
      pinning: { left: ['select', 'name', 'status', 'jobTitle'], right: [] },
      visibility: {},
      density: 'comfortable',
    })
  })

  it('marks stored hidden columns as invisible and ignores unknown ids', () => {
    const state = seedLayout({ hidden: ['city', 'ghost'] }, ORDER)

    expect(state.visibility).toEqual({ city: false })
  })

  it('honours the stored pins instead of re-applying the default zone', () => {
    const state = seedLayout({ pinnedLeft: ['city'] }, ORDER)

    expect(state.pinning.left).toEqual(['select', 'city'])
  })

  it('lets a workspace store zero pins', () => {
    const state = seedLayout({ pinnedLeft: [] }, ORDER)

    expect(state.pinning.left).toEqual(['select'])
  })
})

describe('toLayout', () => {
  it('never persists the selection column — it is a UI concern', () => {
    const layout = toLayout(seedLayout({ pinnedLeft: ['name'] }, ORDER))

    expect(layout.order).not.toContain('select')
    expect(layout.pinnedLeft).toEqual(['name'])
  })

  it('round-trips a stored layout through the seed', () => {
    const stored = {
      order: ['status', 'name', 'jobTitle', 'city'],
      hidden: ['city'],
      widths: { name: 300 },
      pinnedLeft: ['name'],
      density: 'compact' as const,
    }

    expect(toLayout(seedLayout(stored, ORDER))).toEqual(stored)
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
