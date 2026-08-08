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
  ['jobTitle', 'job_title'],
  ['linkedinUrl', 'linkedin_url'],
  ['birthday', 'birthday'],
  ['city', 'city'],
  ['department', 'department'],
  ['municipioCode', 'municipio_code'],
  ['status', 'status'],
  ['lifecycleStage', 'lifecycle_stage'],
  ['source', 'source'],
  ['leadScore', 'lead_score'],
  ['dataConsent', 'data_consent'],
  ['consentSource', 'consent_source'],
  ['optOutEmail', 'opt_out_email'],
  ['optOutSms', 'opt_out_sms'],
  ['optOutWhatsapp', 'opt_out_whatsapp'],
  ['tags', 'tags'],
  ['companyId', 'company_id'],
  ['assignedToId', 'assigned_to_id'],
  ['customFields', 'custom_fields'],
]

export const CONTACT_COLUMNS = `
  id, first_name, last_name, email, phone, whatsapp,
  document_type, document_number, job_title, linkedin_url, birthday,
  address, city, department, municipio_code, country,
  status, lifecycle_stage, source, lead_score,
  data_consent, consent_date, consent_source,
  opt_out_email, opt_out_sms, opt_out_whatsapp, last_contacted_at,
  tags, company_id, assigned_to_id,
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
  document_type, document_number, job_title, linkedin_url, birthday,
  address, city, department, municipio_code, country,
  status, lifecycle_stage, source, lead_score,
  data_consent, consent_date, consent_source,
  opt_out_email, opt_out_sms, opt_out_whatsapp, last_contacted_at,
  tags, company_id, assigned_to_id,
  is_active, created_by, created_at, updated_at
`
