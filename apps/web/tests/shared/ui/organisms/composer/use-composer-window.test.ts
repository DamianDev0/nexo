import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { useComposerWindow } from '@/shared/ui/organisms/composer/model/use-composer-window'

describe('useComposerWindow', () => {
  it('starts expanded and restored', () => {
    const { result } = renderHook(() => useComposerWindow())
    expect(result.current.minimized).toBe(false)
    expect(result.current.maximized).toBe(false)
  })

  it('toggles minimized', () => {
    const { result } = renderHook(() => useComposerWindow())
    act(() => result.current.toggleMinimized())
    expect(result.current.minimized).toBe(true)
    act(() => result.current.toggleMinimized())
    expect(result.current.minimized).toBe(false)
  })

  it('maximizing resets drag offset and restores from minimized', () => {
    const { result } = renderHook(() => useComposerWindow())
    act(() => {
      result.current.x.set(120)
      result.current.y.set(-40)
      result.current.toggleMinimized()
    })
    act(() => result.current.toggleMaximized())
    expect(result.current.maximized).toBe(true)
    expect(result.current.minimized).toBe(false)
    expect(result.current.x.get()).toBe(0)
    expect(result.current.y.get()).toBe(0)
  })

  it('toggling maximize back restores windowed mode', () => {
    const { result } = renderHook(() => useComposerWindow())
    act(() => result.current.toggleMaximized())
    act(() => result.current.toggleMaximized())
    expect(result.current.maximized).toBe(false)
  })

  it('minimizing while maximized exits maximized so the window collapses to the pill', () => {
    const { result } = renderHook(() => useComposerWindow())
    act(() => result.current.toggleMaximized())
    act(() => result.current.toggleMinimized())
    expect(result.current.minimized).toBe(true)
    expect(result.current.maximized).toBe(false)
  })

  it('prevents native text selection when a drag starts', () => {
    const { result } = renderHook(() => useComposerWindow())
    const preventDefault = vi.fn()
    act(() => result.current.startDrag({ preventDefault } as never))
    expect(preventDefault).toHaveBeenCalledOnce()
  })

  it('detects a drag by pointer travel so click-to-restore can skip it', () => {
    const { result } = renderHook(() => useComposerWindow())
    const preventDefault = vi.fn()
    expect(result.current.wasDragged()).toBe(false)

    act(() => result.current.startDrag({ preventDefault } as never))
    expect(result.current.wasDragged()).toBe(false)

    act(() => result.current.x.set(-120))
    expect(result.current.wasDragged()).toBe(true)

    act(() => result.current.startDrag({ preventDefault } as never))
    expect(result.current.wasDragged()).toBe(false)
  })
})
