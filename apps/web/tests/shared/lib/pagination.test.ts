import { describe, expect, it } from 'vitest'

import { pageCount, pageWindow } from '@/shared/lib/pagination'

describe('pageCount', () => {
  it('returns 1 for an empty list', () => {
    expect(pageCount(0, 10)).toBe(1)
  })

  it('returns 1 when items fit in a single page', () => {
    expect(pageCount(10, 10)).toBe(1)
  })

  it('rounds up to the next page when items overflow', () => {
    expect(pageCount(11, 10)).toBe(2)
    expect(pageCount(25, 10)).toBe(3)
  })
})

describe('pageWindow', () => {
  const items = Array.from({ length: 13 }, (_, i) => i + 1)

  it('returns the first page slice', () => {
    expect(pageWindow(items, 1, 10)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
  })

  it('returns the trailing partial page', () => {
    expect(pageWindow(items, 2, 10)).toEqual([11, 12, 13])
  })

  it('returns an empty slice for a page past the end', () => {
    expect(pageWindow(items, 3, 10)).toEqual([])
  })

  it('does not mutate the source list', () => {
    pageWindow(items, 1, 10)
    expect(items).toHaveLength(13)
  })
})
