import type {
  ContactDuplicateMatch,
  ContactDuplicatePayload,
  ContactDuplicateSeverity,
} from '@repo/shared-types'
import type { ContactDuplicateRow } from '../interfaces/contact-duplicate-row.interfaces'

export function mapContactDuplicatePayload(
  severity: ContactDuplicateSeverity,
  field: ContactDuplicateMatch['field'],
  rows: ContactDuplicateRow[],
): ContactDuplicatePayload {
  return {
    severity,
    field,
    matches: rows.map((row) => mapContactDuplicateMatch(row, field)),
    canForce: severity === 'soft',
  }
}

export function mapContactDuplicateMatch(
  row: ContactDuplicateRow,
  field: ContactDuplicateMatch['field'],
): ContactDuplicateMatch {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    phone: row.phone,
    documentNumber: row.document_number,
    field,
  }
}
