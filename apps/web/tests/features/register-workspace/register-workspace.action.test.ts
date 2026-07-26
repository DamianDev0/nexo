import { PlanName } from '@repo/shared-types'
import { HttpResponse, http } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { registerWorkspaceAction } from '@/features/register-workspace/api/register-workspace.action'

const cookieSet = vi.fn()

vi.mock('server-only', () => ({}))
vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({ toString: (): string => '', set: cookieSet })),
}))

const API = 'http://localhost:8080/api/v1'
const server = setupServer()

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
beforeEach(() => cookieSet.mockClear())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const FORM = {
  businessName: 'Acme SAS',
  slug: 'acme-sas',
  planName: PlanName.FREE,
  ownerFullName: 'Ana Torres',
  ownerEmail: 'ana@acme.co',
  ownerPassword: 'Secret123!',
}

describe('registerWorkspaceAction', () => {
  it('creates the workspace and relays session cookies', async () => {
    server.use(
      http.post(`${API}/auth/onboard`, () =>
        HttpResponse.json(
          {
            data: {
              user: { id: 'u1' },
              tenant: {
                id: 't1',
                slug: 'acme-sas',
                name: 'Acme SAS',
                schemaName: 's',
                plan: 'FREE',
              },
            },
          },
          {
            headers: {
              'Set-Cookie': 'access_token=jwt456; Path=/; HttpOnly; Secure; SameSite=Lax',
            },
          },
        ),
      ),
    )

    const result = await registerWorkspaceAction(FORM)

    expect(result).toEqual({ ok: true, tenant: { slug: 'acme-sas', name: 'Acme SAS' } })
    expect(cookieSet).toHaveBeenCalledWith(
      'access_token',
      'jwt456',
      expect.objectContaining({ httpOnly: true, secure: true }),
    )
  })

  it('returns the API message when onboarding fails', async () => {
    server.use(
      http.post(`${API}/auth/onboard`, () =>
        HttpResponse.json(
          {
            statusCode: 409,
            message: 'Slug already taken',
            error: 'Conflict',
            timestamp: '',
            path: '/auth/onboard',
            method: 'POST',
          },
          { status: 409 },
        ),
      ),
    )

    await expect(registerWorkspaceAction(FORM)).resolves.toEqual({
      ok: false,
      error: 'Slug already taken',
    })
    expect(cookieSet).not.toHaveBeenCalled()
  })
})
