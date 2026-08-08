import { ConflictException, Injectable } from '@nestjs/common'
import type { QueryRunner } from 'typeorm'
import type { ContactDuplicateMatch, ContactDuplicatePayload } from '@repo/shared-types'
import type {
  DuplicateProbe,
  ContactDuplicateRow,
} from '../interfaces/contact-duplicate-row.interfaces'

const MATCH_COLUMNS = 'id, first_name, last_name, email, phone, document_number'
const MAX_MATCHES = 5

@Injectable()
export class ContactDuplicatesService {
  async assertNoDuplicates(
    qr: QueryRunner,
    probe: DuplicateProbe,
    options: { force?: boolean; excludeId?: string } = {},
  ): Promise<void> {
    const hard = await this.findHard(qr, probe, options.excludeId)
    if (hard) this.throwConflict('hard', hard.field, hard.matches)

    if (options.force) return
    const soft = await this.findSoft(qr, probe, options.excludeId)
    if (soft) this.throwConflict('soft', soft.field, soft.matches)
  }

  private async findHard(
    qr: QueryRunner,
    probe: DuplicateProbe,
    excludeId?: string,
  ): Promise<{ field: ContactDuplicateMatch['field']; matches: ContactDuplicateMatch[] } | null> {
    const email = probe.email?.trim().toLowerCase()
    if (email) {
      const rows = await this.query(qr, `LOWER(email) = $1`, [email], excludeId)
      if (rows.length > 0) return { field: 'email', matches: rows.map((r) => this.map(r, 'email')) }
    }

    const document = probe.documentNumber?.trim()
    if (document) {
      const rows = await this.query(qr, `document_number = $1`, [document], excludeId)
      if (rows.length > 0) {
        return { field: 'documentNumber', matches: rows.map((r) => this.map(r, 'documentNumber')) }
      }
    }

    return null
  }

  private async findSoft(
    qr: QueryRunner,
    probe: DuplicateProbe,
    excludeId?: string,
  ): Promise<{ field: ContactDuplicateMatch['field']; matches: ContactDuplicateMatch[] } | null> {
    const phones = [probe.phone?.trim(), probe.whatsapp?.trim()].filter((value): value is string =>
      Boolean(value),
    )
    if (phones.length > 0) {
      const rows = await this.query(
        qr,
        `(phone = ANY($1::text[]) OR whatsapp = ANY($1::text[]))`,
        [phones],
        excludeId,
      )
      if (rows.length > 0) return { field: 'phone', matches: rows.map((r) => this.map(r, 'phone')) }
    }

    const first = probe.firstName?.trim().toLowerCase()
    const last = probe.lastName?.trim().toLowerCase()
    if (first && last) {
      const rows = await this.query(
        qr,
        `LOWER(first_name) = $1 AND LOWER(coalesce(last_name, '')) = $2`,
        [first, last],
        excludeId,
      )
      if (rows.length > 0) return { field: 'name', matches: rows.map((r) => this.map(r, 'name')) }
    }

    return null
  }

  private async query(
    qr: QueryRunner,
    condition: string,
    params: unknown[],
    excludeId?: string,
  ): Promise<ContactDuplicateRow[]> {
    const exclusion = excludeId ? ` AND id != $${params.length + 1}` : ''
    const finalParams = excludeId ? [...params, excludeId] : params
    return qr.query(
      `SELECT ${MATCH_COLUMNS} FROM contacts
       WHERE is_active = true AND ${condition}${exclusion}
       LIMIT ${MAX_MATCHES}`,
      finalParams,
    )
  }

  private throwConflict(
    severity: ContactDuplicatePayload['severity'],
    field: ContactDuplicateMatch['field'],
    matches: ContactDuplicateMatch[],
  ): never {
    throw new ConflictException({
      statusCode: 409,
      error: 'Conflict',
      message: 'contact_duplicate',
      duplicate: { severity, field, matches } satisfies ContactDuplicatePayload,
    })
  }

  private map(
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
}
