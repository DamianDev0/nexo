import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { useRecordLayout } from '@/shared/ui/organisms/record-layout'

describe('useRecordLayout', () => {
  it('starts closed when no default panel is given', () => {
    const { result } = renderHook(() => useRecordLayout())

    expect(result.current.activePanel).toBeNull()
  })

  it('opens on the panel it was handed', () => {
    const { result } = renderHook(() => useRecordLayout({ defaultPanel: 'files' }))

    expect(result.current.activePanel).toBe('files')
  })

  it('swaps panels without closing when a different one is toggled', () => {
    const { result } = renderHook(() => useRecordLayout({ defaultPanel: 'files' }))

    act(() => result.current.togglePanel('notes'))

    expect(result.current.activePanel).toBe('notes')
  })

  it('closes the panel when its own rail item is toggled again', () => {
    const { result } = renderHook(() => useRecordLayout({ defaultPanel: 'files' }))

    act(() => result.current.togglePanel('files'))

    expect(result.current.activePanel).toBeNull()
  })

  it('follows the panel the owner controls', () => {
    const { result, rerender } = renderHook(
      ({ panel }: { panel: string | null }) => useRecordLayout({ panel }),
      { initialProps: { panel: 'files' as string | null } },
    )

    expect(result.current.activePanel).toBe('files')

    act(() => result.current.togglePanel('notes'))
    expect(result.current.activePanel).toBe('files')

    rerender({ panel: 'notes' })
    expect(result.current.activePanel).toBe('notes')
  })

  it('asks the owner to close a controlled panel', () => {
    const onPanelChange = vi.fn()
    const { result } = renderHook(() => useRecordLayout({ panel: 'files', onPanelChange }))

    act(() => result.current.togglePanel('files'))

    expect(onPanelChange).toHaveBeenCalledWith(null)
  })

  it('reports every change to the caller', () => {
    const onPanelChange = vi.fn()
    const { result } = renderHook(() => useRecordLayout({ onPanelChange }))

    act(() => result.current.togglePanel('notes'))
    act(() => result.current.closePanel())

    expect(onPanelChange).toHaveBeenNthCalledWith(1, 'notes')
    expect(onPanelChange).toHaveBeenNthCalledWith(2, null)
  })
})
