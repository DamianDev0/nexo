import { companySearchLabel } from '@/entities/company'

import type { CompanyListItem } from '@repo/shared-types'

export function matchesCompanyTerm(company: CompanyListItem, term: string): boolean {
  const needle = term.trim().toLowerCase()
  if (needle === '') return true
  return companySearchLabel(company).toLowerCase().includes(needle)
}

export function pickCompany(
  companies: ReadonlyArray<CompanyListItem>,
  companyId: string,
): CompanyListItem | null {
  return companies.find((company) => company.id === companyId) ?? null
}
