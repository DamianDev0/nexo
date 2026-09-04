import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import { useCallStore } from '@/features/place-call/model/call.store'
import { useDialNumber } from '@/features/place-call/model/useDialNumber'

describe('useDialNumber', () => {
  beforeEach(() => {
    useCallStore.setState({
      open: false,
      status: 'idle',
      number: '',
      muted: false,
      startedAt: null,
    })
  })

  it('opens the dock with the sanitized number', () => {
    const { result } = renderHook(() => useDialNumber())

    act(() => result.current('+57 310 999-8877'))

    expect(useCallStore.getState().open).toBe(true)
    expect(useCallStore.getState().number).toBe('+573109998877')
  })

  it('keeps a stable callback identity across renders', () => {
    const { result, rerender } = renderHook(() => useDialNumber())
    const first = result.current

    rerender()
    expect(result.current).toBe(first)
  })
})
