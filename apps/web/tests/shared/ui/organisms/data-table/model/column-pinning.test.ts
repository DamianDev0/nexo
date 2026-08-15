import { describe, expect, it } from 'vitest'

import { normalizePinning } from '@/shared/ui/organisms/data-table/model/column-pinning'

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
