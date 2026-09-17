import { renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { buildContact } from '../../msw/handlers'

import type { useDataTable } from '@/shared/ui/organisms/data-table'
import type { ContactListItem } from '@repo/shared-types'

import { useBoardSelection } from '@/widgets/records-board/model/useBoardSelection'

function makeInstance(
  selectedRows: ReadonlyArray<ContactListItem>,
  resetRowSelection = vi.fn(),
): ReturnType<typeof useDataTable<ContactListItem>> {
  return {
    table: {
      getSelectedRowModel: () => ({ rows: selectedRows.map((original) => ({ original })) }),
      getIsAllPageRowsSelected: () => false,
      toggleAllPageRowsSelected: vi.fn(),
      resetRowSelection,
    },
    selection: { ids: selectedRows.map((row) => row.id), count: selectedRows.length },
  } as unknown as ReturnType<typeof useDataTable<ContactListItem>>
}

describe('useBoardSelection', () => {
  it('reads selected ids and the union of their tags from the table instance', () => {
    const rows = [
      buildContact({ id: 'a', tags: ['vip', 'lead'] }),
      buildContact({ id: 'b', tags: ['lead'] }),
    ]
    const instance = makeInstance(rows)
    const { result } = renderHook(() =>
      useBoardSelection({
        instance,
        scopeKey: 'all',
        closePreview: vi.fn(),
        openEdit: vi.fn(),
      }),
    )

    expect(result.current.bulkRows.selectedIds()).toEqual(['a', 'b'])
    expect(result.current.bulkRows.selectedTags()).toEqual(['vip', 'lead'])
    expect(result.current.bulkRows.selectedCount).toBe(2)
    expect(result.current.bulkRows.page.selected).toBe(false)
  })

  it('clears the row selection by delegating to the table instance', () => {
    const resetRowSelection = vi.fn()
    const instance = makeInstance([], resetRowSelection)
    const { result } = renderHook(() =>
      useBoardSelection({ instance, scopeKey: 'all', closePreview: vi.fn(), openEdit: vi.fn() }),
    )

    result.current.clearSelection()

    expect(resetRowSelection).toHaveBeenCalledOnce()
  })

  it('closes the preview then opens the sheet when promoted from preview', () => {
    const closePreview = vi.fn()
    const openEdit = vi.fn()
    const contact = buildContact({ id: 'a' })
    const instance = makeInstance([])
    const { result } = renderHook(() =>
      useBoardSelection({ instance, scopeKey: 'all', closePreview, openEdit }),
    )

    result.current.openFromPreview(contact)

    expect(closePreview).toHaveBeenCalledOnce()
    expect(openEdit).toHaveBeenCalledWith(contact)
  })

  it('does not clear the selection on first render', () => {
    const resetRowSelection = vi.fn()
    const closePreview = vi.fn()
    const instance = makeInstance([], resetRowSelection)

    renderHook(() =>
      useBoardSelection({ instance, scopeKey: 'all', closePreview, openEdit: vi.fn() }),
    )

    expect(resetRowSelection).not.toHaveBeenCalled()
    expect(closePreview).not.toHaveBeenCalled()
  })

  it('clears the selection and closes the preview once the scope changes', () => {
    const resetRowSelection = vi.fn()
    const closePreview = vi.fn()
    const instance = makeInstance([], resetRowSelection)

    const { rerender } = renderHook(
      ({ scopeKey }) => useBoardSelection({ instance, scopeKey, closePreview, openEdit: vi.fn() }),
      { initialProps: { scopeKey: 'all' } },
    )

    expect(resetRowSelection).not.toHaveBeenCalled()

    rerender({ scopeKey: 'archived' })

    expect(resetRowSelection).toHaveBeenCalledOnce()
    expect(closePreview).toHaveBeenCalledOnce()
  })
})
