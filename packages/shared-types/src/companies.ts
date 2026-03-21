import type { AccountType, CIIUSector, CompanySize, PersonType, TaxRegime } from './enums'

export type Company = {
  id: string
  name: string
  nit: string | null
  nitDv: string | null
  nitFormatted: string | null
  taxRegime: TaxRegime | null
  companySize: CompanySize | null
  sectorCiiu: CIIUSector | null
  description: string | null
  website: string | null
  phone: string | null
  email: string | null
  address: string | null
  city: string | null
  department: string | null
  municipioCode: string | null
  country: string
  employeeCount: number | null
  annualRevenueCents: number | null
  accountType: AccountType
  personType: PersonType
  parentCompanyId: string | null
  legalRepName: string | null
  legalRepDocumentType: string | null
  legalRepDocumentNumber: string | null
  camaraComercioNumber: string | null
  rating: string | null
  tags: string[]
  assignedToId: string | null
  customFields: Record<string, unknown>
  isActive: boolean
  createdById: string | null
  createdAt: string
  updatedAt: string
}

export type CompanyListItem = Omit<Company, 'customFields' | 'description'>

export type PaginatedCompanies = {
  data: CompanyListItem[]
  total: number
  page: number
  limit: number
}

export type CompanyStats = {
  contactCount: number
  activeDealCount: number
  totalDealsValueCents: number
  invoiceCount: number
  totalBilledCents: number
  pendingDebtCents: number
}

export type CompanyContactItem = {
  id: string
  firstName: string
  lastName: string | null
  email: string | null
  phone: string | null
  status: string
  createdAt: string
}

export type CompanyDealItem = {
  id: string
  title: string
  valueCents: number
  status: string
  stageId: string | null
  expectedCloseDate: string | null
  createdAt: string
}

export type CompanySummary = Company & {
  stats: CompanyStats
  contacts: CompanyContactItem[]
  deals: CompanyDealItem[]
}
