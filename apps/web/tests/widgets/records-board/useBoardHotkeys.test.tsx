import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import type { BoardSelectionHotkeys } from '@/widgets/records-board/model/useBoardHotkeys'

import { useBoardHotkeys } from '@/widgets/records-board/model/useBoardHotkeys'

function press(key: string, target: EventTarget = document.body, init: KeyboardEventInit = {}) {
  act(() => {
    target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, ...init }))
  })
}

function selectionOf(overrides: Partial<BoardSelectionHotkeys> = {}): BoardSelectionHotkeys {
  return {
    active: true,
    pageSelected: false,
    selectPage: vi.fn(),
    selectAll: vi.fn(),
    clear: vi.fn(),
    ...overrides,
  }
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

  it('selects the visible page with ctrl+a and escalates to every match on the second press', () => {
    const page = selectionOf()
    const { rerender } = renderHook(
      ({ selection }) => useBoardHotkeys({ onCreate: vi.fn(), enabled: true, selection }),
      { initialProps: { selection: page } },
    )

    press('a', document.body, { ctrlKey: true })
    expect(page.selectPage).toHaveBeenCalledOnce()
    expect(page.selectAll).not.toHaveBeenCalled()

    const all = selectionOf({ pageSelected: true })
    rerender({ selection: all })
    press('a', document.body, { ctrlKey: true })
    expect(all.selectAll).toHaveBeenCalledOnce()
  })

  it('leaves ctrl+a alone while typing so the input keeps its own select-all', () => {
    const selection = selectionOf()
    const input = document.createElement('input')
    document.body.append(input)
    renderHook(() => useBoardHotkeys({ onCreate: vi.fn(), enabled: true, selection }))

    press('a', input, { ctrlKey: true })

    expect(selection.selectPage).not.toHaveBeenCalled()
    input.remove()
  })

  it('clears the selection with escape unless an overlay owns the key', () => {
    const selection = selectionOf()
    renderHook(() => useBoardHotkeys({ onCreate: vi.fn(), enabled: true, selection }))

    const menu = document.createElement('div')
    menu.setAttribute('role', 'menu')
    document.body.append(menu)
    press('Escape', menu)
    expect(selection.clear).not.toHaveBeenCalled()
    menu.remove()

    press('Escape')
    expect(selection.clear).toHaveBeenCalledOnce()
  })
})
