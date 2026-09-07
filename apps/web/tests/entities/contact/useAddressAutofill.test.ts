import { renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { useAddressAutofill } from '@/entities/contact/model/useAddressAutofill'

const resolve = vi.fn()

vi.mock('@/entities/geo', () => ({
  useResolveMunicipality: () => resolve,
}))

describe('useAddressAutofill', () => {
  it('hands back city and municipio code together when the place resolves', async () => {
    resolve.mockResolvedValueOnce({ name: 'Medellín', code: '05001', department: 'Antioquia' })
    const onResolved = vi.fn()
    const { result } = renderHook(() => useAddressAutofill(onResolved))

    result.current('Medellín, Antioquia')

    await waitFor(() => expect(onResolved).toHaveBeenCalledOnce())
    expect(onResolved).toHaveBeenCalledWith({ name: 'Medellín', code: '05001' })
  })

  it('does nothing when no municipality matches', async () => {
    resolve.mockResolvedValueOnce(null)
    const onResolved = vi.fn()
    const { result } = renderHook(() => useAddressAutofill(onResolved))

    result.current('Nowhere')

    await new Promise((tick) => setTimeout(tick, 0))
    expect(onResolved).not.toHaveBeenCalled()
  })
})
