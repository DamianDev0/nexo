import { describe, expect, it } from 'vitest'

import { DEFAULT_NOMENCLATURE } from '@/features/setup-workspace/config/nomenclature.constants'
import {
  buildDefaultNomenclature,
  isSeedNomenclature,
} from '@/features/setup-workspace/lib/nomenclature'

describe('isSeedNomenclature', () => {
  it('recognizes the default English seed', () => {
    expect(isSeedNomenclature(DEFAULT_NOMENCLATURE)).toBe(true)
  })

  it('recognizes the Spanish seed', () => {
    expect(
      isSeedNomenclature({
        contact: { singular: 'Contacto', plural: 'Contactos' },
        company: { singular: 'Empresa', plural: 'Empresas' },
        deal: { singular: 'Negocio', plural: 'Negocios' },
        activity: { singular: 'Actividad', plural: 'Actividades' },
      }),
    ).toBe(true)
  })

  it('rejects a custom, non-seed nomenclature', () => {
    expect(
      isSeedNomenclature({
        contact: { singular: 'Paciente', plural: 'Pacientes' },
        company: { singular: 'Clinica', plural: 'Clinicas' },
        deal: { singular: 'Tratamiento', plural: 'Tratamientos' },
        activity: { singular: 'Cita', plural: 'Citas' },
      }),
    ).toBe(false)
  })
})

const SCOPE = 'onboarding.steps.nomenclature.defaults'

describe('buildDefaultNomenclature', () => {
  it('uses the translated term for every entity when a translation exists', () => {
    const dict: Record<string, string> = {
      [`${SCOPE}.contact`]: 'Cliente',
      [`${SCOPE}.contacts`]: 'Clientes',
      [`${SCOPE}.company`]: 'Empresa',
      [`${SCOPE}.companies`]: 'Empresas',
      [`${SCOPE}.deal`]: 'Negocio',
      [`${SCOPE}.deals`]: 'Negocios',
      [`${SCOPE}.activity`]: 'Actividad',
      [`${SCOPE}.activities`]: 'Actividades',
    }

    const result = buildDefaultNomenclature((key) => dict[key])

    expect(result).toEqual({
      contact: { singular: 'Cliente', plural: 'Clientes' },
      company: { singular: 'Empresa', plural: 'Empresas' },
      deal: { singular: 'Negocio', plural: 'Negocios' },
      activity: { singular: 'Actividad', plural: 'Actividades' },
    })
  })

  it('falls back to the hardcoded defaults when the translation is missing', () => {
    const result = buildDefaultNomenclature(() => undefined)

    expect(result).toEqual(DEFAULT_NOMENCLATURE)
  })

  it('falls back to the hardcoded defaults when i18next echoes the untranslated key', () => {
    const result = buildDefaultNomenclature((key) => key)

    expect(result).toEqual(DEFAULT_NOMENCLATURE)
  })
})
