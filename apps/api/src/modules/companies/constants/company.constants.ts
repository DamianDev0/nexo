import type { UpdateCompanyDto } from '../dto/company.dto'

// ─── Field mapping: DTO key → SQL column ─────────────────────────────────────

export const UPDATABLE_FIELDS: Array<[keyof UpdateCompanyDto, string]> = [
  ['name', 'name'],
  ['taxRegime', 'tax_regime'],
  ['companySize', 'company_size'],
  ['sectorCiiu', 'sector_ciiu'],
  ['website', 'website'],
  ['phone', 'phone'],
  ['email', 'email'],
  ['address', 'address'],
  ['city', 'city'],
  ['department', 'department'],
  ['municipioCode', 'municipio_code'],
  ['tags', 'tags'],
  ['assignedToId', 'assigned_to_id'],
  ['customFields', 'custom_fields'],
]

// ─── SQL column lists ─────────────────────────────────────────────────────────

export const COMPANY_COLUMNS = `
  id, name, nit, nit_dv, tax_regime, company_size, sector_ciiu,
  website, phone, email, address, city, department, municipio_code,
  tags, assigned_to_id, custom_fields, is_active, created_by, created_at, updated_at
`

export const COMPANY_LIST_COLUMNS = `
  id, name, nit, nit_dv, tax_regime, company_size, sector_ciiu,
  website, phone, email, city, department, municipio_code,
  tags, assigned_to_id, is_active, created_by, created_at, updated_at
`
