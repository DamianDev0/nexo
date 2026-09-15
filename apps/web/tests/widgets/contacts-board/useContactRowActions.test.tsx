import { renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { queryWrapper as wrapper } from '../../query-wrapper'

import { useContactRowActions } from '@/widgets/contacts-board/model/useContactRowActions'

const copyToClipboard = vi.fn()
vi.mock('@/shared/lib/copy-to-clipboard', () => ({
  copyToClipboard: (value: string) => copyToClipboard(value),
}))

function makeHandlers() {
  return {
    onArchive: vi.fn(),
    onViewRecord: vi.fn(),
    onOpen: vi.fn(),
    onPreview: vi.fn(),
    onAddNote: vi.fn(),
    onEditTags: vi.fn(),
    onCompose: vi.fn(),
    onLogActivity: vi.fn(),
  }
}

describe('useContactRowActions', () => {
  it('passes the given handlers straight through untouched', () => {
    const handlers = makeHandlers()
    const { result } = renderHook(() => useContactRowActions(handlers), { wrapper })

    expect(result.current.onArchive).toBe(handlers.onArchive)
    expect(result.current.onViewRecord).toBe(handlers.onViewRecord)
    expect(result.current.onOpen).toBe(handlers.onOpen)
    expect(result.current.onPreview).toBe(handlers.onPreview)
    expect(result.current.onAddNote).toBe(handlers.onAddNote)
    expect(result.current.onEditTags).toBe(handlers.onEditTags)
    expect(result.current.onCompose).toBe(handlers.onCompose)
    expect(result.current.onLogActivity).toBe(handlers.onLogActivity)
  })

  it('routes onCopy to the clipboard helper with the given value', () => {
    const { result } = renderHook(() => useContactRowActions(makeHandlers()), { wrapper })

    result.current.onCopy?.('300 000 0000')

    expect(copyToClipboard).toHaveBeenCalledWith('300 000 0000')
  })

  it('keeps the same reference across renders when nothing changed', () => {
    const handlers = makeHandlers()
    const { result, rerender } = renderHook(() => useContactRowActions(handlers), { wrapper })
    const first = result.current

    rerender()

    expect(result.current).toBe(first)
  })

  it('produces a new object once a passed-in handler changes', () => {
    const handlers = makeHandlers()
    const { result, rerender } = renderHook(({ handlers: h }) => useContactRowActions(h), {
      wrapper,
      initialProps: { handlers },
    })
    const first = result.current

    rerender({ handlers: { ...handlers, onArchive: vi.fn() } })

    expect(result.current).not.toBe(first)
  })

  it('exposes internal contact actions (call, restore, assign, status) as callables', () => {
    const { result } = renderHook(() => useContactRowActions(makeHandlers()), { wrapper })

    expect(typeof result.current.onCall).toBe('function')
    expect(typeof result.current.onRestore).toBe('function')
    expect(typeof result.current.onAssign).toBe('function')
    expect(typeof result.current.onStatusChange).toBe('function')
    expect(typeof result.current.onFieldsChange).toBe('function')
    expect(typeof result.current.onCustomFieldsChange).toBe('function')
    expect(typeof result.current.onToggleActivity).toBe('function')
  })
})
