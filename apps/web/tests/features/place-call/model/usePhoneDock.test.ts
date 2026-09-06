import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import { useCallStore } from '@/features/place-call/model/call.store'
import { usePhoneDock } from '@/features/place-call/model/usePhoneDock'

describe('usePhoneDock', () => {
  beforeEach(() => {
    useCallStore.setState({
      open: false,
      hidden: false,
      status: 'idle',
      number: '',
      muted: false,
      held: false,
      startedAt: null,
      history: [],
    })
  })

  it('hide closes the dock entirely and collapses it', () => {
    useCallStore.getState().setOpen(true)
    const { result } = renderHook(() => usePhoneDock())

    act(() => result.current.hide())

    expect(result.current.hidden).toBe(true)
    expect(useCallStore.getState().open).toBe(false)
  })

  it('show brings the dock back expanded', () => {
    useCallStore.getState().setHidden(true)
    const { result } = renderHook(() => usePhoneDock())

    act(() => result.current.show())

    expect(result.current.hidden).toBe(false)
    expect(useCallStore.getState().open).toBe(true)
  })
})
