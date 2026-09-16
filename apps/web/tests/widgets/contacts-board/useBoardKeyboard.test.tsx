import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import type { BulkActionsController } from '@/features/bulk-actions'
import type { DataTableInstance } from '@/shared/ui/organisms/data-table'
import type { ContactListItem } from '@repo/shared-types'

import { useBoardKeyboard } from '@/widgets/contacts-board/model/useBoardKeyboard'

function press(key: string, init: KeyboardEventInit = {}) {
  act(() => {
    document.body.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, ...init }))
  })
}

function makeInstance(allPage: boolean, toggleAllPageRowsSelected = vi.fn()) {
  return {
    table: { getIsAllPageRowsSelected: () => allPage, toggleAllPageRowsSelected },
    selection: { active: true },
  } as unknown as DataTableInstance<ContactListItem>
}

function makeBulk(onSelectAll?: () => void, open: string | null = null) {
  return { bar: { onSelectAll }, dialogs: { open } } as unknown as BulkActionsController
}

const EDITORS = { sheetOpen: false, previewOpen: false, openCreate: vi.fn() }

describe('useBoardKeyboard', () => {
  it('selects the page first, then every matching contact on the next ctrl+a', () => {
    const toggle = vi.fn()
    const onSelectAll = vi.fn()
    const { rerender } = renderHook(
      ({ allPage }) =>
        useBoardKeyboard({
          instance: makeInstance(allPage, toggle),
          bulk: makeBulk(onSelectAll),
          editors: EDITORS,
          clearSelection: vi.fn(),
        }),
      { initialProps: { allPage: false } },
    )

    press('a', { ctrlKey: true })
    expect(toggle).toHaveBeenCalledWith(true)

    rerender({ allPage: true })
    press('a', { ctrlKey: true })
    expect(onSelectAll).toHaveBeenCalledOnce()
  })

  it('stays quiet while a bulk dialog is open', () => {
    const toggle = vi.fn()
    renderHook(() =>
      useBoardKeyboard({
        instance: makeInstance(false, toggle),
        bulk: makeBulk(undefined, 'archive'),
        editors: EDITORS,
        clearSelection: vi.fn(),
      }),
    )

    press('a', { ctrlKey: true })
    expect(toggle).not.toHaveBeenCalled()
  })

  it('clears the selection on escape', () => {
    const clearSelection = vi.fn()
    renderHook(() =>
      useBoardKeyboard({
        instance: makeInstance(false),
        bulk: makeBulk(),
        editors: EDITORS,
        clearSelection,
      }),
    )

    press('Escape')
    expect(clearSelection).toHaveBeenCalledOnce()
  })
})
