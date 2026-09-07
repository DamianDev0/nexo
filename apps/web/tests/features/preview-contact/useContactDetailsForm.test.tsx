import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { buildContact } from '../../msw/handlers'

import { useContactDetailsForm } from '@/features/preview-contact/model/useContactDetailsForm'

vi.mock('@/entities/geo', () => ({ useResolveMunicipality: () => vi.fn() }))

describe('useContactDetailsForm', () => {
  it('exposes the missing required fields and read-only mode without savers', () => {
    const { result } = renderHook(() =>
      useContactDetailsForm(buildContact({ email: null, documentNumber: null })),
    )
    expect([...result.current.missing]).toEqual(['email', 'documentNumber'])
    expect(result.current.readOnly).toBe(true)
  })

  it('saves a changed, valid column on commit', async () => {
    const fields = vi.fn()
    const contact = buildContact({ city: 'Bogota' })
    const { result } = renderHook(() => useContactDetailsForm(contact, { fields }))
    act(() => result.current.form.setValue('lastName', 'Gómez'))
    await act(() => result.current.commit('lastName'))
    expect(fields).toHaveBeenCalledWith(contact.id, { lastName: 'Gómez' })
  })

  it('normalises phones before saving', async () => {
    const fields = vi.fn()
    const contact = buildContact({ phone: null })
    const { result } = renderHook(() => useContactDetailsForm(contact, { fields }))
    act(() => result.current.form.setValue('phone', '+57 300 123 4567'))
    await act(() => result.current.commit('phone'))
    expect(fields).toHaveBeenCalledWith(contact.id, { phone: '3001234567' })
  })

  it('saves city and municipality code together when a municipality is picked', async () => {
    const fields = vi.fn()
    const contact = buildContact({ city: 'Bogota', municipioCode: '11001' })
    const { result } = renderHook(() => useContactDetailsForm(contact, { fields }))
    await act(() => result.current.selectCity({ name: 'Cali', code: '76001' }))
    expect(fields).toHaveBeenCalledWith(contact.id, { city: 'Cali', municipioCode: '76001' })
  })

  it('routes the address through the custom fields saver', async () => {
    const customFields = vi.fn()
    const contact = buildContact({ customFields: { role: 'CEO' } })
    const { result } = renderHook(() => useContactDetailsForm(contact, { customFields }))
    act(() => result.current.form.setValue('address', 'Cl 100 #7-21'))
    await act(() => result.current.commit('address'))
    expect(customFields).toHaveBeenCalledWith(contact.id, { role: 'CEO', address: 'Cl 100 #7-21' })
  })

  it('does not save unchanged or invalid values', async () => {
    const fields = vi.fn()
    const contact = buildContact({ email: 'maria@nexo.test' })
    const { result } = renderHook(() => useContactDetailsForm(contact, { fields }))
    await act(() => result.current.commit('email'))
    act(() => result.current.form.setValue('email', 'nope'))
    await act(() => result.current.commit('email'))
    expect(fields).not.toHaveBeenCalled()
    expect(await act(() => result.current.form.trigger('email'))).toBe(false)
  })
})

describe('useContactDetailsForm — independent field commits', () => {
  it('still saves a valid field while another field is invalid', async () => {
    const fields = vi.fn()
    const contact = buildContact()
    const { result } = renderHook(() => useContactDetailsForm(contact, { fields }))
    act(() => {
      result.current.form.setValue('firstName', '')
      result.current.form.setValue('lastName', 'Pérez')
    })
    await act(() => result.current.commit('lastName'))
    expect(fields).toHaveBeenCalledWith(contact.id, { lastName: 'Pérez' })
  })

  it('autofills and saves city with its code after picking an address', async () => {
    const fields = vi.fn()
    const contact = buildContact({ city: 'Bogota', municipioCode: '11001' })
    const { result } = renderHook(() => useContactDetailsForm(contact, { fields }))
    await act(() => result.current.selectCity({ name: 'Medellín', code: '05001' }))
    expect(fields).toHaveBeenCalledWith(contact.id, { city: 'Medellín', municipioCode: '05001' })
  })
})
