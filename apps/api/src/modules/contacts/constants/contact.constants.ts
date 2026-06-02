import type { UpdateContactDto } from '../dto/contact.dto'

// Field mapping: DTO key → SQL column name
export const UPDATABLE_FIELDS: Array<[keyof UpdateContactDto, string]> = [
  ['firstName', 'first_name'],
  ['lastName', 'last_name'],
  ['email', 'email'],
  ['phone', 'phone'],
  ['whatsapp', 'whatsapp'],
  ['documentType', 'document_type'],
  ['documentNumber', 'document_number'],
  ['city', 'city'],
  ['department', 'department'],
  ['municipioCode', 'municipio_code'],
  ['status', 'status'],
  ['source', 'source'],
  ['leadScore', 'lead_score'],
  ['tags', 'tags'],
  ['companyId', 'company_id'],
  ['assignedToId', 'assigned_to_id'],
  ['customFields', 'custom_fields'],
]

// SQL column list shared between findOne, create RETURNING and update RETURNING
export const CONTACT_COLUMNS = `
  id, first_name, last_name, email, phone, whatsapp,
  document_type, document_number, city, department, municipio_code,
  status, source, lead_score, tags, company_id, assigned_to_id,
  custom_fields, is_active, created_by, created_at, updated_at
`

// SQL column list for list view (excludes custom_fields for performance)
export const CONTACT_LIST_COLUMNS = `
  id, first_name, last_name, email, phone, whatsapp,
  document_type, document_number, city, department, municipio_code,
  status, source, lead_score, tags, company_id, assigned_to_id,
  is_active, created_by, created_at, updated_at
`
