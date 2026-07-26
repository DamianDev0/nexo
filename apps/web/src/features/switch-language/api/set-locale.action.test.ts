import { beforeEach, describe, expect, it, vi } from 'vitest'

import { setLocaleAction } from './set-locale.action'

const cookieSet = vi.fn()

vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({ set: cookieSet })),
}))

beforeEach(() => cookieSet.mockClear())

describe('setLocaleAction', () => {
  it('persists a supported locale for a year', async () => {
    await setLocaleAction('en')

    expect(cookieSet).toHaveBeenCalledWith(
      'NEXT_LOCALE',
      'en',
      expect.objectContaining({ path: '/', sameSite: 'lax', maxAge: 31_536_000 }),
    )
  })

  it('rejects unsupported locales silently', async () => {
    await setLocaleAction('fr')

    expect(cookieSet).not.toHaveBeenCalled()
  })
})
