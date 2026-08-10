import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { HttpResponse, http } from 'msw'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { API, createMswServer } from '../../msw/test-server'
import { queryWrapper as wrapper } from '../../query-wrapper'

import type { ThemeConfig } from '@repo/shared-types'
import type { ReactNode } from 'react'

import {
  APPEARANCE_DEFAULT_VALUES,
  THEME_PRESETS,
} from '@/features/setup-workspace/config/appearance.constants'
import { useStepAppearance } from '@/features/setup-workspace/model/useStepAppearance'
import { QUERY_KEYS } from '@/shared/query/query-keys'

vi.mock('server-only', () => ({}))
vi.mock('next/cache', () => ({ updateTag: vi.fn() }))
vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({ toString: (): string => '' })),
}))
vi.mock('i18next', () => ({ t: (key: string) => key }))

const uploadLogo = vi.fn()

vi.mock('@/shared/api/services/settings.service', async () => {
  const actual = await vi.importActual<typeof import('@/shared/api/services/settings.service')>(
    '@/shared/api/services/settings.service',
  )
  return {
    default: { ...actual.default, uploadLogo: (file: File) => uploadLogo(file) },
  }
})

const sileoError = vi.fn()
const sileoSuccess = vi.fn()

vi.mock('sileo', () => ({
  sileo: {
    error: (...args: unknown[]) => sileoError(...args),
    success: (...args: unknown[]) => sileoSuccess(...args),
  },
}))

function makeWrapper() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  function Wrapper({ children }: Readonly<{ children: ReactNode }>) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>
  }
  return { client, Wrapper }
}

beforeEach(() => {
  sileoError.mockClear()
  sileoSuccess.mockClear()
  uploadLogo.mockReset()
  URL.createObjectURL = vi.fn(() => 'blob:preview')
})

const server = createMswServer()

const HYDRATED_PRIMARY = '#334455'

const FULL_THEME: ThemeConfig = {
  colors: {
    primary: HYDRATED_PRIMARY,
    primaryForeground: '#0E0F0C',
    secondary: '#7FD6C2',
    accent: '#DFF3C6',
    sidebar: '#0E0F0C',
    sidebarForeground: '#F4F6F0',
  },
  typography: { fontFamily: 'roboto', borderRadius: 'full', density: 'spacious' },
  branding: {
    logoUrl: 'https://cdn.acme.co/logo.png',
    faviconUrl: null,
    loginBgUrl: null,
    companyName: 'Acme',
    loginTagline: 'Sell more',
  },
  iconPack: 'outline',
  darkModeDefault: 'dark',
}

function themeHandler(overrides: Partial<ThemeConfig> = {}) {
  return http.get(`${API}/settings/theme`, () =>
    HttpResponse.json({ data: { ...FULL_THEME, ...overrides } }),
  )
}

function emptyTheme() {
  return http.get(`${API}/settings/theme`, () => HttpResponse.json({ data: {} }))
}

describe('useStepAppearance hydration', () => {
  it('resets the form with the saved theme', async () => {
    server.use(themeHandler())

    const { result } = renderHook(() => useStepAppearance(vi.fn()), { wrapper })

    await waitFor(() => expect(result.current.primaryColor).toBe(HYDRATED_PRIMARY))
    expect(result.current.fontFamily).toBe('roboto')
    expect(result.current.borderRadius).toBe('full')
    expect(result.current.density).toBe('spacious')
    expect(result.current.darkMode).toBe('dark')
    expect(result.current.productName).toBe('Acme')
    expect(result.current.tagline).toBe('Sell more')
    expect(result.current.logoPreview).toBeNull()
  })

  it('falls back typography and branding when the saved theme omits them', async () => {
    server.use(themeHandler({ typography: undefined, branding: undefined }))

    const { result } = renderHook(() => useStepAppearance(vi.fn()), { wrapper })

    await waitFor(() => expect(result.current.primaryColor).toBe(HYDRATED_PRIMARY))
    expect(result.current.fontFamily).toBe(APPEARANCE_DEFAULT_VALUES.fontFamily)
    expect(result.current.borderRadius).toBe(APPEARANCE_DEFAULT_VALUES.borderRadius)
    expect(result.current.density).toBe(APPEARANCE_DEFAULT_VALUES.density)
    expect(result.current.productName).toBe('')
    expect(result.current.tagline).toBe('')
  })

  it('keeps every default when the server has nothing saved yet', async () => {
    server.use(emptyTheme())

    const { result } = renderHook(() => useStepAppearance(vi.fn()), { wrapper })
    await waitFor(() => expect(result.current.isPending).toBe(false))
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(result.current.primaryColor).toBe(APPEARANCE_DEFAULT_VALUES.primaryColor)
    expect(result.current.fontFamily).toBe(APPEARANCE_DEFAULT_VALUES.fontFamily)
    expect(result.current.productName).toBe('')
    expect(result.current.tagline).toBe('')
  })
})

