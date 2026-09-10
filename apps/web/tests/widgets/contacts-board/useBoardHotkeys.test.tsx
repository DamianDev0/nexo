import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { useBoardHotkeys } from '@/widgets/contacts-board/model/useBoardHotkeys'

function press(key: string, target: EventTarget = document.body) {
  act(() => {
    target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }))
  })
}

describe('useBoardHotkeys', () => {
  it('creates a record with N while the board is idle', () => {
    const onCreate = vi.fn()
    renderHook(() => useBoardHotkeys({ onCreate, enabled: true }))

    press('n')

    expect(onCreate).toHaveBeenCalledOnce()
  })

  it('stays quiet while an editor is already open', () => {
    const onCreate = vi.fn()
    renderHook(() => useBoardHotkeys({ onCreate, enabled: false }))

    press('n')

    expect(onCreate).not.toHaveBeenCalled()
  })

  it('never fires while the user is typing', () => {
    const onCreate = vi.fn()
    const input = document.createElement('input')
    document.body.append(input)
    renderHook(() => useBoardHotkeys({ onCreate, enabled: true }))

    press('n', input)

    expect(onCreate).not.toHaveBeenCalled()
    input.remove()
  })
})
