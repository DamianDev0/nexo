import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getLocale, getT } from '@/shared/i18n/server'

const cookieGet = vi.fn()
const headerGet = vi.fn()

vi.mock('server-only', () => ({}))
vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({ get: cookieGet })),
  headers: vi.fn(async () => ({ get: headerGet })),
}))

beforeEach(() => {
  cookieGet.mockReset()
  headerGet.mockReset()
})

describe('getLocale', () => {
  it('honours the locale cookie', async () => {
    cookieGet.mockReturnValue({ value: 'en' })

    await expect(getLocale()).resolves.toBe('en')
  })

  it('ignores an invalid cookie and falls back to Spanish, never the browser language', async () => {
    cookieGet.mockReturnValue({ value: 'fr' })
    headerGet.mockReturnValue('en-US,en;q=0.9')

    await expect(getLocale()).resolves.toBe('es')
  })

  it('defaults to es without a cookie', async () => {
    cookieGet.mockReturnValue(undefined)

    await expect(getLocale()).resolves.toBe('es')
  })
})

describe('getT', () => {
  it('translates with the resolved locale', async () => {
    cookieGet.mockReturnValue({ value: 'en' })
    const t = await getT()

    expect(t('dashboard.greeting')).not.toBe('dashboard.greeting')
  })

  it('returns the key when no locale has it', async () => {
    cookieGet.mockReturnValue({ value: 'es' })
    const t = await getT()

    expect(t('missing.key.path')).toBe('missing.key.path')
  })
})
