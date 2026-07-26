import { IndustrySector, UserRole } from '@repo/shared-types'
import { HttpResponse, http } from 'msw'
import { describe, expect, it, vi } from 'vitest'
import { ZodError } from 'zod'

import { API, createMswServer } from '../../msw/test-server'

import {
  createPipelineAction,
  inviteUsersAction,
  saveGeneralAction,
  saveNomenclatureAction,
  saveNavigationAction,
  saveThemeAction,
} from '@/features/setup-workspace/api/setup-steps.actions'

const updateTag = vi.fn()

vi.mock('server-only', () => ({}))
vi.mock('next/cache', () => ({
  updateTag: (tag: string) => updateTag(tag),
}))
vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({ toString: (): string => 'access_token=jwt123' })),
}))

const server = createMswServer()

const THEME = {
  colors: {
    primary: '#A5E96F',
    primaryForeground: '#0E0F0C',
    secondary: '#7FD6C2',
    accent: '#DFF3C6',
    sidebar: '#0E0F0C',
    sidebarForeground: '#F4F6F0',
  },
  typography: { fontFamily: 'inter', borderRadius: 'lg', density: 'comfortable' },
  branding: {
    logoUrl: null,
    faviconUrl: null,
    loginBgUrl: null,
    companyName: 'Acme',
    loginTagline: null,
  },
  iconPack: 'outline',
  darkModeDefault: 'system',
} as const

describe('saveGeneralAction', () => {
  it('patches general settings with Colombian defaults and refreshes the cache tag', async () => {
    let body: unknown
    server.use(
      http.patch(`${API}/settings/general`, async ({ request }) => {
        body = await request.json()
        return HttpResponse.json({ data: {} })
      }),
    )

    const result = await saveGeneralAction({
      phone: '3001234567',
      website: 'https://acme.co',
      sector: IndustrySector.TECNOLOGIA,
    })

    expect(result).toEqual({ ok: true, data: null })
    expect(body).toMatchObject({
      business: { phone: '3001234567' },
      i18n: { timezone: 'America/Bogota', currency: 'COP' },
    })
    expect(updateTag).toHaveBeenCalledWith('settings:general')
  })

  it('maps an API failure to an error result', async () => {
    server.use(
      http.patch(`${API}/settings/general`, () =>
        HttpResponse.json(
          {
            statusCode: 403,
            message: 'Forbidden',
            error: 'Forbidden',
            timestamp: '',
            path: '/settings/general',
            method: 'PATCH',
          },
          { status: 403 },
        ),
      ),
    )

    const result = await saveGeneralAction({
      phone: '',
      website: '',
      sector: IndustrySector.TECNOLOGIA,
    })

    expect(result).toEqual({ ok: false, error: 'Forbidden' })
  })
})

describe('createPipelineAction', () => {
  it('creates the default pipeline and returns it', async () => {
    server.use(
      http.post(`${API}/settings/pipelines`, () =>
        HttpResponse.json({ data: { id: 'pipe-1', name: 'Sales', isDefault: true, stages: [] } }),
      ),
    )

    const result = await createPipelineAction({
      name: 'Sales',
      stages: [{ name: 'MQL', color: '#a3e635', probability: 10 }],
    })

    expect(result).toMatchObject({ ok: true, data: { id: 'pipe-1' } })
  })

  it('rejects an empty stage list at the boundary', async () => {
    await expect(createPipelineAction({ name: 'Sales', stages: [] })).rejects.toBeInstanceOf(
      ZodError,
    )
  })
})

describe('saveNomenclatureAction', () => {
  it('patches the nomenclature config', async () => {
    server.use(http.patch(`${API}/settings/nomenclature`, () => HttpResponse.json({ data: {} })))

    const terms = { singular: 'Paciente', plural: 'Pacientes' }
    const result = await saveNomenclatureAction({
      contact: terms,
      company: terms,
      deal: terms,
      activity: terms,
    })

    expect(result).toEqual({ ok: true, data: null })
  })
})

describe('saveNavigationAction', () => {
  it('patches the sidebar modules', async () => {
    server.use(http.patch(`${API}/settings/navigation`, () => HttpResponse.json({ data: {} })))

    const result = await saveNavigationAction({
      modules: [
        {
          key: 'dashboard',
          label: 'Dashboard',
          icon: 'home',
          enabled: true,
          order: 1,
          customIconUrl: null,
          required: true,
        },
      ],
    })

    expect(result).toEqual({ ok: true, data: null })
  })
})

describe('saveThemeAction', () => {
  it('patches the theme and refreshes its cache tag', async () => {
    server.use(http.patch(`${API}/settings/theme`, () => HttpResponse.json({ data: {} })))

    const result = await saveThemeAction(THEME)

    expect(result).toEqual({ ok: true, data: null })
    expect(updateTag).toHaveBeenCalledWith('settings:theme')
  })
})

describe('inviteUsersAction', () => {
  it('sends one invite per row and returns the count', async () => {
    let calls = 0
    server.use(
      http.post(`${API}/users/invite`, () => {
        calls += 1
        return HttpResponse.json({ data: {} })
      }),
    )

    const result = await inviteUsersAction([
      { email: 'ana@acme.co', role: UserRole.SALES_REP },
      { email: 'luis@acme.co', role: UserRole.MANAGER },
    ])

    expect(result).toEqual({ ok: true, data: 2 })
    expect(calls).toBe(2)
  })

  it('rejects malformed emails at the boundary', async () => {
    await expect(
      inviteUsersAction([{ email: 'not-an-email', role: UserRole.SALES_REP }]),
    ).rejects.toBeInstanceOf(ZodError)
  })
})
