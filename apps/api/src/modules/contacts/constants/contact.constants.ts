import type { FieldMap } from '@/shared/utils/field-map'
import type { UpdateContactDto } from '../dto/contact.dto'

export const UPDATABLE_FIELDS: FieldMap<UpdateContactDto> = [
  ['firstName', 'first_name'],
  ['lastName', 'last_name'],
  ['email', 'email'],
  ['phone', 'phone'],
  ['whatsapp', 'whatsapp'],
  ['address', 'address'],
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

export const CONTACT_COLUMNS = `
  id, first_name, last_name, email, phone, whatsapp,
  document_type, document_number, address, city, department, municipio_code,
  status, source, lead_score, tags, company_id, assigned_to_id,
  custom_fields, is_active, created_by, created_at, updated_at
`

export const SORTABLE_COLUMNS: Record<string, string> = {
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  firstName: 'first_name',
  lastName: 'last_name',
  email: 'email',
  city: 'city',
  status: 'status',
  leadScore: 'lead_score',
  lastContactedAt: 'last_contacted_at',
}

export const CONTACT_LIST_COLUMNS = `
  id, first_name, last_name, email, phone, whatsapp,
  document_type, document_number, address, city, department, municipio_code,
  status, source, lead_score, tags, company_id, assigned_to_id,
  is_active, created_by, created_at, updated_at
`
