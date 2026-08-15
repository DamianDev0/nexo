import { HttpResponse, http } from 'msw'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { API, createMswServer } from '../../msw/test-server'

import { loginAction } from '@/features/login/api/login.action'

const cookieSet = vi.fn()

vi.mock('server-only', () => ({}))
vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({ toString: (): string => '', set: cookieSet })),
}))

const server = createMswServer()

beforeEach(() => cookieSet.mockClear())

const CREDENTIALS = { email: 'ana@acme.co', password: 'Secret123!' }

const ERROR_BODY = {
  statusCode: 401,
  message: 'Invalid credentials',
  error: 'Unauthorized',
  timestamp: '',
  path: '/auth/login',
  method: 'POST',
}

describe('loginAction', () => {
  it('resolves the tenant, forwards the slug header and relays session cookies', async () => {
    let tenantHeader = ''
    server.use(
      http.post(`${API}/auth/resolve-tenant`, () => HttpResponse.json({ data: { slug: 'acme' } })),
      http.post(`${API}/auth/login`, ({ request }) => {
        tenantHeader = request.headers.get('x-tenant-slug') ?? ''
        return HttpResponse.json(
          { data: { user: { id: 'u1' } } },
          {
            headers: {
              'Set-Cookie': 'access_token=jwt123; Path=/; HttpOnly; SameSite=Lax',
            },
          },
        )
      }),
    )

    const result = await loginAction(CREDENTIALS)

    expect(result).toEqual({ ok: true, slug: 'acme' })
    expect(tenantHeader).toBe('acme')
    expect(cookieSet).toHaveBeenCalledWith(
      'access_token',
      'jwt123',
      expect.objectContaining({ httpOnly: true, path: '/', sameSite: 'lax' }),
    )
  })

  it('maps a 404 tenant resolution to workspace_not_found', async () => {
    server.use(
      http.post(`${API}/auth/resolve-tenant`, () =>
        HttpResponse.json({ ...ERROR_BODY, statusCode: 404 }, { status: 404 }),
      ),
    )

    await expect(loginAction(CREDENTIALS)).resolves.toEqual({
      ok: false,
      error: 'workspace_not_found',
    })
    expect(cookieSet).not.toHaveBeenCalled()
  })

  it('never blames the email when the API itself is down', async () => {
    server.use(http.post(`${API}/auth/resolve-tenant`, () => HttpResponse.error()))

    await expect(loginAction(CREDENTIALS)).resolves.toEqual({ ok: false, error: 'unknown' })
  })

  it('never blames the email when tenant resolution errors out server-side', async () => {
    server.use(
      http.post(`${API}/auth/resolve-tenant`, () =>
        HttpResponse.json({ ...ERROR_BODY, statusCode: 500 }, { status: 500 }),
      ),
    )

    await expect(loginAction(CREDENTIALS)).resolves.toEqual({ ok: false, error: 'unknown' })
  })

  it('maps a 401 login to invalid_credentials', async () => {
    server.use(
      http.post(`${API}/auth/resolve-tenant`, () => HttpResponse.json({ data: { slug: 'acme' } })),
      http.post(`${API}/auth/login`, () => HttpResponse.json(ERROR_BODY, { status: 401 })),
    )

    await expect(loginAction(CREDENTIALS)).resolves.toEqual({
      ok: false,
      error: 'invalid_credentials',
    })
  })

  it('maps any other login failure to unknown', async () => {
    server.use(
      http.post(`${API}/auth/resolve-tenant`, () => HttpResponse.json({ data: { slug: 'acme' } })),
      http.post(`${API}/auth/login`, () =>
        HttpResponse.json({ ...ERROR_BODY, statusCode: 500 }, { status: 500 }),
      ),
    )

    await expect(loginAction(CREDENTIALS)).resolves.toEqual({ ok: false, error: 'unknown' })
  })
})
