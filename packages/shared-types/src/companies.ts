import type { TaxRegime, CompanySize, CIIUSector } from './enums'

// ─── COMPANY ──────────────────────────────────────────────────────────────────

export type Company = {
  id: string
  name: string
  /** Raw 9-digit NIT without check digit */
  nit: string | null
  /** Dígito de verificación DIAN */
  nitDv: string | null
  /** Display format: "900.123.456-7" — derived from nit + nitDv */
  nitFormatted: string | null
  taxRegime: TaxRegime | null
  companySize: CompanySize | null
  sectorCiiu: CIIUSector | null
  website: string | null
  phone: string | null
  email: string | null
  address: string | null
  city: string | null
  department: string | null
  municipioCode: string | null
  tags: string[]
  assignedToId: string | null
  customFields: Record<string, unknown>
  isActive: boolean
  createdById: string | null
  createdAt: string
  updatedAt: string
}

export type CompanyListItem = Omit<Company, 'customFields'>

export type PaginatedCompanies = {
  data: CompanyListItem[]
  total: number
  page: number
  limit: number
}

// ─── SUMMARY ──────────────────────────────────────────────────────────────────

export type CompanyStats = {
  contactCount: number
  activeDealCount: number
  /** Sum of value_cents for open deals */
  totalDealsValueCents: number
  invoiceCount: number
  /** Sum of total_cents for approved/paid invoices */
  totalBilledCents: number
  /** Sum of total_cents for invoices not yet paid */
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
