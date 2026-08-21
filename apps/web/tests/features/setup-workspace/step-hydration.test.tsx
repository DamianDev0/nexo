import { IndustrySector } from '@repo/shared-types'
import { TAXONOMY_COLOR_PALETTE } from '@repo/shared-types'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { HttpResponse, http } from 'msw'
import { useWatch } from 'react-hook-form'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { API, createMswServer } from '../../msw/test-server'
import { queryWrapper as wrapper } from '../../query-wrapper'

import type { ReactNode } from 'react'

import { useStepCompany } from '@/features/setup-workspace/model/useStepCompany'
import { useStepNavigation } from '@/features/setup-workspace/model/useStepNavigation'
import { useStepNomenclature } from '@/features/setup-workspace/model/useStepNomenclature'
import { useStepPipeline } from '@/features/setup-workspace/model/useStepPipeline'
import { QUERY_KEYS } from '@/shared/query/query-keys'

vi.mock('server-only', () => ({}))
vi.mock('next/cache', () => ({ updateTag: vi.fn() }))
vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({ toString: (): string => '' })),
}))
vi.mock('i18next', () => ({ t: (key: string) => key }))

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
})

function useCompanyStep(onNext: () => void) {
  const step = useStepCompany(onNext)
  const [phone, website, sector] = useWatch({
    control: step.control,
    name: ['phone', 'website', 'sector'],
  })
  return {
    ...step,
    phone,
    website,
    sector,
    setPhone: (value: string) => step.bindField('phone')(value),
    setWebsite: (value: string) => step.bindField('website')(value),
    setSector: (value: IndustrySector) => step.bindField('sector')(value),
  }
}

function usePipelineStep(onNext: () => void) {
  const step = useStepPipeline(onNext)
  const [pipelineName, values] = useWatch({
    control: step.control,
    name: ['pipelineName', 'stages'],
  })
  return {
    ...step,
    pipelineName,
    stages: step.fields.map((field, index) => ({ ...(values[index] ?? field), id: field.id })),
    setPipelineName: (value: string) => step.bindField('pipelineName')(value),
  }
}

function useNomenclatureStep(onNext: () => void) {
  const step = useStepNomenclature(onNext)
  const [contact, company, deal, activity] = useWatch({
    control: step.control,
    name: ['contact', 'company', 'deal', 'activity'],
  })
  return { ...step, nomen: { contact, company, deal, activity } }
}

function useNavigationStep(onNext: () => void) {
  const step = useStepNavigation(onNext)
  const modules = useWatch({ control: step.control, name: 'modules' })
  return { ...step, modules }
}

const server = createMswServer()

describe('useStepCompany hydration', () => {
  it('resets the form with the saved general settings', async () => {
    server.use(
      http.get(`${API}/settings/general`, () =>
        HttpResponse.json({
          data: {
            business: { phone: '3001234567', website: 'https://acme.co' },
            i18n: {},
            industry: { sector: IndustrySector.SALUD },
          },
        }),
      ),
    )

    const { result } = renderHook(() => useCompanyStep(vi.fn()), { wrapper })

    await waitFor(() => expect(result.current.phone).toBe('3001234567'))
    expect(result.current.website).toBe('https://acme.co')
    expect(result.current.sector).toBe(IndustrySector.SALUD)
  })

  it('keeps defaults when the server has no data yet', async () => {
    server.use(
      http.get(`${API}/settings/general`, () =>
        HttpResponse.json({ data: { business: {}, i18n: {}, industry: {} } }),
      ),
    )

    const { result } = renderHook(() => useCompanyStep(vi.fn()), { wrapper })

    await waitFor(() => expect(result.current.sector).toBe(IndustrySector.TECNOLOGIA))
    expect(result.current.phone).toBe('')
  })
})

