import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'

import { server } from '@/test/msw/server'

import authService from './auth.service'
import settingsService from './settings.service'

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

  it('authService.login rejects with a normalized ApiErrorResponse on 401', async () => {
    await expect(
      authService.login({ email: 'bad@nexo.test', password: 'wrong' }),
    ).rejects.toMatchObject({ statusCode: 401, message: 'Invalid credentials' })
  })
})
