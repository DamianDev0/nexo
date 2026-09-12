import { describe, expect, it } from 'vitest'

import {
  companyMetaLine,
  companyNitLabel,
  companySearchLabel,
  otherCompanyContacts,
} from '@/entities/company/lib/company-display'

const ACME = {
  name: 'Acme SAS',
  nit: '900123456',
  nitDv: '7',
  nitFormatted: null,
  city: 'Bogotá',
}

describe('companyNitLabel', () => {
  it('prefers the formatted NIT the backend already built', () => {
    expect(companyNitLabel({ ...ACME, nitFormatted: '900.123.456-7' })).toBe('900.123.456-7')
  })

  it('joins the NIT with its check digit when there is no formatted one', () => {
    expect(companyNitLabel(ACME)).toBe('900123456-7')
  })

  it('falls back to the bare NIT and then to nothing', () => {
    expect(companyNitLabel({ ...ACME, nitDv: null })).toBe('900123456')
    expect(companyNitLabel({ nit: null, nitDv: null, nitFormatted: null })).toBeNull()
  })
})

describe('companyMetaLine', () => {
  it('reads NIT and city as one line', () => {
    expect(companyMetaLine(ACME)).toBe('900123456-7 · Bogotá')
  })

  it('drops what the company does not have', () => {
    expect(companyMetaLine({ ...ACME, city: null })).toBe('900123456-7')
    expect(companyMetaLine({ ...ACME, nit: null, nitDv: null, city: null })).toBeNull()
  })
})

describe('companySearchLabel', () => {
  it('names the company and its NIT so two "Acme" rows can be told apart', () => {
    expect(companySearchLabel(ACME)).toBe('Acme SAS — 900123456-7')
    expect(companySearchLabel({ ...ACME, nit: null, nitDv: null })).toBe('Acme SAS')
  })
})

describe('otherCompanyContacts', () => {
  it('leaves the contact being read out of its own colleague list', () => {
    const contacts = [{ id: 'a' }, { id: 'b' }, { id: 'c' }]

    expect(otherCompanyContacts(contacts, 'b').map((c) => c.id)).toEqual(['a', 'c'])
    expect(otherCompanyContacts(contacts, 'z')).toHaveLength(3)
  })
})