const EXISTING_PIPELINE = {
  id: 'pipe-1',
  name: 'Ventas Bogotá',
  isDefault: true,
  stages: [
    {
      id: 's2',
      pipelineId: 'pipe-1',
      name: 'Cierre',
      color: '#22c55e',
      probability: 90,
      position: 2,
    },
    {
      id: 's1',
      pipelineId: 'pipe-1',
      name: 'Prospecto',
      color: '#a3e635',
      probability: 20,
      position: 1,
    },
  ],
}

describe('useStepPipeline hydration', () => {
  const EXISTING = EXISTING_PIPELINE

  it('loads the default pipeline sorted by stage position', async () => {
    server.use(http.get(`${API}/settings/pipelines`, () => HttpResponse.json({ data: [EXISTING] })))

    const { result } = renderHook(() => usePipelineStep(vi.fn()), { wrapper })

    await waitFor(() => expect(result.current.pipelineName).toBe('Ventas Bogotá'))
    expect(result.current.stages.map((s) => s.name)).toEqual(['Prospecto', 'Cierre'])
  })

  it('falls back to the first pipeline when none is marked as default', async () => {
    const NO_DEFAULT = { ...EXISTING, isDefault: false }
    server.use(
      http.get(`${API}/settings/pipelines`, () => HttpResponse.json({ data: [NO_DEFAULT] })),
    )

    const { result } = renderHook(() => usePipelineStep(vi.fn()), { wrapper })

    await waitFor(() => expect(result.current.pipelineName).toBe('Ventas Bogotá'))
    expect(result.current.stages.map((s) => s.name)).toEqual(['Prospecto', 'Cierre'])
  })

  it('picks the pipeline actually marked as default, not just the first in the list', async () => {
    const NOT_DEFAULT = { ...EXISTING, id: 'pipe-0', name: 'Other Pipeline', isDefault: false }
    server.use(
      http.get(`${API}/settings/pipelines`, () =>
        HttpResponse.json({ data: [NOT_DEFAULT, EXISTING] }),
      ),
    )

    const { result } = renderHook(() => usePipelineStep(vi.fn()), { wrapper })

    await waitFor(() => expect(result.current.pipelineName).toBe('Ventas Bogotá'))
  })

  it('does not create a duplicate pipeline when saving untouched hydrated data', async () => {
    let created = 0
    const onNext = vi.fn()
    server.use(
      http.get(`${API}/settings/pipelines`, () => HttpResponse.json({ data: [EXISTING] })),
      http.post(`${API}/settings/pipelines`, () => {
        created += 1
        return HttpResponse.json({ data: EXISTING })
      }),
    )

    const { result } = renderHook(() => usePipelineStep(onNext), { wrapper })
    await waitFor(() => expect(result.current.pipelineName).toBe('Ventas Bogotá'))

    result.current.handleSave()

    await waitFor(() => expect(onNext).toHaveBeenCalled())
    expect(created).toBe(0)
  })

  it('creates the pipeline when there is nothing on the server', async () => {
    let created = 0
    const onNext = vi.fn()
    server.use(
      http.get(`${API}/settings/pipelines`, () => HttpResponse.json({ data: [] })),
      http.post(`${API}/settings/pipelines`, () => {
        created += 1
        return HttpResponse.json({ data: EXISTING })
      }),
    )

    const { result } = renderHook(() => usePipelineStep(onNext), { wrapper })
    await waitFor(() => expect(result.current.stages.length).toBeGreaterThan(0))

    result.current.handleSave()

    await waitFor(() => expect(onNext).toHaveBeenCalled())
    expect(created).toBe(1)
  })
})

describe('useStepNomenclature hydration', () => {
  it('merges saved terms over the defaults', async () => {
    server.use(
      http.get(`${API}/settings/nomenclature`, () =>
        HttpResponse.json({
          data: { contact: { singular: 'Paciente', plural: 'Pacientes' } },
        }),
      ),
    )

    const { result } = renderHook(() => useNomenclatureStep(vi.fn()), { wrapper })

    await waitFor(() => expect(result.current.nomen.contact.singular).toBe('Paciente'))
    expect(result.current.nomen.deal.singular).toBe('Negocio')
  })
})

