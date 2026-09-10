import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { SHORTCUT_GROUPS, shortcutKeys } from '@/features/show-shortcuts/config/shortcut-groups'
import { useShortcutsDialog } from '@/features/show-shortcuts/model/useShortcutsDialog'

function press(key: string, target: EventTarget = document.body) {
  act(() => {
    target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }))
  })
}

describe('useShortcutsDialog', () => {
  it('starts closed and toggles with the question mark', () => {
    const { result } = renderHook(() => useShortcutsDialog())
    expect(result.current.open).toBe(false)

    press('?')
    expect(result.current.open).toBe(true)

    press('?')
    expect(result.current.open).toBe(false)
  })

  it('ignores the shortcut while the user is typing', () => {
    const input = document.createElement('input')
    document.body.append(input)
    const { result } = renderHook(() => useShortcutsDialog())

    press('?', input)
    expect(result.current.open).toBe(false)

    input.remove()
  })
})

describe('SHORTCUT_GROUPS', () => {
  it('resolves keys for every advertised shortcut', () => {
    const ids = SHORTCUT_GROUPS.flatMap((group) => group.shortcuts)

    expect(ids.length).toBeGreaterThan(0)
    for (const id of ids) expect(shortcutKeys(id).length).toBeGreaterThan(0)
  })

  it('never advertises the same shortcut twice', () => {
    const ids = SHORTCUT_GROUPS.flatMap((group) => group.shortcuts)

    expect(new Set(ids).size).toBe(ids.length)
  })
})
