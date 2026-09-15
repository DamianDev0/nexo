import { renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { queryWrapper as wrapper } from '../../query-wrapper'

import type { ArchiveContactDialogState } from '@/features/archive-contact'
import type { ContactComposers } from '@/features/compose-contact-actions'

import { useContactDetailActions } from '@/views/contact-detail/model/useContactDetailActions'

const copyToClipboard = vi.fn()
vi.mock('@/shared/lib/copy-to-clipboard', () => ({
  copyToClipboard: (value: string) => copyToClipboard(value),
}))

function makeComposers(): ContactComposers {
  return {
    active: null,
    close: vi.fn(),
    openNote: vi.fn(),
    openTags: vi.fn(),
    openMessage: vi.fn(),
    openActivity: vi.fn(),
  }
}

function makeArchive(): ArchiveContactDialogState {
  return { target: null, isPending: false, ask: vi.fn(), close: vi.fn(), confirm: vi.fn() }
}

describe('useContactDetailActions', () => {
  it('wires the composer and archive callbacks into the row actions', () => {
    const composers = makeComposers()
    const archive = makeArchive()
    const onMerge = vi.fn()

    const { result } = renderHook(() => useContactDetailActions(composers, archive, onMerge), {
      wrapper,
    })

    expect(result.current.onAddNote).toBe(composers.openNote)
    expect(result.current.onEditTags).toBe(composers.openTags)
    expect(result.current.onCompose).toBe(composers.openMessage)
    expect(result.current.onLogActivity).toBe(composers.openActivity)
    expect(result.current.onArchive).toBe(archive.ask)
    expect(result.current.onMerge).toBe(onMerge)
  })

  it('routes onCopy to the clipboard helper', () => {
    const { result } = renderHook(
      () => useContactDetailActions(makeComposers(), makeArchive(), vi.fn()),
      { wrapper },
    )

    result.current.onCopy?.('300 000 0000')

    expect(copyToClipboard).toHaveBeenCalledWith('300 000 0000')
  })

  it('keeps the same reference across renders when its inputs are stable', () => {
    const composers = makeComposers()
    const archive = makeArchive()
    const onMerge = vi.fn()

    const { result, rerender } = renderHook(
      () => useContactDetailActions(composers, archive, onMerge),
      { wrapper },
    )
    const first = result.current

    rerender()

    expect(result.current).toBe(first)
  })

  it('produces a new object once onMerge changes', () => {
    const composers = makeComposers()
    const archive = makeArchive()

    const { result, rerender } = renderHook(
      ({ onMerge }: { onMerge: () => void }) =>
        useContactDetailActions(composers, archive, onMerge),
      { wrapper, initialProps: { onMerge: vi.fn() } },
    )
    const first = result.current

    rerender({ onMerge: vi.fn() })

    expect(result.current).not.toBe(first)
  })
})
