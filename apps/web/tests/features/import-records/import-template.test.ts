import { describe, expect, it } from 'vitest'

import { CONTACT_DESCRIPTOR } from '@/entities/contact/config/contact-descriptor.constants'
import {
  buildCsvTemplate,
  templateEntitiesSlug,
} from '@/features/import-records/lib/import-template'

const TEMPLATE = CONTACT_DESCRIPTOR.imports!.template

describe('buildCsvTemplate', () => {
  it('ships the object header row the importer can map on its own', () => {
    const [header] = buildCsvTemplate(TEMPLATE).split('\n')

    expect(header).toContain('Nombre')
    expect(header).toContain('Correo')
    expect(header).toContain('Etiquetas')
  })

  it('includes one filled example row so the format is obvious', () => {
    const [header, sample] = buildCsvTemplate(TEMPLATE).split('\n')

    expect(sample?.split(',')).toHaveLength(header?.split(',').length ?? 0)
  })
})

describe('templateEntitiesSlug', () => {
  it('normalizes accents and spaces into a hyphen slug', () => {
    expect(templateEntitiesSlug('órdenes de servicio')).toBe('ordenes-de-servicio')
  })

  it('keeps a simple plural untouched', () => {
    expect(templateEntitiesSlug('pacientes')).toBe('pacientes')
  })
})
