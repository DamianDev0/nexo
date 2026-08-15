import { describe, expect, it } from 'vitest'

import { pageRange } from '@/features/manage-contacts/lib/page-range'

describe('pageRange', () => {
  it('describes the first page', () => {
    expect(pageRange(1, 25, 50)).toEqual({ from: 1, to: 25, total: 50 })
  })

  it('stops the last page at the total instead of the page size', () => {
    expect(pageRange(2, 25, 43)).toEqual({ from: 26, to: 43, total: 43 })
  })

  it('collapses to zero when there is nothing to show', () => {
    expect(pageRange(1, 25, 0)).toEqual({ from: 0, to: 0, total: 0 })
  })

  it('never reports a range past the total when the page overshoots', () => {
    expect(pageRange(9, 25, 50)).toEqual({ from: 50, to: 50, total: 50 })
  })

  it('treats a missing page as the first one', () => {
    expect(pageRange(0, 25, 50)).toEqual({ from: 1, to: 25, total: 50 })
  })
})
