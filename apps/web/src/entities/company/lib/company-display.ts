import type { CompanyListItem } from '@repo/shared-types'

type CompanyLike = Pick<CompanyListItem, 'name' | 'nit' | 'nitDv' | 'nitFormatted' | 'city'>

export function companyNitLabel(
  company: Pick<CompanyLike, 'nit' | 'nitDv' | 'nitFormatted'>,
): string | null {
  if (company.nitFormatted) return company.nitFormatted
  if (!company.nit) return null
  return company.nitDv ? `${company.nit}-${company.nitDv}` : company.nit
}

export function companyMetaLine(company: CompanyLike): string | null {
  const parts = [companyNitLabel(company), company.city].filter((part): part is string =>
    Boolean(part),
  )
  return parts.length > 0 ? parts.join(' · ') : null
}

export function companySearchLabel(company: CompanyLike): string {
  const nit = companyNitLabel(company)
  return nit ? `${company.name} — ${nit}` : company.name
}

export function otherCompanyContacts<T extends { id: string }>(
  contacts: ReadonlyArray<T>,
  contactId: string,
): ReadonlyArray<T> {
  return contacts.filter((contact) => contact.id !== contactId)
}
