import { HttpResponse, http } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'

import { ApiError } from '@/shared/api/api-error'
import { apiFetch } from '@/shared/api/client'

vi.mock('server-only', () => ({}))
vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({ toString: (): string => 'access_token=jwt123' })),
}))

const API = 'http://localhost:8080/api/v1'
const server = setupServer()

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('apiFetch', () => {
  it('forwards the incoming cookies and unwraps the data envelope', async () => {
    let receivedCookie = ''
    server.use(
      http.get(`${API}/auth/me`, ({ request }) => {
        receivedCookie = request.headers.get('cookie') ?? ''
        return HttpResponse.json({ statusCode: 200, data: { id: 'u1' } })
      }),
    )

    const me = await apiFetch<{ id: string }>('/auth/me')

    expect(me).toEqual({ id: 'u1' })
    expect(receivedCookie).toBe('access_token=jwt123')
  })

  it('runs the boundary parser over the payload', async () => {
    server.use(
      http.get(`${API}/settings/general`, () =>
        HttpResponse.json({ data: { sector: 'tecnologia' } }),
      ),
    )

    const parsed = await apiFetch('/settings/general', {
      parse: (json) => (json as { sector: string }).sector.toUpperCase(),
    })

    expect(parsed).toBe('TECNOLOGIA')
  })

  it('throws a typed ApiError on non-2xx responses', async () => {
    server.use(
      http.get(`${API}/auth/me`, () =>
        HttpResponse.json(
          {
            statusCode: 401,
            message: 'Unauthorized',
            error: 'Unauthorized',
            timestamp: '',
            path: '/auth/me',
            method: 'GET',
          },
          { status: 401 },
        ),
      ),
    )

    const failure = apiFetch('/auth/me')

    await expect(failure).rejects.toBeInstanceOf(ApiError)
    await expect(failure).rejects.toMatchObject({ statusCode: 401 })
  })
})