describe('useStepAppearance color actions', () => {
  it('changing the primary color clears prior overrides', async () => {
    server.use(themeHandler())
    const { result } = renderHook(() => useStepAppearance(vi.fn()), { wrapper })
    await waitFor(() => expect(result.current.primaryColor).toBe(HYDRATED_PRIMARY))

    act(() => result.current.handleColorOverride('accent', '#123456'))
    expect(result.current.colors.accent).toBe('#123456')

    act(() => result.current.handlePrimaryChange('#000000'))
    expect(result.current.primaryColor).toBe('#000000')
    expect(result.current.colors.accent).not.toBe('#123456')
  })

  it('overriding one color key preserves the others', async () => {
    server.use(themeHandler())
    const { result } = renderHook(() => useStepAppearance(vi.fn()), { wrapper })
    await waitFor(() => expect(result.current.primaryColor).toBe(HYDRATED_PRIMARY))

    act(() => result.current.handleColorOverride('accent', '#111111'))
    act(() => result.current.handleColorOverride('secondary', '#222222'))

    expect(result.current.colors.accent).toBe('#111111')
    expect(result.current.colors.secondary).toBe('#222222')
  })
})

describe('useStepAppearance presets', () => {
  it('applying a preset updates the visual dimensions and is detected as active', async () => {
    server.use(themeHandler())
    const { result } = renderHook(() => useStepAppearance(vi.fn()), { wrapper })
    await waitFor(() => expect(result.current.primaryColor).toBe(HYDRATED_PRIMARY))

    const midnight = THEME_PRESETS.find((p) => p.key === 'midnight')
    if (!midnight) throw new Error('missing preset')

    act(() => result.current.handleApplyPreset(midnight))

    expect(result.current.primaryColor).toBe(midnight.primary)
    expect(result.current.fontFamily).toBe(midnight.fontFamily)
    expect(result.current.activePresetKey).toBe('midnight')
    expect(result.current.isDirty).toBe(true)
  })

  it('reports no active preset once a dimension diverges', async () => {
    server.use(themeHandler())
    const { result } = renderHook(() => useStepAppearance(vi.fn()), { wrapper })
    await waitFor(() => expect(result.current.primaryColor).toBe(HYDRATED_PRIMARY))

    act(() => result.current.handlePrimaryChange('#ABCDEF'))
    expect(result.current.activePresetKey).toBeNull()
  })
})

describe('useStepAppearance restore', () => {
  it('merges a partial saved theme over the current values and toasts success', async () => {
    server.use(themeHandler())
    const { result } = renderHook(() => useStepAppearance(vi.fn()), { wrapper })
    await waitFor(() => expect(result.current.primaryColor).toBe(HYDRATED_PRIMARY))

    act(() =>
      result.current.handleRestoreTheme({
        colors: { primary: '#654321' } as ThemeConfig['colors'],
        branding: { companyName: 'Restored Co' } as ThemeConfig['branding'],
      }),
    )

    expect(result.current.primaryColor).toBe('#654321')
    expect(result.current.productName).toBe('Restored Co')
    expect(result.current.tagline).toBe('Sell more')
    expect(sileoSuccess).toHaveBeenCalledWith({ title: 'auth.toasts.themeRestored' })
  })

  it('keeps current values for fields absent from the restored config', async () => {
    server.use(themeHandler())
    const { result } = renderHook(() => useStepAppearance(vi.fn()), { wrapper })
    await waitFor(() => expect(result.current.primaryColor).toBe(HYDRATED_PRIMARY))

    act(() => result.current.setProductName('Keep Me'))
    act(() => result.current.handleRestoreTheme({}))

    expect(result.current.productName).toBe('Keep Me')
    expect(result.current.primaryColor).toBe(HYDRATED_PRIMARY)
    expect(result.current.fontFamily).toBe('roboto')
    expect(result.current.borderRadius).toBe('full')
    expect(result.current.density).toBe('spacious')
    expect(result.current.darkMode).toBe('dark')
  })

  it('applies typography and dark mode fields present in the restored config', async () => {
    server.use(themeHandler())
    const { result } = renderHook(() => useStepAppearance(vi.fn()), { wrapper })
    await waitFor(() => expect(result.current.primaryColor).toBe(HYDRATED_PRIMARY))

    act(() =>
      result.current.handleRestoreTheme({
        typography: { fontFamily: 'nunito', borderRadius: 'none', density: 'compact' },
        darkModeDefault: 'light',
      }),
    )

    expect(result.current.fontFamily).toBe('nunito')
    expect(result.current.borderRadius).toBe('none')
    expect(result.current.density).toBe('compact')
    expect(result.current.darkMode).toBe('light')
  })
})

