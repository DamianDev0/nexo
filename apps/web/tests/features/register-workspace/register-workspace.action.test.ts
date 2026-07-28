import { PlanName } from '@repo/shared-types'
import { HttpResponse, http } from 'msw'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { API, createMswServer } from '../../msw/test-server'

import { registerWorkspaceAction } from '@/features/register-workspace/api/register-workspace.action'

const cookieSet = vi.fn()

vi.mock('server-only', () => ({}))
vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({ toString: (): string => '', set: cookieSet })),
}))

const server = createMswServer()

beforeEach(() => cookieSet.mockClear())

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
