import { KeyboardSensor, PointerSensor } from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core'

import { useDndReorder } from '@/shared/lib/hooks/useDndReorder'

function startEvent(activeId: string): DragStartEvent {
  return { active: { id: activeId } } as unknown as DragStartEvent
}

function endEvent(activeId: string, overId: string | null): DragEndEvent {
  return {
    active: { id: activeId },
    over: overId === null ? null : { id: overId },
  } as unknown as DragEndEvent
}

describe('useDndReorder', () => {
  it('configures a pointer sensor with a 5px activation distance and a keyboard sensor', () => {
    const { result } = renderHook(() => useDndReorder(vi.fn()))

    expect(result.current.sensors).toHaveLength(2)
    expect(result.current.sensors[0]?.sensor).toBe(PointerSensor)
    expect(result.current.sensors[0]?.options).toEqual({ activationConstraint: { distance: 5 } })
    expect(result.current.sensors[1]?.sensor).toBe(KeyboardSensor)
    expect(result.current.sensors[1]?.options).toEqual({
      coordinateGetter: sortableKeyboardCoordinates,
    })
  })

  it('starts with no active id', () => {
    const { result } = renderHook(() => useDndReorder(vi.fn()))

    expect(result.current.activeId).toBeNull()
  })

  it('tracks the active id once a drag starts', () => {
    const { result } = renderHook(() => useDndReorder(vi.fn()))

    act(() => result.current.handleDragStart(startEvent('row-1')))

    expect(result.current.activeId).toBe('row-1')
  })

  it('reorders and clears the active id when dropped on a different row', () => {
    const onReorder = vi.fn()
    const { result } = renderHook(() => useDndReorder(onReorder))

    act(() => result.current.handleDragStart(startEvent('row-1')))
    act(() => result.current.handleDragEnd(endEvent('row-1', 'row-2')))

    expect(onReorder).toHaveBeenCalledExactlyOnceWith('row-1', 'row-2')
    expect(result.current.activeId).toBeNull()
  })

  it('does not reorder when dropped back on itself', () => {
    const onReorder = vi.fn()
    const { result } = renderHook(() => useDndReorder(onReorder))

    act(() => result.current.handleDragEnd(endEvent('row-1', 'row-1')))

    expect(onReorder).not.toHaveBeenCalled()
    expect(result.current.activeId).toBeNull()
  })

  it('does not reorder when dropped outside any droppable target', () => {
    const onReorder = vi.fn()
    const { result } = renderHook(() => useDndReorder(onReorder))

    act(() => result.current.handleDragEnd(endEvent('row-1', null)))

    expect(onReorder).not.toHaveBeenCalled()
    expect(result.current.activeId).toBeNull()
  })

  it('clears the active id on drag cancel', () => {
    const { result } = renderHook(() => useDndReorder(vi.fn()))

    act(() => result.current.handleDragStart(startEvent('row-1')))
    act(() => result.current.handleDragCancel())

    expect(result.current.activeId).toBeNull()
  })

  it('calls the latest onReorder callback after it changes between renders', () => {
    const firstOnReorder = vi.fn()
    const secondOnReorder = vi.fn()

    const { result, rerender } = renderHook(({ onReorder }) => useDndReorder(onReorder), {
      initialProps: { onReorder: firstOnReorder },
    })

    rerender({ onReorder: secondOnReorder })

    act(() => result.current.handleDragEnd(endEvent('row-1', 'row-2')))

    expect(secondOnReorder).toHaveBeenCalledExactlyOnceWith('row-1', 'row-2')
    expect(firstOnReorder).not.toHaveBeenCalled()
  })
})
