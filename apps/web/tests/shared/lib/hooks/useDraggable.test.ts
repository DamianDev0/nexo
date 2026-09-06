import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { useDraggable } from '@/shared/lib/hooks/useDraggable'

type HookResult = ReturnType<typeof useDraggable>

function pressAt(
  result: { current: HookResult },
  clientX: number,
  clientY: number,
  target?: EventTarget,
) {
  act(() =>
    result.current.handleProps.onPointerDown({
      button: 0,
      clientX,
      clientY,
      target: target ?? document.createElement('div'),
      preventDefault: vi.fn(),
    } as unknown as Parameters<HookResult['handleProps']['onPointerDown']>[0]),
  )
}

function moveTo(clientX: number, clientY: number) {
  act(() => {
    window.dispatchEvent(new MouseEvent('pointermove', { clientX, clientY }))
  })
}

function release() {
  act(() => {
    window.dispatchEvent(new MouseEvent('pointerup'))
  })
}

describe('useDraggable', () => {
  it('starts at rest with no translation', () => {
    const { result } = renderHook(() => useDraggable())
    expect(result.current.dragging).toBe(false)
    expect(result.current.style.transform).toBe('translate3d(0px, 0px, 0)')
  })

  it('translates by the pointer delta while dragging', () => {
    const { result } = renderHook(() => useDraggable())

    pressAt(result, 100, 100)
    expect(result.current.dragging).toBe(true)

    moveTo(140, 70)
    expect(result.current.style.transform).toBe('translate3d(40px, -30px, 0)')
  })

  it('accumulates offsets across separate drags', () => {
    const { result } = renderHook(() => useDraggable())

    pressAt(result, 0, 0)
    moveTo(10, 10)
    release()
    expect(result.current.dragging).toBe(false)

    pressAt(result, 50, 50)
    moveTo(55, 45)
    expect(result.current.style.transform).toBe('translate3d(15px, 5px, 0)')
  })

  it('stops following the pointer after release', () => {
    const { result } = renderHook(() => useDraggable())

    pressAt(result, 0, 0)
    moveTo(20, 20)
    release()
    moveTo(500, 500)

    expect(result.current.style.transform).toBe('translate3d(20px, 20px, 0)')
  })

  it('allows dragging from a button marked as drag handle and suppresses its click', () => {
    const { result } = renderHook(() => useDraggable())

    const handle = document.createElement('button')
    handle.dataset.dragHandle = ''
    document.body.appendChild(handle)
    pressAt(result, 0, 0, handle)
    expect(result.current.dragging).toBe(true)

    moveTo(30, 0)
    release()
    expect(result.current.consumeMoved()).toBe(true)
    expect(result.current.consumeMoved()).toBe(false)
    handle.remove()
  })

  it('does not flag a click without movement as a drag', () => {
    const { result } = renderHook(() => useDraggable())

    const handle = document.createElement('button')
    handle.dataset.dragHandle = ''
    document.body.appendChild(handle)
    pressAt(result, 0, 0, handle)
    release()

    expect(result.current.consumeMoved()).toBe(false)
    handle.remove()
  })

  it('clamps the drag so the element stays inside the viewport', () => {
    const { result } = renderHook(() => useDraggable())

    result.current.elementRef.current = {
      getBoundingClientRect: () => ({
        left: 700,
        top: 500,
        right: 1000,
        bottom: 740,
        width: 300,
        height: 240,
        x: 700,
        y: 500,
        toJSON: () => ({}),
      }),
    } as HTMLDivElement

    pressAt(result, 0, 0)
    moveTo(-2000, -2000)

    expect(result.current.style.transform).toBe('translate3d(-692px, -492px, 0)')
  })

  it('ignores drags starting on buttons and non-primary buttons', () => {
    const { result } = renderHook(() => useDraggable())

    const button = document.createElement('button')
    document.body.appendChild(button)
    pressAt(result, 0, 0, button)
    expect(result.current.dragging).toBe(false)
    button.remove()

    act(() =>
      result.current.handleProps.onPointerDown({
        button: 2,
        clientX: 0,
        clientY: 0,
        target: document.createElement('div'),
        preventDefault: vi.fn(),
      } as unknown as Parameters<HookResult['handleProps']['onPointerDown']>[0]),
    )
    expect(result.current.dragging).toBe(false)
  })
})