async function renderHydratedAppearance() {
  server.use(themeHandler())
  const { result } = renderHook(() => useStepAppearance(vi.fn()), { wrapper })
  await waitFor(() => expect(result.current.primaryColor).toBe(HYDRATED_PRIMARY))
  expect(result.current.isDirty).toBe(false)
  return result
}

describe('useStepAppearance field setters', () => {
  it('setGrainIntensity updates the value and marks the field dirty', async () => {
    const result = await renderHydratedAppearance()
    act(() => result.current.setGrainIntensity(42))
    expect(result.current.grainIntensity).toBe(42)
    expect(result.current.isDirty).toBe(true)
  })

  it('setDarkMode updates the value and marks the field dirty', async () => {
    const result = await renderHydratedAppearance()
    act(() => result.current.setDarkMode('light'))
    expect(result.current.darkMode).toBe('light')
    expect(result.current.isDirty).toBe(true)
  })

  it('setFontFamily updates the value and marks the field dirty', async () => {
    const result = await renderHydratedAppearance()
    act(() => result.current.setFontFamily('poppins'))
    expect(result.current.fontFamily).toBe('poppins')
    expect(result.current.isDirty).toBe(true)
  })

  it('setBorderRadius updates the value and marks the field dirty', async () => {
    const result = await renderHydratedAppearance()
    act(() => result.current.setBorderRadius('none'))
    expect(result.current.borderRadius).toBe('none')
    expect(result.current.isDirty).toBe(true)
  })

  it('setDensity updates the value and marks the field dirty', async () => {
    const result = await renderHydratedAppearance()
    act(() => result.current.setDensity('compact'))
    expect(result.current.density).toBe('compact')
    expect(result.current.isDirty).toBe(true)
  })

  it('setProductName updates the value and marks the field dirty', async () => {
    const result = await renderHydratedAppearance()
    act(() => result.current.setProductName('Acme CRM'))
    expect(result.current.productName).toBe('Acme CRM')
    expect(result.current.isDirty).toBe(true)
  })

  it('setTagline updates the value and marks the field dirty', async () => {
    const result = await renderHydratedAppearance()
    act(() => result.current.setTagline('Grow faster'))
    expect(result.current.tagline).toBe('Grow faster')
    expect(result.current.isDirty).toBe(true)
  })

  it('handleReset reverts every field back to the hydrated baseline', async () => {
    const result = await renderHydratedAppearance()

    act(() => result.current.setProductName('Acme CRM'))
    act(() => result.current.handleReset())

    await waitFor(() => expect(result.current.isDirty).toBe(false))
    expect(result.current.productName).toBe('Acme')
  })
})

describe('useStepAppearance color handlers dirty tracking', () => {
  it('handlePrimaryChange marks the form dirty', async () => {
    const result = await renderHydratedAppearance()
    act(() => result.current.handlePrimaryChange('#000000'))
    expect(result.current.isDirty).toBe(true)
  })

  it('handleColorOverride marks the form dirty', async () => {
    const result = await renderHydratedAppearance()
    act(() => result.current.handleColorOverride('accent', '#111111'))
    expect(result.current.isDirty).toBe(true)
  })
})

