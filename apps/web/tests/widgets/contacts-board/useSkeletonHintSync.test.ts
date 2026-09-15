import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { Table } from '@tanstack/react-table'

import { useSkeletonHintSync } from '@/widgets/contacts-board/model/useSkeletonHintSync'

const writeSkeletonHint = vi.fn()

vi.mock('@/entities/contact', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/entities/contact')>()),
  writeSkeletonHint: (hint: unknown) => writeSkeletonHint(hint),
}))

function makeTable(headerCount: number): Table<unknown> {
  const headers = Array.from({ length: headerCount }, (_, index) => ({
    getSize: () => 40 + index * 10,
  }))
  return { getHeaderGroups: () => [{ headers }] } as unknown as Table<unknown>
}

describe('useSkeletonHintSync', () => {
  beforeEach(() => writeSkeletonHint.mockClear())

  it('falls back to five rows when the row count is not yet known', () => {
    const table = makeTable(3)
    renderHook(() => useSkeletonHintSync(table, 0, true, 'k1'))

    expect(writeSkeletonHint).toHaveBeenCalledWith({ widths: [40, 50, 60], rows: 5 })
  })

  it('stores the exact row count once rows are loaded', () => {
    const table = makeTable(3)
    renderHook(() => useSkeletonHintSync(table, 12, true, 'k1'))

    expect(writeSkeletonHint).toHaveBeenCalledWith({ widths: [40, 50, 60], rows: 12 })
  })

  it('writes nothing while disabled', () => {
    const table = makeTable(3)
    renderHook(() => useSkeletonHintSync(table, 12, false, 'k1'))

    expect(writeSkeletonHint).not.toHaveBeenCalled()
  })

  it('writes nothing when there is only the grow column header (or none)', () => {
    renderHook(() => useSkeletonHintSync(makeTable(1), 12, true, 'k1'))
    renderHook(() => useSkeletonHintSync(makeTable(0), 12, true, 'k1'))

    expect(writeSkeletonHint).not.toHaveBeenCalled()
  })

  it('does not write again when the effect reruns with an identical hint', () => {
    const table = makeTable(3)
    const { rerender } = renderHook(
      ({ refreshKey }) => useSkeletonHintSync(table, 12, true, refreshKey),
      { initialProps: { refreshKey: 'k1' } },
    )

    expect(writeSkeletonHint).toHaveBeenCalledOnce()

    rerender({ refreshKey: 'k2' })

    expect(writeSkeletonHint).toHaveBeenCalledOnce()
  })

  it('writes again once the hint content actually changes', () => {
    const table = makeTable(3)
    const { rerender } = renderHook(
      ({ rowCount }) => useSkeletonHintSync(table, rowCount, true, 'k1'),
      { initialProps: { rowCount: 12 } },
    )

    expect(writeSkeletonHint).toHaveBeenCalledOnce()

    rerender({ rowCount: 20 })

    expect(writeSkeletonHint).toHaveBeenCalledTimes(2)
    expect(writeSkeletonHint).toHaveBeenLastCalledWith({ widths: [40, 50, 60], rows: 20 })
  })
})