describe('useStepNavigation hydration', () => {
  it('loads saved modules ordered by their stored position', async () => {
    server.use(
      http.get(`${API}/settings/navigation`, () =>
        HttpResponse.json({
          data: {
            modules: [
              {
                key: 'deals',
                label: 'Deals',
                icon: 'handshake',
                enabled: true,
                order: 2,
                customIconUrl: null,
                required: false,
              },
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
          },
        }),
      ),
    )

    const { result } = renderHook(() => useNavigationStep(vi.fn()), { wrapper })

    await waitFor(() => expect(result.current.modules).toHaveLength(2))
    expect(result.current.modules.map((m) => m.key)).toEqual(['dashboard', 'deals'])
  })

  it('keeps the default modules when the server returns none', async () => {
    server.use(
      http.get(`${API}/settings/navigation`, () => HttpResponse.json({ data: { modules: [] } })),
    )

    const { result } = renderHook(() => useNavigationStep(vi.fn()), { wrapper })

    await waitFor(() => expect(result.current.modules.length).toBeGreaterThan(2))
  })
})

describe('useStepCompany', () => {
  function hydratedGeneral() {
    return http.get(`${API}/settings/general`, () =>
      HttpResponse.json({
        data: {
          business: { phone: '3001234567', website: 'https://acme.co' },
          i18n: {},
          industry: { sector: IndustrySector.SALUD },
        },
      }),
    )
  }

  it('starts each field at the module default before hydration resolves', () => {
    server.use(hydratedGeneral())
    const { result } = renderHook(() => useCompanyStep(vi.fn()), { wrapper })

    expect(result.current.phone).toBe('')
    expect(result.current.website).toBe('')
    expect(result.current.sector).toBe(IndustrySector.TECNOLOGIA)
  })

  it('marks the form dirty when a setter runs and clears it on reset', async () => {
    server.use(hydratedGeneral())
    const { result } = renderHook(() => useCompanyStep(vi.fn()), { wrapper })
    await waitFor(() => expect(result.current.phone).toBe('3001234567'))
    expect(result.current.isDirty).toBe(false)

    act(() => result.current.setPhone('3009999999'))
    expect(result.current.phone).toBe('3009999999')
    expect(result.current.isDirty).toBe(true)

    act(() => result.current.setWebsite('https://other.co'))
    expect(result.current.website).toBe('https://other.co')

    act(() => result.current.setSector(IndustrySector.TECNOLOGIA))
    expect(result.current.sector).toBe(IndustrySector.TECNOLOGIA)

    act(() => result.current.handleReset())
    await waitFor(() => expect(result.current.isDirty).toBe(false))
    expect(result.current.phone).toBe('3001234567')
    expect(result.current.sector).toBe(IndustrySector.SALUD)
  })

  it('setWebsite alone marks the form dirty', async () => {
    server.use(hydratedGeneral())
    const { result } = renderHook(() => useCompanyStep(vi.fn()), { wrapper })
    await waitFor(() => expect(result.current.phone).toBe('3001234567'))
    expect(result.current.isDirty).toBe(false)

    act(() => result.current.setWebsite('https://other.co'))

    expect(result.current.isDirty).toBe(true)
  })

  it('setSector alone marks the form dirty', async () => {
    server.use(hydratedGeneral())
    const { result } = renderHook(() => useCompanyStep(vi.fn()), { wrapper })
    await waitFor(() => expect(result.current.phone).toBe('3001234567'))
    expect(result.current.isDirty).toBe(false)

    act(() => result.current.setSector(IndustrySector.TECNOLOGIA))

    expect(result.current.isDirty).toBe(true)
  })

  it('saves the form and advances to the next step', async () => {
    let body: unknown
    server.use(
      hydratedGeneral(),
      http.patch(`${API}/settings/general`, async ({ request }) => {
        body = await request.json()
        return HttpResponse.json({ data: {} })
      }),
    )
    const onNext = vi.fn()
    const { result } = renderHook(() => useCompanyStep(onNext), { wrapper })
    await waitFor(() => expect(result.current.phone).toBe('3001234567'))

    act(() => result.current.setPhone('3009999999'))
    result.current.handleSave()

    await waitFor(() => expect(onNext).toHaveBeenCalledTimes(1))
    expect(body).toMatchObject({
      business: { phone: '3009999999', website: 'https://acme.co' },
    })
  })

  it('does not advance when the API rejects the save', async () => {
    server.use(
      hydratedGeneral(),
      http.patch(`${API}/settings/general`, () =>
        HttpResponse.json(
          {
            statusCode: 400,
            message: 'Invalid phone',
            error: 'Bad Request',
            timestamp: '',
            path: '/settings/general',
            method: 'PATCH',
          },
          { status: 400 },
        ),
      ),
    )
    const onNext = vi.fn()
    const { result } = renderHook(() => useCompanyStep(onNext), { wrapper })
    await waitFor(() => expect(result.current.phone).toBe('3001234567'))

    result.current.handleSave()

    await waitFor(() => expect(sileoError).toHaveBeenCalledTimes(1))
    expect(onNext).not.toHaveBeenCalled()
  })
})

describe('useStepNavigation actions', () => {
  function emptyNavigation() {
    return http.get(`${API}/settings/navigation`, () =>
      HttpResponse.json({ data: { modules: [] } }),
    )
  }

  it('toggles a non-required module and leaves required modules untouched', async () => {
    server.use(emptyNavigation())
    const { result } = renderHook(() => useNavigationStep(vi.fn()), { wrapper })
    await waitFor(() => expect(result.current.modules.length).toBeGreaterThan(0))

    const contactsBefore = result.current.modules.find((m) => m.key === 'contacts')
    expect(contactsBefore?.enabled).toBe(true)

    act(() => result.current.handleToggle('contacts'))
    await waitFor(() =>
      expect(result.current.modules.find((m) => m.key === 'contacts')?.enabled).toBe(false),
    )

    const dashboardBefore = result.current.modules.find((m) => m.key === 'dashboard')
    expect(dashboardBefore?.enabled).toBe(true)

    act(() => result.current.handleToggle('dashboard'))
    expect(result.current.modules.find((m) => m.key === 'dashboard')?.enabled).toBe(true)
  })

  it('ignores toggling an unknown module key', async () => {
    server.use(emptyNavigation())
    const { result } = renderHook(() => useNavigationStep(vi.fn()), { wrapper })
    await waitFor(() => expect(result.current.modules.length).toBeGreaterThan(0))

    const before = result.current.modules.map((m) => m.enabled)
    act(() => result.current.handleToggle('not-a-real-module'))
    expect(result.current.modules.map((m) => m.enabled)).toEqual(before)
  })

  it('reorders two modules within the same group', async () => {
    server.use(emptyNavigation())
    const { result } = renderHook(() => useNavigationStep(vi.fn()), { wrapper })
    await waitFor(() => expect(result.current.modules.length).toBeGreaterThan(0))

    const order = result.current.modules.map((m) => m.key)
    const contactsIndex = order.indexOf('contacts')
    const companiesIndex = order.indexOf('companies')
    expect(contactsIndex).toBeLessThan(companiesIndex)

    act(() => result.current.handleReorder('companies', 'contacts'))

    const nextOrder = result.current.modules.map((m) => m.key)
    expect(nextOrder.indexOf('companies')).toBeLessThan(nextOrder.indexOf('contacts'))
  })

  it('refuses to reorder across different module groups', async () => {
    server.use(emptyNavigation())
    const { result } = renderHook(() => useNavigationStep(vi.fn()), { wrapper })
    await waitFor(() => expect(result.current.modules.length).toBeGreaterThan(0))

    const before = result.current.modules.map((m) => m.key)
    act(() => result.current.handleReorder('dashboard', 'contacts'))
    expect(result.current.modules.map((m) => m.key)).toEqual(before)
  })

  it('is a no-op when reordering a module onto itself or an unknown key', async () => {
    server.use(emptyNavigation())
    const { result } = renderHook(() => useNavigationStep(vi.fn()), { wrapper })
    await waitFor(() => expect(result.current.modules.length).toBeGreaterThan(0))

    const before = result.current.modules.map((m) => m.key)
    act(() => result.current.handleReorder('contacts', 'contacts'))
    expect(result.current.modules.map((m) => m.key)).toEqual(before)

    act(() => result.current.handleReorder('contacts', 'ghost-module'))
    expect(result.current.modules.map((m) => m.key)).toEqual(before)

    act(() => result.current.handleReorder('ghost-module', 'dashboard'))
    expect(result.current.modules.map((m) => m.key)).toEqual(before)
  })

  it('toggles the freshly-reordered module and not a stale index', async () => {
    server.use(emptyNavigation())
    const { result } = renderHook(() => useNavigationStep(vi.fn()), { wrapper })
    await waitFor(() => expect(result.current.modules.length).toBeGreaterThan(0))

    act(() => result.current.handleReorder('companies', 'contacts'))
    const order = result.current.modules.map((m) => m.key)
    expect(order.indexOf('companies')).toBeLessThan(order.indexOf('contacts'))

    act(() => result.current.handleToggle('contacts'))

    expect(result.current.modules.find((m) => m.key === 'contacts')?.enabled).toBe(false)
    expect(result.current.modules.find((m) => m.key === 'companies')?.enabled).toBe(true)
  })

  it('reverts every module back to the hydrated baseline on handleReset', async () => {
    server.use(emptyNavigation())
    const { result } = renderHook(() => useNavigationStep(vi.fn()), { wrapper })
    await waitFor(() => expect(result.current.modules.length).toBeGreaterThan(0))

    act(() => result.current.handleToggle('contacts'))
    expect(result.current.modules.find((m) => m.key === 'contacts')?.enabled).toBe(false)

    act(() => result.current.handleReset())

    await waitFor(() =>
      expect(result.current.modules.find((m) => m.key === 'contacts')?.enabled).toBe(true),
    )
  })

  it('shows an error toast and stays dirty when the API rejects the save', async () => {
    server.use(
      emptyNavigation(),
      http.patch(`${API}/settings/navigation`, () =>
        HttpResponse.json(
          {
            statusCode: 400,
            message: 'invalid modules',
            error: 'Bad Request',
            timestamp: '',
            path: '/settings/navigation',
            method: 'PATCH',
          },
          { status: 400 },
        ),
      ),
    )
    const onNext = vi.fn()
    const { result } = renderHook(() => useNavigationStep(onNext), { wrapper })
    await waitFor(() => expect(result.current.modules.length).toBeGreaterThan(0))

    act(() => result.current.handleToggle('contacts'))
    result.current.handleSave()

    await waitFor(() => expect(sileoError).toHaveBeenCalledTimes(1))
    expect(onNext).not.toHaveBeenCalled()
    expect(result.current.isDirty).toBe(true)
  })

  it('saves with recomputed 1-based order and settles the form as clean', async () => {
    let body: { modules: Array<{ key: string; order: number }> } | undefined
    server.use(
      emptyNavigation(),
      http.patch(`${API}/settings/navigation`, async ({ request }) => {
        body = (await request.json()) as typeof body
        return HttpResponse.json({ data: {} })
      }),
    )
    const { client, Wrapper } = makeWrapper()
    const invalidateSpy = vi.spyOn(client, 'invalidateQueries')
    const onNext = vi.fn()

    const { result } = renderHook(() => useNavigationStep(onNext), { wrapper: Wrapper })
    await waitFor(() => expect(result.current.modules.length).toBeGreaterThan(0))

    act(() => result.current.handleReorder('companies', 'contacts'))
    expect(result.current.isDirty).toBe(true)

    result.current.handleSave()

    await waitFor(() => expect(onNext).toHaveBeenCalledTimes(1))
    expect(body?.modules[0]).toMatchObject({ order: 1 })
    expect(body?.modules.map((m) => m.order)).toEqual(body?.modules.map((_, i) => i + 1))
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: QUERY_KEYS.settings.navigation })
    await waitFor(() => expect(result.current.isDirty).toBe(false))
  })
})

