import { renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { useAddressAutofill } from '@/features/create-contact/model/useAddressAutofill'

const resolve = vi.fn()

vi.mock('@/entities/geo', () => ({
  useResolveMunicipality: () => resolve,
}))

describe('useAddressAutofill', () => {
  it('fills city and municipio code when the place resolves', async () => {
    resolve.mockResolvedValueOnce({ name: 'Medellín', code: '05001' })
    const setValue = vi.fn()
    const { result } = renderHook(() => useAddressAutofill(setValue))

    result.current('Medellín, Antioquia')

    await waitFor(() => expect(setValue).toHaveBeenCalledTimes(2))
    expect(setValue).toHaveBeenCalledWith('city', 'Medellín', { shouldDirty: true })
    expect(setValue).toHaveBeenCalledWith('municipioCode', '05001', { shouldDirty: true })
  })

  it('does nothing when no municipality matches', async () => {
    resolve.mockResolvedValueOnce(null)
    const setValue = vi.fn()
    const { result } = renderHook(() => useAddressAutofill(setValue))

    result.current('Nowhere')

    await new Promise((tick) => setTimeout(tick, 0))
    expect(setValue).not.toHaveBeenCalled()
  })
})
