import { renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import type { RefObject } from 'react'

import { APP_SCROLL_ID, useScrollTopOnChange } from '@/shared/lib/hooks/useScrollTopOnChange'

afterEach(() => {
  document.body.innerHTML = ''
})

function fakeScrollable(scrollTop: number): HTMLDivElement {
  const el = document.createElement('div')
  Object.defineProperty(el, 'scrollTop', {
    value: scrollTop,
    writable: true,
    configurable: true,
  })
  return el
}

describe('APP_SCROLL_ID', () => {
  it('is the exact id used to look up the fallback scroll container', () => {
    expect(APP_SCROLL_ID).toBe('app-scroll')
  })
})

describe('useScrollTopOnChange', () => {
  it('resets the scrollTop of the given ref target on mount', () => {
    const el = fakeScrollable(120)
    const ref = { current: el } as RefObject<HTMLElement | null>

    renderHook(() => useScrollTopOnChange('key-1', ref))

    expect(el.scrollTop).toBe(0)
  })

  it('falls back to the app-scroll element when no ref is given', () => {
    const el = fakeScrollable(80)
    el.id = APP_SCROLL_ID
    document.body.appendChild(el)

    renderHook(() => useScrollTopOnChange('key-1'))

    expect(el.scrollTop).toBe(0)
  })

  it('prefers the ref target over the app-scroll element when both exist', () => {
    const refTarget = fakeScrollable(50)
    const fallback = fakeScrollable(70)
    fallback.id = APP_SCROLL_ID
    document.body.appendChild(fallback)
    const ref = { current: refTarget } as RefObject<HTMLElement | null>

    renderHook(() => useScrollTopOnChange('key-1', ref))

    expect(refTarget.scrollTop).toBe(0)
    expect(fallback.scrollTop).toBe(70)
  })

  it('does nothing and does not throw when no target exists at all', () => {
    expect(() => renderHook(() => useScrollTopOnChange('key-1'))).not.toThrow()
  })

  it('does not throw when called without a ref argument at all', () => {
    expect(() => renderHook(() => useScrollTopOnChange('key-1', undefined))).not.toThrow()
  })

  it('re-runs and resets scrollTop again when the key changes', () => {
    const ref = { current: fakeScrollable(0) } as RefObject<HTMLElement | null>

    const { rerender } = renderHook(({ key }) => useScrollTopOnChange(key, ref), {
      initialProps: { key: 'a' },
    })

    ref.current!.scrollTop = 40
    rerender({ key: 'b' })

    expect(ref.current!.scrollTop).toBe(0)
  })
})
