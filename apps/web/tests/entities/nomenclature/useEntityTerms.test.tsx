import { renderHook, waitFor } from '@testing-library/react'
import { HttpResponse, http } from 'msw'
import { describe, expect, it, vi } from 'vitest'

import { API, createMswServer } from '../../msw/test-server'
import { queryWrapper as wrapper } from '../../query-wrapper'

import { useEntityTerms } from '@/entities/nomenclature'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => (key === 'entities.contact.singular' ? 'Contacto' : 'Contactos'),
  }),
}))

const server = createMswServer()

function nomenclatureHandler() {
  return http.get(`${API}/settings/nomenclature`, () =>
    HttpResponse.json({
      data: {
        contact: { singular: 'Paciente', plural: 'Pacientes' },
        company: { singular: 'Clínica', plural: 'Clínicas' },
        deal: { singular: 'Cita', plural: 'Citas' },
        activity: { singular: 'Actividad', plural: 'Actividades' },
      },
    }),
  )
}

describe('useEntityTerms', () => {
  it('exposes tenant labels in both cases once nomenclature loads', async () => {
    server.use(nomenclatureHandler())

    const { result } = renderHook(() => useEntityTerms('contact'), { wrapper })

    await waitFor(() => expect(result.current.singular).toBe('Paciente'))
    expect(result.current.plural).toBe('Pacientes')
    expect(result.current.lowerSingular).toBe('paciente')
    expect(result.current.lowerPlural).toBe('pacientes')
  })

  it('falls back to the i18n entity labels before nomenclature resolves', () => {
    server.use(nomenclatureHandler())

    const { result } = renderHook(() => useEntityTerms('contact'), { wrapper })

    expect(result.current.singular).toBe('Contacto')
    expect(result.current.lowerPlural).toBe('contactos')
  })
})
