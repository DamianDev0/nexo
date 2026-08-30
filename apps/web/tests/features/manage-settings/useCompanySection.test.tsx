import { IndustrySector } from '@repo/shared-types'
import { act, renderHook, waitFor } from '@testing-library/react'
import { HttpResponse, http } from 'msw'
import { describe, expect, it, vi } from 'vitest'

import { API, createMswServer } from '../../msw/test-server'
import { queryWrapper as wrapper } from '../../query-wrapper'

import { useCompanySection } from '@/features/manage-settings/model/useCompanySection'

vi.mock('server-only', () => ({}))
vi.mock('i18next', () => ({ t: (key: string) => key }))
vi.mock('sileo', () => ({ sileo: { error: vi.fn(), success: vi.fn() } }))

const { saveGeneralAction } = vi.hoisted(() => ({
  saveGeneralAction: vi.fn(async () => ({ ok: true as const, data: {} })),
}))

vi.mock('@/features/setup-workspace/api/setup-steps.actions', () => ({ saveGeneralAction }))

const server = createMswServer()

function generalHandler() {
  return http.get(`${API}/settings/general`, () =>
    HttpResponse.json({
      data: {
        id: 't1',
        name: 'Acme',
        slug: 'acme',
        plan: 'free',
        business: { phone: '601', website: '' },
        i18n: {},
        billing: {},
        industry: { sector: 'tecnologia' },
      },
    }),
  )
}

describe('useCompanySection', () => {
  it('saves directly when the sector was not changed', async () => {
    server.use(generalHandler())
    const { result } = renderHook(() => useCompanySection(vi.fn()), { wrapper })

    act(() => result.current.bindField('phone')('602 000 0000'))
    act(() => result.current.handleSave())

    await waitFor(() => expect(saveGeneralAction).toHaveBeenCalledTimes(1))
    expect(result.current.sectorConfirm.open).toBe(false)
  })

  it('intercepts save with a confirm dialog when the sector changed', async () => {
    server.use(generalHandler())
    const { result } = renderHook(() => useCompanySection(vi.fn()), { wrapper })
    saveGeneralAction.mockClear()

    act(() => result.current.bindField('sector')(IndustrySector.SALUD))
    act(() => result.current.handleSave())

    expect(result.current.sectorConfirm.open).toBe(true)
    expect(saveGeneralAction).not.toHaveBeenCalled()

    act(() => result.current.sectorConfirm.confirm())

    await waitFor(() => expect(saveGeneralAction).toHaveBeenCalledTimes(1))
    expect(result.current.sectorConfirm.open).toBe(false)
  })

  it('aborts the save when the confirm dialog is cancelled', async () => {
    server.use(generalHandler())
    const { result } = renderHook(() => useCompanySection(vi.fn()), { wrapper })
    saveGeneralAction.mockClear()

    act(() => result.current.bindField('sector')(IndustrySector.SALUD))
    act(() => result.current.handleSave())
    act(() => result.current.sectorConfirm.cancel())

    expect(result.current.sectorConfirm.open).toBe(false)
    expect(saveGeneralAction).not.toHaveBeenCalled()
  })
})