describe('useStepAppearance save', () => {
  it('falls back to NexoCRM and a null tagline when both are blank, and invalidates the cache', async () => {
    let body:
      | { branding: { companyName: string; loginTagline: string | null }; darkModeDefault: string }
      | undefined
    server.use(
      themeHandler({ branding: { ...FULL_THEME.branding!, companyName: '', loginTagline: '' } }),
      http.patch(`${API}/settings/theme`, async ({ request }) => {
        body = (await request.json()) as typeof body
        return HttpResponse.json({ data: {} })
      }),
    )
    const { client, Wrapper } = makeWrapper()
    const invalidateSpy = vi.spyOn(client, 'invalidateQueries')
    const onNext = vi.fn()

    const { result } = renderHook(() => useStepAppearance(onNext), { wrapper: Wrapper })
    await waitFor(() => expect(result.current.primaryColor).toBe(HYDRATED_PRIMARY))
    expect(result.current.productName).toBe('')

    result.current.handleSave()

    await waitFor(() => expect(onNext).toHaveBeenCalledTimes(1))
    expect(body?.branding.companyName).toBe('NexoCRM')
    expect(body?.branding.loginTagline).toBeNull()
    expect(body?.darkModeDefault).toBe('dark')
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: QUERY_KEYS.settings.theme })
  })

  it('sends the custom product name, tagline and hydrated logo url when provided', async () => {
    let body:
      | { branding: { companyName: string; loginTagline: string | null; logoUrl: string | null } }
      | undefined
    server.use(
      themeHandler(),
      http.patch(`${API}/settings/theme`, async ({ request }) => {
        body = (await request.json()) as typeof body
        return HttpResponse.json({ data: {} })
      }),
    )
    const onNext = vi.fn()
    const { result } = renderHook(() => useStepAppearance(onNext), { wrapper })
    await waitFor(() => expect(result.current.primaryColor).toBe(HYDRATED_PRIMARY))

    result.current.handleSave()

    await waitFor(() => expect(onNext).toHaveBeenCalledTimes(1))
    expect(body?.branding.companyName).toBe('Acme')
    expect(body?.branding.loginTagline).toBe('Sell more')
    expect(body?.branding.logoUrl).toBe('https://cdn.acme.co/logo.png')
  })

  it('falls back to null when the saved theme has no logo url', async () => {
    let body: { branding: { logoUrl: string | null } } | undefined
    server.use(
      themeHandler({ branding: { ...FULL_THEME.branding!, logoUrl: null } }),
      http.patch(`${API}/settings/theme`, async ({ request }) => {
        body = (await request.json()) as typeof body
        return HttpResponse.json({ data: {} })
      }),
    )
    const onNext = vi.fn()
    const { result } = renderHook(() => useStepAppearance(onNext), { wrapper })
    await waitFor(() => expect(result.current.primaryColor).toBe(HYDRATED_PRIMARY))

    result.current.handleSave()

    await waitFor(() => expect(onNext).toHaveBeenCalledTimes(1))
    expect(body?.branding.logoUrl).toBeNull()
  })

  it('does not advance and toasts an error when the API rejects the save', async () => {
    server.use(
      themeHandler(),
      http.patch(`${API}/settings/theme`, () =>
        HttpResponse.json(
          {
            statusCode: 400,
            message: 'Invalid theme',
            error: 'Bad Request',
            timestamp: '',
            path: '/settings/theme',
            method: 'PATCH',
          },
          { status: 400 },
        ),
      ),
    )
    const onNext = vi.fn()
    const { result } = renderHook(() => useStepAppearance(onNext), { wrapper })
    await waitFor(() => expect(result.current.primaryColor).toBe(HYDRATED_PRIMARY))

    result.current.handleSave()

    await waitFor(() => expect(sileoError).toHaveBeenCalledTimes(1))
    expect(onNext).not.toHaveBeenCalled()
  })
})

describe('useStepAppearance logo delegation', () => {
  it('uploads a logo and exposes the preview and stored url', async () => {
    server.use(themeHandler())
    uploadLogo.mockResolvedValue({ url: 'https://cdn.acme.co/uploaded.png' })
    const { result } = renderHook(() => useStepAppearance(vi.fn()), { wrapper })
    await waitFor(() => expect(result.current.primaryColor).toBe(HYDRATED_PRIMARY))

    const file = new File(['logo'], 'logo.png', { type: 'image/png' })
    await act(async () => {
      await result.current.handleLogoUpload(file)
    })

    expect(result.current.logoPreview).toBe('blob:preview')
    expect(result.current.logoFileName).toBe('logo.png')

    act(() => result.current.handleLogoRemove())
    expect(result.current.logoPreview).toBeNull()
    expect(result.current.logoFileName).toBeNull()
  })

  it('rolls back the optimistic preview when the upload fails', async () => {
    server.use(themeHandler())
    uploadLogo.mockRejectedValue(new Error('upload failed'))
    const { result } = renderHook(() => useStepAppearance(vi.fn()), { wrapper })
    await waitFor(() => expect(result.current.primaryColor).toBe(HYDRATED_PRIMARY))
    const previewBefore = result.current.logoPreview
    const fileNameBefore = result.current.logoFileName

    const file = new File(['logo'], 'logo.png', { type: 'image/png' })
    await expect(
      act(async () => {
        await result.current.handleLogoUpload(file)
      }),
    ).rejects.toThrow('upload failed')

    expect(result.current.logoPreview).toBe(previewBefore)
    expect(result.current.logoFileName).toBe(fileNameBefore)
    expect(result.current.isDirty).toBe(false)
  })
})
