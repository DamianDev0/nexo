import { relativeLuminance } from '@repo/shared-utils'
import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { usePrimaryOrbTheme } from '@/shared/lib/hooks/usePrimaryOrbTheme'

vi.mock('@repo/shared-utils', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@repo/shared-utils')>()
  return { ...actual, relativeLuminance: vi.fn(actual.relativeLuminance) }
})

afterEach(() => {
  document.documentElement.style.removeProperty('--primary')
  document.documentElement.removeAttribute('data-theme')
  vi.restoreAllMocks()
})

describe('usePrimaryOrbTheme', () => {
  it('resolves dark ink for a low-luminance primary color', () => {
    document.documentElement.style.setProperty('--primary', '#000000')

    const { result } = renderHook(() => usePrimaryOrbTheme())

    expect(result.current).toBe('dark')
  })

  it('reacts to a style mutation that switches to a light-ink primary', async () => {
    document.documentElement.style.setProperty('--primary', '#000000')
    const { result } = renderHook(() => usePrimaryOrbTheme())
    expect(result.current).toBe('dark')

    act(() => {
      document.documentElement.style.setProperty('--primary', '#ffffff')
    })

    await waitFor(() => expect(result.current).toBe('light'))
  })

  it('falls back to light ink when the custom property is not a hex color', () => {
    document.documentElement.style.setProperty('--primary', '#000000')
    const { result } = renderHook(() => usePrimaryOrbTheme())
    expect(result.current).toBe('dark')

    document.documentElement.style.setProperty('--primary', 'transparent')
    const { result: fresh } = renderHook(() => usePrimaryOrbTheme())

    expect(fresh.current).toBe('light')
  })

  it('trims surrounding whitespace before checking the hex prefix', () => {
    vi.spyOn(window, 'getComputedStyle').mockReturnValue({
      getPropertyValue: () => '  #000000  ',
    } as unknown as CSSStyleDeclaration)

    const { result } = renderHook(() => usePrimaryOrbTheme())

    expect(result.current).toBe('dark')
  })

  it('requires luminance to be strictly greater than 0.4, not equal to it', () => {
    vi.mocked(relativeLuminance).mockReturnValueOnce(0.4)
    document.documentElement.style.setProperty('--primary', '#000000')

    const { result } = renderHook(() => usePrimaryOrbTheme())

    expect(result.current).toBe('dark')
  })

  it('observes the exact set of attributes that can change the theme', () => {
    const observeSpy = vi.spyOn(MutationObserver.prototype, 'observe')

    renderHook(() => usePrimaryOrbTheme())

    expect(observeSpy).toHaveBeenCalledWith(document.documentElement, {
      attributes: true,
      attributeFilter: ['style', 'class', 'data-theme'],
    })

    observeSpy.mockRestore()
  })

  it('reacts when the data-theme attribute changes', async () => {
    document.documentElement.style.setProperty('--primary', '#000000')
    const { result } = renderHook(() => usePrimaryOrbTheme())
    expect(result.current).toBe('dark')

    act(() => {
      document.documentElement.style.setProperty('--primary', '#ffffff')
      document.documentElement.setAttribute('data-theme', 'light')
    })

    await waitFor(() => expect(result.current).toBe('light'))
  })

  it('disconnects the observer on unmount', () => {
    const disconnectSpy = vi.spyOn(MutationObserver.prototype, 'disconnect')

    const { unmount } = renderHook(() => usePrimaryOrbTheme())
    unmount()

    expect(disconnectSpy).toHaveBeenCalled()

    disconnectSpy.mockRestore()
  })
})
