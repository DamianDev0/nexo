import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import type { Tag } from '@repo/shared-types'

import { useBulkTagOptions } from '@/features/bulk-actions/model/useBulkTagOptions'

const TAG = (name: string, color: string): Tag => ({
  id: name,
  name,
  color,
  description: null,
  enabled: true,
  deletedAt: null,
  entityType: 'contact',
  createdAt: '2026-01-01T00:00:00.000Z',
})

vi.mock('@/entities/tag', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/entities/tag')>()),
  useTagCatalog: () =>
    new Map<string, Tag>([
      ['vip', TAG('VIP', '#f00')],
      ['frío', TAG('Frío', '#00f')],
      ['seed', TAG('seed', '#999')],
    ]),
}))

describe('useBulkTagOptions', () => {
  it('lists the whole catalog when unscoped', () => {
    const { result } = renderHook(() => useBulkTagOptions(null))
    expect(result.current.isScoped).toBe(false)
    expect(result.current.options.map((o) => o.name)).toEqual(['Frío', 'seed', 'VIP'])
  })

  it('lists only the scoped names, with catalog colors, when scoped', () => {
    const { result } = renderHook(() => useBulkTagOptions(['seed', 'VIP']))
    expect(result.current.isScoped).toBe(true)
    expect(result.current.options.map((o) => o.name)).toEqual(['seed', 'VIP'])
    expect(result.current.options[1]?.color).toBe('#f00')
  })

  it('toggles selection and filters by query', () => {
    const { result } = renderHook(() => useBulkTagOptions(null))
    act(() => result.current.toggle('VIP'))
    expect(result.current.selected).toEqual(['VIP'])
    act(() => result.current.setQuery('vi'))
    expect(result.current.options.map((o) => o.name)).toEqual(['VIP'])
    act(() => result.current.toggle('VIP'))
    expect(result.current.selected).toEqual([])
  })
})
