import { HttpResponse, http } from 'msw'
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'

import { server } from '../../../msw/server'
import { API } from '../../../msw/test-server'

import authService from '@/shared/api/services/auth.service'
import settingsService from '@/shared/api/services/settings.service'

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('services against MSW backend', () => {
  it('authService.me unwraps the user from the response envelope', async () => {
    const me = await authService.me()

    expect(me).toMatchObject({ email: 'damian@nexo.test', role: 'owner' })
  })

  it('settingsService.getGeneral returns typed settings', async () => {
    const settings = await settingsService.getGeneral()

    expect(settings).toMatchObject({
      i18n: { timezone: 'America/Bogota', currency: 'COP' },
    })
  })

  it('rejects with a normalized ApiErrorResponse on 401', async () => {
    server.use(
      http.get(`${API}/auth/me`, () =>
        HttpResponse.json(
          {
            statusCode: 401,
            message: 'Invalid credentials',
            error: 'Unauthorized',
            timestamp: '',
            path: '/auth/me',
            method: 'GET',
          },
          { status: 401 },
        ),
      ),
    )

    await expect(authService.me()).rejects.toMatchObject({
      statusCode: 401,
      message: 'Invalid credentials',
    })
  })
})
