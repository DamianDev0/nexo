import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'

import { useReassignFlow } from '@/features/manage-settings/model/useReassignFlow'

const mutate = vi.fn()

vi.mock('@/features/manage-settings/query/useTaxonomyUsage', () => ({
  useReassignTaxonomy: () => ({ mutate, isPending: false }),
}))

beforeEach(() => {
  mutate.mockReset()
})

describe('useReassignFlow', () => {
  it('sends the reassignment with the source and target keys', () => {
    const onReassigned = vi.fn()
    const { result } = renderHook(() =>
      useReassignFlow({ kind: 'tag', fromKey: 'Frio', onReassigned }),
    )

    act(() => result.current.confirm('VIP'))

    expect(mutate).toHaveBeenCalledWith(
      { kind: 'tag', fromKey: 'Frio', toKey: 'VIP' },
      expect.objectContaining({ onSuccess: onReassigned }),
    )
  })

  it('does nothing when there is no source to reassign from', () => {
    const { result } = renderHook(() =>
      useReassignFlow({ kind: 'status', fromKey: null, onReassigned: vi.fn() }),
    )

    act(() => result.current.confirm('new'))

    expect(mutate).not.toHaveBeenCalled()
  })

  it('runs the callback only once the mutation succeeds', () => {
    const onReassigned = vi.fn()
    const { result } = renderHook(() =>
      useReassignFlow({ kind: 'source', fromKey: 'manual', onReassigned }),
    )

    act(() => result.current.confirm('web'))
    expect(onReassigned).not.toHaveBeenCalled()

    const options = mutate.mock.calls[0]?.[1] as { onSuccess: () => void }
    act(() => options.onSuccess())

    expect(onReassigned).toHaveBeenCalledTimes(1)
  })
})
