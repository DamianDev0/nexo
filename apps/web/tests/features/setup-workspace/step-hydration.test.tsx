import { IndustrySector } from '@repo/shared-types'
import { renderHook, waitFor } from '@testing-library/react'
import { HttpResponse, http } from 'msw'
import { describe, expect, it, vi } from 'vitest'

import { API, createMswServer } from '../../msw/test-server'
import { queryWrapper as wrapper } from '../../query-wrapper'

import { useStepCompany } from '@/features/setup-workspace/model/useStepCompany'
import { useStepNavigation } from '@/features/setup-workspace/model/useStepNavigation'
import { useStepNomenclature } from '@/features/setup-workspace/model/useStepNomenclature'
import { useStepPipeline } from '@/features/setup-workspace/model/useStepPipeline'

vi.mock('server-only', () => ({}))
vi.mock('next/cache', () => ({ updateTag: vi.fn() }))
vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({ toString: (): string => '' })),
}))

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

    const { result } = renderHook(() => useStepCompany(vi.fn()), { wrapper })

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

    const { result } = renderHook(() => useStepCompany(vi.fn()), { wrapper })

    await waitFor(() => expect(result.current.sector).toBe(IndustrySector.TECNOLOGIA))
    expect(result.current.phone).toBe('')
  })
})

describe('useStepPipeline hydration', () => {
  const EXISTING = {
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

  it('loads the default pipeline sorted by stage position', async () => {
    server.use(http.get(`${API}/settings/pipelines`, () => HttpResponse.json({ data: [EXISTING] })))

    const { result } = renderHook(() => useStepPipeline(vi.fn()), { wrapper })

    await waitFor(() => expect(result.current.pipelineName).toBe('Ventas Bogotá'))
    expect(result.current.stages.map((s) => s.name)).toEqual(['Prospecto', 'Cierre'])
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

    const { result } = renderHook(() => useStepPipeline(onNext), { wrapper })
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

    const { result } = renderHook(() => useStepPipeline(onNext), { wrapper })
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

    const { result } = renderHook(() => useStepNomenclature(vi.fn()), { wrapper })

    await waitFor(() => expect(result.current.nomen.contact.singular).toBe('Paciente'))
    expect(result.current.nomen.deal.singular).toBe('Deal')
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

    const { result } = renderHook(() => useStepNavigation(vi.fn()), { wrapper })

    await waitFor(() => expect(result.current.modules).toHaveLength(2))
    expect(result.current.modules.map((m) => m.key)).toEqual(['dashboard', 'deals'])
  })

  it('keeps the default modules when the server returns none', async () => {
    server.use(
      http.get(`${API}/settings/navigation`, () => HttpResponse.json({ data: { modules: [] } })),
    )

    const { result } = renderHook(() => useStepNavigation(vi.fn()), { wrapper })

    await waitFor(() => expect(result.current.modules.length).toBeGreaterThan(2))
  })
})
