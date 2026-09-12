import { describe, expect, it } from 'vitest'

import type { CompanyListItem } from '@repo/shared-types'

import {
  matchesCompanyTerm,
  pickCompany,
} from '@/features/link-contact-company/lib/company-options'

function company(overrides: Partial<CompanyListItem>): CompanyListItem {
  return {
    name: 'Acme SAS',
    nit: '900123456',
    nitDv: '7',
    nitFormatted: null,
    city: 'Bogotá',
    id: 'c1',
    ...overrides,
  } as CompanyListItem
}

describe('matchesCompanyTerm', () => {
  it('matches on the name', () => {
    expect(matchesCompanyTerm(company({}), 'acme')).toBe(true)
    expect(matchesCompanyTerm(company({}), 'globex')).toBe(false)
  })

  it('matches on the NIT, which is how people search a company here', () => {
    expect(matchesCompanyTerm(company({}), '900123')).toBe(true)
  })

  it('shows everything for an empty term', () => {
    expect(matchesCompanyTerm(company({}), '   ')).toBe(true)
  })
})

describe('pickCompany', () => {
  it('finds the company the picker returned', () => {
    const rows = [company({ id: 'a' }), company({ id: 'b', name: 'Globex' })]

    expect(pickCompany(rows, 'b')?.name).toBe('Globex')
    expect(pickCompany(rows, 'zzz')).toBeNull()
  })
})
