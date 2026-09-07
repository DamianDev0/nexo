import { renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { buildContact } from '../../msw/handlers'
import { queryWrapper as wrapper } from '../../query-wrapper'

import type { ContactTaxonomyMaps } from '@/entities/contact'

import { useContactRecord } from '@/features/preview-contact/model/useContactRecord'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'es' } }),
}))

vi.mock('@/entities/nomenclature', () => ({
  useEntityTerms: () => ({
    singular: 'Contacto',
    plural: 'Contactos',
    lowerSingular: 'contacto',
    lowerPlural: 'contactos',
  }),
}))

const TAXONOMY: ContactTaxonomyMaps = {
  statusByKey: new Map([['new', { key: 'new', label: 'Nuevo', color: '#3B82F6' }]]),
  sourceByKey: new Map(),
  lifecycleByKey: new Map(),
}

describe('useContactRecord', () => {
  it('derives the identity, rows, status and quick actions', () => {
    const contact = buildContact({ firstName: 'Ana', lastName: 'Guerrero', tags: ['VIP'] })
    const { result } = renderHook(
      () => useContactRecord({ contact, taxonomy: TAXONOMY, actions: { onOpen: vi.fn() } }),
      { wrapper },
    )
    expect(result.current.name).toBe('Ana Guerrero')
    expect(result.current.entityTitle).toBe('Contacto')
    expect(result.current.status.label).toBe('Nuevo')
    expect(result.current.status.sinceLabel).not.toBeNull()
    expect(result.current.rows.map((row) => row.key)).toContain('email')
    expect(result.current.quickActions.items).toHaveLength(7)
  })

  it('only offers section actions that have a handler', () => {
    const onAddNote = vi.fn()
    const contact = buildContact()
    const { result } = renderHook(
      () => useContactRecord({ contact, taxonomy: TAXONOMY, actions: { onAddNote } }),
      { wrapper },
    )
    expect(result.current.add.note).toBeDefined()
    expect(result.current.add.task).toBeUndefined()
    expect(result.current.add.tags).toBeUndefined()

    result.current.add.note?.onClick()
    expect(onAddNote).toHaveBeenCalledWith(contact)
  })
})
