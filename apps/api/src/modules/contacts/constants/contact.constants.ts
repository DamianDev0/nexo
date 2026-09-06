import type { FieldMap } from '@/shared/utils/field-map'
import type { UpdateContactDto } from '../dto/contact.dto'
import type { CreateContactData } from '../interfaces/contact-row.interfaces'

export const IMPORT_MAX_ISSUES = 200

export const IMPORT_UPDATABLE_COLUMNS: ReadonlyArray<[keyof CreateContactData, string]> = [
  ['firstName', 'first_name'],
  ['lastName', 'last_name'],
  ['email', 'email'],
  ['phone', 'phone'],
  ['whatsapp', 'whatsapp'],
  ['documentType', 'document_type'],
  ['documentNumber', 'document_number'],
  ['city', 'city'],
  ['status', 'status'],
  ['lifecycleStage', 'lifecycle_stage'],
  ['source', 'source'],
  ['tags', 'tags'],
]

export const UPDATABLE_FIELDS: FieldMap<UpdateContactDto> = [
  ['firstName', 'first_name'],
  ['lastName', 'last_name'],
  ['email', 'email'],
  ['phone', 'phone'],
  ['whatsapp', 'whatsapp'],
  ['documentType', 'document_type'],
  ['documentNumber', 'document_number'],
  ['city', 'city'],
  ['municipioCode', 'municipio_code'],
  ['status', 'status'],
  ['lifecycleStage', 'lifecycle_stage'],
  ['source', 'source'],
  ['tags', 'tags'],
  ['companyId', 'company_id'],
  ['assignedToId', 'assigned_to_id'],
  ['avatarUrl', 'avatar_url'],
  ['customFields', 'custom_fields'],
]

export const CONTACT_COLUMNS = `
  id, first_name, last_name, email, phone, whatsapp,
  document_type, document_number, avatar_url, city, municipio_code,
  status, status_changed_at, lifecycle_stage, source, last_contacted_at,
  tags, company_id, assigned_to_id, custom_fields,
  is_active, created_by, created_at, updated_at
`

export const SORTABLE_COLUMNS: Record<string, string> = {
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  firstName: 'first_name',
  lastName: 'last_name',
  email: 'email',
  city: 'city',
  status: 'status',
  lastContactedAt: 'last_contacted_at',
}

export const CONTACT_LIST_COLUMNS = `
  ${CONTACT_COLUMNS},
  (SELECT COUNT(*)::int FROM activities a
   WHERE a.contact_id = contacts.id AND a.activity_type = 'note') AS note_count,
  ARRAY(SELECT dc.channel FROM data_consents dc
        WHERE dc.contact_id = contacts.id AND dc.granted = false) AS opted_out_channels,
  (SELECT u.full_name FROM users u WHERE u.id = contacts.assigned_to_id) AS assigned_to_name
`

export type TaxonomyColumn = 'status' | 'source' | 'lifecycle'

export const TAXONOMY_USAGE_SQL: Readonly<Record<TaxonomyColumn, string>> = {
  status: `SELECT status AS key, COUNT(*)::text AS count
           FROM contacts
           WHERE is_active = true AND status IS NOT NULL
           GROUP BY status`,
  source: `SELECT source AS key, COUNT(*)::text AS count
           FROM contacts
           WHERE is_active = true AND source IS NOT NULL
           GROUP BY source`,
  lifecycle: `SELECT lifecycle_stage AS key, COUNT(*)::text AS count
              FROM contacts
              WHERE is_active = true AND lifecycle_stage IS NOT NULL
              GROUP BY lifecycle_stage`,
}

export const REASSIGN_TAXONOMY_SQL: Readonly<Record<TaxonomyColumn, string>> = {
  status: `UPDATE contacts SET status = $2, updated_at = NOW() WHERE status = $1 RETURNING id`,
  source: `UPDATE contacts SET source = $2, updated_at = NOW() WHERE source = $1 RETURNING id`,
  lifecycle: `UPDATE contacts SET lifecycle_stage = $2, updated_at = NOW()
              WHERE lifecycle_stage = $1 RETURNING id`,
}

export const CONSENT_COLUMNS = `
  id, contact_id, channel, granted, granted_at, revoked_at, source, reason, evidence, updated_at
`
