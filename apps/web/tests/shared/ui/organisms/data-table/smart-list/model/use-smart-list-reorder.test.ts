import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import type { SmartListItem } from '@/shared/ui/organisms/data-table'
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core'

import { useSmartListReorder } from '@/shared/ui/organisms/data-table/smart-list/model/use-smart-list-reorder'

const ITEMS: SmartListItem[] = [
  { id: 'all', label: 'All', pinned: true },
  { id: 'client', label: 'Client' },
  { id: 'lost', label: 'Lost' },
  { id: 'new', label: 'New' },
]

function dragStart(id: string) {
  return { active: { id } } as DragStartEvent
}

function dragEnd(activeId: string, overId: string | null) {
  return { active: { id: activeId }, over: overId ? { id: overId } : null } as DragEndEvent
}

describe('useSmartListReorder', () => {
  it('keeps pinned items out of the sortable set', () => {
    const { result } = renderHook(() => useSmartListReorder(ITEMS, vi.fn()))

    expect(result.current.movableIds).toEqual(['client', 'lost', 'new'])
  })

  it('reports itself as not sortable when no reorder handler is given', () => {
    const { result } = renderHook(() => useSmartListReorder(ITEMS))

    expect(result.current.sortable).toBe(false)
  })

  it('exposes the item being dragged and clears it on cancel', () => {
    const { result } = renderHook(() => useSmartListReorder(ITEMS, vi.fn()))

    act(() => result.current.handleDragStart(dragStart('lost')))
    expect(result.current.draggingItem?.id).toBe('lost')

    act(() => result.current.handleDragCancel())
    expect(result.current.draggingItem).toBeNull()
  })

  it('emits the new order with pinned items always first', () => {
    const onReorder = vi.fn()
    const { result } = renderHook(() => useSmartListReorder(ITEMS, onReorder))

    act(() => result.current.handleDragEnd(dragEnd('new', 'client')))

    expect(onReorder).toHaveBeenCalledWith(['all', 'new', 'client', 'lost'])
  })

  it('ignores a drop outside any target', () => {
    const onReorder = vi.fn()
    const { result } = renderHook(() => useSmartListReorder(ITEMS, onReorder))

    act(() => result.current.handleDragEnd(dragEnd('new', null)))

    expect(onReorder).not.toHaveBeenCalled()
  })

  it('ignores a drop onto itself', () => {
    const onReorder = vi.fn()
    const { result } = renderHook(() => useSmartListReorder(ITEMS, onReorder))

    act(() => result.current.handleDragEnd(dragEnd('lost', 'lost')))

    expect(onReorder).not.toHaveBeenCalled()
  })

  it('refuses to reorder onto a pinned item', () => {
    const onReorder = vi.fn()
    const { result } = renderHook(() => useSmartListReorder(ITEMS, onReorder))

    act(() => result.current.handleDragEnd(dragEnd('lost', 'all')))

    expect(onReorder).not.toHaveBeenCalled()
  })

  it('clears the dragging item once the drop settles', () => {
    const { result } = renderHook(() => useSmartListReorder(ITEMS, vi.fn()))

    act(() => result.current.handleDragStart(dragStart('lost')))
    act(() => result.current.handleDragEnd(dragEnd('lost', 'new')))

    expect(result.current.draggingItem).toBeNull()
  })
})
