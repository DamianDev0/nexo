import { beforeEach, describe, expect, it, vi } from 'vitest'

const set = vi.fn()

vi.mock('server-only', () => ({}))
vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({ set })),
}))

const { relaySetCookies } = await import('@/shared/api/relay-cookies')

describe('relaySetCookies', () => {
  beforeEach(() => set.mockClear())

  it('forwards name, value and every supported attribute', async () => {
    await relaySetCookies([
      'access_token=abc123; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=900',
    ])

    expect(set).toHaveBeenCalledWith('access_token', 'abc123', {
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 900,
    })
  })

  it('drops malformed headers instead of writing a cookie', async () => {
    await relaySetCookies(['', 'nonsense', '=novalue'])

    expect(set).not.toHaveBeenCalled()
  })

  it('ignores unparsable max-age, expires and samesite values', async () => {
    await relaySetCookies(['a=1; Max-Age=abc; Expires=not-a-date; SameSite=weird'])

    expect(set).toHaveBeenCalledWith('a', '1', {})
  })

  it('keeps a valid expires as a Date', async () => {
    await relaySetCookies(['a=1; Expires=Wed, 21 Oct 2026 07:28:00 GMT'])

    const options = set.mock.calls[0]?.[2] as { expires?: Date }
    expect(options.expires).toBeInstanceOf(Date)
  })

  it('relays several cookies in one call', async () => {
    await relaySetCookies(['a=1; Path=/', 'b=2; HttpOnly'])

    expect(set).toHaveBeenCalledTimes(2)
  })
})