describe('useStepNomenclature actions', () => {
  function hydratedNomenclature() {
    return http.get(`${API}/settings/nomenclature`, () =>
      HttpResponse.json({ data: { contact: { singular: 'Paciente', plural: 'Pacientes' } } }),
    )
  }

  it('starts from the localized defaults before hydration resolves', () => {
    server.use(hydratedNomenclature())
    const { result } = renderHook(() => useNomenclatureStep(vi.fn()), { wrapper })

    expect(result.current.nomen.contact.singular).toBe('Contacto')
    expect(result.current.nomen.deal.singular).toBe('Negocio')
  })

  it('updates a single term field and marks the form dirty', async () => {
    server.use(hydratedNomenclature())
    const { result } = renderHook(() => useNomenclatureStep(vi.fn()), { wrapper })
    await waitFor(() => expect(result.current.nomen.contact.singular).toBe('Paciente'))
    expect(result.current.isDirty).toBe(false)

    act(() => result.current.handleUpdate('company', 'singular', 'Clínica'))

    expect(result.current.nomen.company.singular).toBe('Clínica')
    expect(result.current.isDirty).toBe(true)
  })

  it('applies a known preset and ignores an unknown preset key', async () => {
    server.use(hydratedNomenclature())
    const { result } = renderHook(() => useNomenclatureStep(vi.fn()), { wrapper })
    await waitFor(() => expect(result.current.nomen.contact.singular).toBe('Paciente'))
    expect(result.current.isDirty).toBe(false)

    act(() => result.current.handlePreset('b2b'))
    expect(result.current.nomen.contact.singular).toBe('Lead')
    expect(result.current.nomen.deal.singular).toBe('Oportunidad')
    expect(result.current.isDirty).toBe(true)

    act(() => result.current.handlePreset('not-a-preset'))
    expect(result.current.nomen.contact.singular).toBe('Lead')
  })

  it('reverts every term back to the hydrated baseline on handleReset', async () => {
    server.use(hydratedNomenclature())
    const { result } = renderHook(() => useNomenclatureStep(vi.fn()), { wrapper })
    await waitFor(() => expect(result.current.nomen.contact.singular).toBe('Paciente'))

    act(() => result.current.handleUpdate('company', 'singular', 'Clínica'))
    expect(result.current.nomen.company.singular).toBe('Clínica')

    act(() => result.current.handleReset())

    await waitFor(() => expect(result.current.isDirty).toBe(false))
    expect(result.current.nomen.company.singular).toBe('Empresa')
  })

  it('shows an error toast and does not advance when the API rejects the save', async () => {
    server.use(
      hydratedNomenclature(),
      http.patch(`${API}/settings/nomenclature`, () =>
        HttpResponse.json(
          {
            statusCode: 400,
            message: 'invalid nomenclature',
            error: 'Bad Request',
            timestamp: '',
            path: '/settings/nomenclature',
            method: 'PATCH',
          },
          { status: 400 },
        ),
      ),
    )
    const onNext = vi.fn()
    const { result } = renderHook(() => useNomenclatureStep(onNext), { wrapper })
    await waitFor(() => expect(result.current.nomen.contact.singular).toBe('Paciente'))

    result.current.handleSave()

    await waitFor(() => expect(sileoError).toHaveBeenCalledTimes(1))
    expect(onNext).not.toHaveBeenCalled()
  })

  it('saves the nomenclature and settles the form as clean', async () => {
    let body: unknown
    server.use(
      hydratedNomenclature(),
      http.patch(`${API}/settings/nomenclature`, async ({ request }) => {
        body = await request.json()
        return HttpResponse.json({ data: {} })
      }),
    )
    const { client, Wrapper } = makeWrapper()
    const invalidateSpy = vi.spyOn(client, 'invalidateQueries')
    const onNext = vi.fn()

    const { result } = renderHook(() => useNomenclatureStep(onNext), { wrapper: Wrapper })
    await waitFor(() => expect(result.current.nomen.contact.singular).toBe('Paciente'))

    act(() => result.current.handleUpdate('company', 'plural', 'Cuentas'))
    result.current.handleSave()

    await waitFor(() => expect(onNext).toHaveBeenCalledTimes(1))
    expect(body).toMatchObject({ company: { plural: 'Cuentas' } })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: QUERY_KEYS.settings.nomenclature })
    await waitFor(() => expect(result.current.isDirty).toBe(false))
  })
})

