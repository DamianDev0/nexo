import { HttpResponse, http } from 'msw'
import { describe, expect, it, vi } from 'vitest'

import { API, createMswServer } from '../../msw/test-server'

import { apiFetch } from '@/shared/api/client'
import { request } from '@/shared/api/request'

const cookieSet = vi.fn()

vi.mock('server-only', () => ({}))
vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({
    toString: (): string => 'access_token=expired',
    set: cookieSet,
  })),
}))

const server = createMswServer()

describe('server apiFetch session refresh', () => {
  it('refreshes the session and retries once on 401', async () => {
    let refreshCalls = 0
    let attempts = 0
    let retriedCookie = ''

    server.use(
      http.get(`${API}/settings/general`, ({ request: req }) => {
        attempts += 1
        const cookie = req.headers.get('cookie') ?? ''
        if (!cookie.includes('access_token=fresh')) {
          return HttpResponse.json({ statusCode: 401 }, { status: 401 })
        }
        retriedCookie = cookie
        return HttpResponse.json({ data: { id: 'tenant-1' } })
      }),
      http.post(`${API}/auth/refresh`, () => {
        refreshCalls += 1
        return HttpResponse.json(
          { data: { user: { id: 'u1' } } },
          { headers: { 'Set-Cookie': 'access_token=fresh; Path=/; HttpOnly' } },
        )
      }),
    )

    const data = await apiFetch<{ id: string }>('/settings/general', { cache: 'no-store' })

    expect(data).toEqual({ id: 'tenant-1' })
    expect(refreshCalls).toBe(1)
    expect(attempts).toBe(2)
    expect(retriedCookie).toContain('access_token=fresh')
    expect(cookieSet).toHaveBeenCalledWith('access_token', 'fresh', expect.anything())
  })

  it('does not attempt refresh for auth endpoints', async () => {
    let refreshCalls = 0
    server.use(
      http.get(`${API}/auth/me`, () => HttpResponse.json({ statusCode: 401 }, { status: 401 })),
      http.post(`${API}/auth/refresh`, () => {
        refreshCalls += 1
        return HttpResponse.json({ data: {} })
      }),
    )

    await expect(apiFetch('/auth/me', { cache: 'no-store' })).rejects.toMatchObject({
      statusCode: 401,
    })
    expect(refreshCalls).toBe(0)
  })

  it('surfaces the original 401 when the refresh also fails', async () => {
    server.use(
      http.get(`${API}/settings/general`, () =>
        HttpResponse.json({ statusCode: 401 }, { status: 401 }),
      ),
      http.post(`${API}/auth/refresh`, () =>
        HttpResponse.json({ statusCode: 401 }, { status: 401 }),
      ),
    )

    await expect(apiFetch('/settings/general', { cache: 'no-store' })).rejects.toMatchObject({
      statusCode: 401,
    })
  })
})

describe('axios session refresh', () => {
  it('refreshes and replays the failed request transparently', async () => {
    let refreshed = false
    let refreshCalls = 0

    server.use(
      http.get(`${API}/settings/nomenclature`, () => {
        if (!refreshed) {
          return HttpResponse.json({ statusCode: 401 }, { status: 401 })
        }
        return HttpResponse.json({ data: { contact: 'ok' } })
      }),
      http.post(`${API}/auth/refresh`, () => {
        refreshed = true
        refreshCalls += 1
        return HttpResponse.json({ data: { user: { id: 'u1' } } })
      }),
    )

    const data = await request<{ contact: string }>({
      method: 'get',
      url: '/settings/nomenclature',
    })

    expect(data).toEqual({ contact: 'ok' })
    expect(refreshCalls).toBe(1)
  })
})
