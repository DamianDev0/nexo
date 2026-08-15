import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useSwitchLanguage } from '@/features/switch-language/model/use-switch-language'

const changeLanguage = vi.fn(async () => undefined)
const refresh = vi.fn()
const setLocaleAction = vi.fn<(locale: string) => Promise<void>>(async () => undefined)

let resolvedLanguage: string | undefined = 'es'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh }),
}))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ i18n: { resolvedLanguage, changeLanguage } }),
}))

vi.mock('@/features/switch-language/api/set-locale.action', () => ({
  setLocaleAction: (locale: string) => setLocaleAction(locale),
}))

beforeEach(() => {
  changeLanguage.mockClear()
  refresh.mockClear()
  setLocaleAction.mockClear()
  resolvedLanguage = 'es'
})

describe('useSwitchLanguage', () => {
  it('resolves the current locale from i18n', () => {
    const { result } = renderHook(() => useSwitchLanguage())
    expect(result.current.current).toBe('es')
  })

  it('falls back to the default locale when resolvedLanguage is unsupported', () => {
    resolvedLanguage = 'fr'
    const { result } = renderHook(() => useSwitchLanguage())
    expect(result.current.current).toBe('es')
  })

  it('falls back to the default locale when resolvedLanguage is undefined', () => {
    resolvedLanguage = undefined
    const { result } = renderHook(() => useSwitchLanguage())
    expect(result.current.current).toBe('es')
  })

  it('resolves english when i18n already reports it', () => {
    resolvedLanguage = 'en'
    const { result } = renderHook(() => useSwitchLanguage())
    expect(result.current.current).toBe('en')
  })

  it('switches locale: persists the cookie, updates i18n, and refreshes the router', async () => {
    const { result } = renderHook(() => useSwitchLanguage())

    await act(async () => {
      await result.current.switchTo('en')
    })

    expect(setLocaleAction).toHaveBeenCalledWith('en')
    expect(changeLanguage).toHaveBeenCalledWith('en')
    expect(refresh).toHaveBeenCalledTimes(1)
  })

  it('is a no-op when switching to the already-current locale', async () => {
    const { result } = renderHook(() => useSwitchLanguage())

    await act(async () => {
      await result.current.switchTo('es')
    })

    expect(setLocaleAction).not.toHaveBeenCalled()
    expect(changeLanguage).not.toHaveBeenCalled()
    expect(refresh).not.toHaveBeenCalled()
  })

  it('recomputes switchTo after the resolved locale changes, instead of using a stale closure', async () => {
    const { result, rerender } = renderHook(() => useSwitchLanguage())
    expect(result.current.current).toBe('es')

    resolvedLanguage = 'en'
    rerender()
    expect(result.current.current).toBe('en')

    await act(async () => {
      await result.current.switchTo('en')
    })

    expect(setLocaleAction).not.toHaveBeenCalled()
    expect(changeLanguage).not.toHaveBeenCalled()
    expect(refresh).not.toHaveBeenCalled()
  })
})