describe('useStepPipeline actions', () => {
  function emptyPipelines() {
    return http.get(`${API}/settings/pipelines`, () => HttpResponse.json({ data: [] }))
  }

  it('adds a new stage with the default shape', async () => {
    server.use(emptyPipelines())
    const { result } = renderHook(() => usePipelineStep(vi.fn()), { wrapper })
    await waitFor(() => expect(result.current.stages.length).toBeGreaterThan(0))

    const before = result.current.stages.length
    act(() => result.current.handleAddStage())

    expect(result.current.stages).toHaveLength(before + 1)
    const added = result.current.stages.at(-1)
    expect(added).toMatchObject({
      name: 'New Stage',
      color: TAXONOMY_COLOR_PALETTE[9],
      probability: 50,
    })
  })

  it('removes a stage by id and ignores an unknown id', async () => {
    server.use(emptyPipelines())
    const { result } = renderHook(() => usePipelineStep(vi.fn()), { wrapper })
    await waitFor(() => expect(result.current.stages.length).toBeGreaterThan(0))

    const before = result.current.stages.length
    act(() => result.current.handleRemoveStage('not-a-real-id'))
    expect(result.current.stages).toHaveLength(before)

    const targetId = result.current.stages[0]?.id
    if (!targetId) throw new Error('missing stage id')
    act(() => result.current.handleRemoveStage(targetId))
    expect(result.current.stages).toHaveLength(before - 1)
  })

  it('patches only the provided stage fields', async () => {
    server.use(emptyPipelines())
    const { result } = renderHook(() => usePipelineStep(vi.fn()), { wrapper })
    await waitFor(() => expect(result.current.stages.length).toBeGreaterThan(0))

    const stage = result.current.stages[0]
    if (!stage) throw new Error('missing stage')

    act(() => result.current.handleUpdateStage(stage.id, { name: 'Renamed' }))
    expect(result.current.stages[0]).toMatchObject({
      name: 'Renamed',
      color: stage.color,
      probability: stage.probability,
    })

    act(() => result.current.handleUpdateStage(stage.id, { color: '#010101' }))
    expect(result.current.stages[0]).toMatchObject({ name: 'Renamed', color: '#010101' })

    act(() => result.current.handleUpdateStage(stage.id, { probability: 77 }))
    expect(result.current.stages[0]).toMatchObject({
      name: 'Renamed',
      color: '#010101',
      probability: 77,
    })

    act(() => result.current.handleUpdateStage('not-a-real-id', { name: 'Ghost' }))
    expect(result.current.stages[0]?.name).toBe('Renamed')
  })

  it('marks the hydrated pipeline dirty so a name/color/probability patch alone triggers a save', async () => {
    for (const patch of [{ name: 'X' }, { color: '#010101' }, { probability: 3 }] as const) {
      let saved = 0
      server.use(
        http.get(`${API}/settings/pipelines`, () =>
          HttpResponse.json({ data: [EXISTING_PIPELINE] }),
        ),
        http.post(`${API}/settings/pipelines`, () => {
          saved += 1
          return HttpResponse.json({ data: EXISTING_PIPELINE })
        }),
      )
      const onNext = vi.fn()
      const { result } = renderHook(() => usePipelineStep(onNext), { wrapper })
      await waitFor(() => expect(result.current.pipelineName).toBe('Ventas Bogotá'))

      const stage = result.current.stages[0]
      if (!stage) throw new Error('missing stage')
      act(() => result.current.handleUpdateStage(stage.id, patch))

      result.current.handleSave()

      await waitFor(() => expect(onNext).toHaveBeenCalledTimes(1))
      expect(saved).toBe(1)
    }
  })

  it('updates the correct stage by id after the fields array has been reordered', async () => {
    server.use(emptyPipelines())
    const { result } = renderHook(() => usePipelineStep(vi.fn()), { wrapper })
    await waitFor(() => expect(result.current.stages.length).toBeGreaterThan(0))

    const [first, second] = result.current.stages
    if (!first || !second) throw new Error('need two stages')

    act(() => result.current.handleReorderStages(second.id, first.id))
    expect(result.current.stages[0]?.id).toBe(second.id)

    act(() => result.current.handleUpdateStage(first.id, { name: 'Renamed First' }))

    const renamed = result.current.stages.find((s) => s.id === first.id)
    expect(renamed?.name).toBe('Renamed First')
    const other = result.current.stages.find((s) => s.id === second.id)
    expect(other?.name).not.toBe('Renamed First')
  })

  it('reorders stages by id and ignores an unknown id', async () => {
    server.use(emptyPipelines())
    const { result } = renderHook(() => usePipelineStep(vi.fn()), { wrapper })
    await waitFor(() => expect(result.current.stages.length).toBeGreaterThan(0))

    const [first, second] = result.current.stages
    if (!first || !second) throw new Error('need two stages')

    act(() => result.current.handleReorderStages(second.id, first.id))
    expect(result.current.stages[0]?.id).toBe(second.id)

    const before = result.current.stages.map((s) => s.id)
    act(() => result.current.handleReorderStages(first.id, first.id))
    expect(result.current.stages.map((s) => s.id)).toEqual(before)

    act(() => result.current.handleReorderStages('not-a-real-id', first.id))
    expect(result.current.stages.map((s) => s.id)).toEqual(before)

    act(() => result.current.handleReorderStages(first.id, 'not-a-real-id'))
    expect(result.current.stages.map((s) => s.id)).toEqual(before)
  })

  it('moves the stage that starts at index 0', async () => {
    server.use(emptyPipelines())
    const { result } = renderHook(() => usePipelineStep(vi.fn()), { wrapper })
    await waitFor(() => expect(result.current.stages.length).toBeGreaterThan(0))

    const [first, second] = result.current.stages
    if (!first || !second) throw new Error('need two stages')

    act(() => result.current.handleReorderStages(first.id, second.id))

    expect(result.current.stages[0]?.id).toBe(second.id)
    expect(result.current.stages[1]?.id).toBe(first.id)
  })

  it('renames the pipeline through setPipelineName', async () => {
    server.use(emptyPipelines())
    const { result } = renderHook(() => usePipelineStep(vi.fn()), { wrapper })
    await waitFor(() => expect(result.current.stages.length).toBeGreaterThan(0))

    act(() => result.current.setPipelineName('Pipeline Bogotá'))
    expect(result.current.pipelineName).toBe('Pipeline Bogotá')
  })

  it('shows a pipeline-specific error toast when creation fails', async () => {
    server.use(
      emptyPipelines(),
      http.post(`${API}/settings/pipelines`, () =>
        HttpResponse.json(
          {
            statusCode: 422,
            message: 'invalid stages',
            error: 'Unprocessable Entity',
            timestamp: '',
            path: '/settings/pipelines',
            method: 'POST',
          },
          { status: 422 },
        ),
      ),
    )
    const onNext = vi.fn()
    const { result } = renderHook(() => usePipelineStep(onNext), { wrapper })
    await waitFor(() => expect(result.current.stages.length).toBeGreaterThan(0))

    result.current.handleSave()

    await waitFor(() => expect(sileoError).toHaveBeenCalledTimes(1))
    expect(sileoError).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'auth.toasts.pipelineFailed' }),
    )
    expect(onNext).not.toHaveBeenCalled()
  })
})
