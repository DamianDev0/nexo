import { describe, expect, it } from 'vitest'

import type { Tag } from '@repo/shared-types'

import { buildTagOptions, toggleName } from '@/entities/tag/lib/tag-options'

const TAG = (name: string, color: string, description: string | null = null): Tag => ({
  id: name,
  name,
  color,
  description,
  enabled: true,
  deletedAt: null,
  entityType: 'contact',
  createdAt: '2026-01-01T00:00:00.000Z',
})

const catalog = new Map<string, Tag>([
  ['vip', TAG('VIP', '#f00', 'Alto valor')],
  ['frío', TAG('Frío', '#00f')],
])

describe('buildTagOptions', () => {
  it('merges catalog and extra names, sorted, with catalog metadata', () => {
    const options = buildTagOptions({
      catalog,
      names: ['Manual', 'VIP'],
      selected: new Set(['VIP']),
      query: '',
    })
    expect(options.map((o) => o.name)).toEqual(['Frío', 'Manual', 'VIP'])
    expect(options.find((o) => o.name === 'VIP')).toMatchObject({
      color: '#f00',
      description: 'Alto valor',
      selected: true,
    })
    expect(options.find((o) => o.name === 'Manual')).toMatchObject({
      color: null,
      selected: false,
    })
  })

  it('restricts the list to the given names when scoped, still borrowing catalog colors', () => {
    const options = buildTagOptions({
      catalog,
      names: ['vip', 'seed'],
      onlyNames: true,
      selected: new Set(),
      query: '',
    })
    expect(options.map((o) => o.name)).toEqual(['seed', 'vip'])
    expect(options[1]?.color).toBe('#f00')
  })

  it('filters by a case-insensitive query', () => {
    const options = buildTagOptions({ catalog, selected: new Set(), query: 'FR' })
    expect(options.map((o) => o.name)).toEqual(['Frío'])
  })
})

describe('toggleName', () => {
  it('adds a missing name and removes a present one without mutating the input', () => {
    const initial: ReadonlySet<string> = new Set(['a'])
    const added = toggleName(initial, 'b')
    expect([...added]).toEqual(['a', 'b'])
    expect([...toggleName(added, 'a')]).toEqual(['b'])
    expect([...initial]).toEqual(['a'])
  })
})
