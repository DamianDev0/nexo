import { formatNIT } from '@repo/shared-utils'
import type {
  Company,
  CompanyListItem,
  CompanyStats,
  CompanyContactItem,
  CompanyDealItem,
} from '@repo/shared-types'
import type {
  CompanyRow,
  ContactRow,
  DealRow,
  StatsRow,
} from '../interfaces/company-row.interfaces'

export function mapCompany(r: CompanyRow): Company {
  return {
    id: r.id,
    name: r.name,
    nit: r.nit,
    nitDv: r.nit_dv,
    nitFormatted: r.nit && r.nit_dv ? formatNIT(r.nit, r.nit_dv) : null,
    taxRegime: r.tax_regime as Company['taxRegime'],
    companySize: r.company_size as Company['companySize'],
    sectorCiiu: r.sector_ciiu as Company['sectorCiiu'],
    description: r.description ?? null,
    website: r.website,
    phone: r.phone,
    email: r.email,
    address: r.address,
    city: r.city,
    department: r.department,
    municipioCode: r.municipio_code,
    country: r.country ?? 'CO',
    employeeCount: r.employee_count ?? null,
    annualRevenueCents: r.annual_revenue_cents ? Number(r.annual_revenue_cents) : null,
    accountType: (r.account_type ?? 'prospect') as Company['accountType'],
    personType: (r.person_type ?? 'juridica') as Company['personType'],
    parentCompanyId: r.parent_company_id ?? null,
    legalRepName: r.legal_rep_name ?? null,
    legalRepDocumentType: r.legal_rep_document_type ?? null,
    legalRepDocumentNumber: r.legal_rep_document_number ?? null,
    camaraComercioNumber: r.camara_comercio_number ?? null,
    rating: r.rating ?? null,
    tags: r.tags ?? [],
    assignedToId: r.assigned_to_id,
    customFields: r.custom_fields ?? {},
    isActive: r.is_active,
    createdById: r.created_by,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }
}

export function mapCompanyListItem(r: CompanyRow): CompanyListItem {
  const { customFields: _cf, ...rest } = mapCompany({ ...r, custom_fields: {} })
  return rest
}

export function mapCompanyStats(rows: StatsRow[]): CompanyStats {
  const stat = rows[0] ?? ({} as StatsRow)
  return {
    contactCount: Number(stat.contact_count ?? 0),
    activeDealCount: Number(stat.active_deal_count ?? 0),
    totalDealsValueCents: Number(stat.total_deals_value_cents ?? 0),
    invoiceCount: Number(stat.invoice_count ?? 0),
    totalBilledCents: Number(stat.total_billed_cents ?? 0),
    pendingDebtCents: Number(stat.pending_debt_cents ?? 0),
  }
}

export function mapCompanyContactItem(r: ContactRow): CompanyContactItem {
  return {
    id: r.id,
    firstName: r.first_name,
    lastName: r.last_name,
    email: r.email,
    phone: r.phone,
    status: r.status,
    createdAt: r.created_at,
  }
}

export function mapCompanyDealItem(r: DealRow): CompanyDealItem {
  return {
    id: r.id,
    title: r.title,
    valueCents: Number(r.value_cents),
    status: r.status,
    stageId: r.stage_id,
    expectedCloseDate: r.expected_close_date,
    createdAt: r.created_at,
  }
}
