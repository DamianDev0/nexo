import { Injectable } from '@nestjs/common'
import type { QueryRunner } from 'typeorm'
import type { ContactDuplicateRow } from '../interfaces/contact-duplicate-row.interfaces'
import { sqlRows } from '@/shared/database/sql.util'

const MATCH_COLUMNS = 'id, first_name, last_name, email, phone, document_number'
const MAX_MATCHES = 5

@Injectable()
export class ContactDuplicatesRepository {
  async findByEmail(
    qr: QueryRunner,
    email: string,
    excludeId?: string,
  ): Promise<ContactDuplicateRow[]> {
    return this.query(qr, `LOWER(email) = $1`, [email], excludeId)
  }

  async findByDocumentNumber(
    qr: QueryRunner,
    documentNumber: string,
    excludeId?: string,
  ): Promise<ContactDuplicateRow[]> {
    return this.query(qr, `document_number = $1`, [documentNumber], excludeId)
  }

  async findByPhones(
    qr: QueryRunner,
    phones: string[],
    excludeId?: string,
  ): Promise<ContactDuplicateRow[]> {
    return this.query(
      qr,
      `(phone = ANY($1::text[]) OR whatsapp = ANY($1::text[]))`,
      [phones],
      excludeId,
    )
  }

  async findByName(
    qr: QueryRunner,
    firstName: string,
    lastName: string,
    excludeId?: string,
  ): Promise<ContactDuplicateRow[]> {
    return this.query(
      qr,
      `LOWER(first_name) = $1 AND LOWER(coalesce(last_name, '')) = $2`,
      [firstName, lastName],
      excludeId,
    )
  }

  private async query(
    qr: QueryRunner,
    condition: string,
    params: unknown[],
    excludeId?: string,
  ): Promise<ContactDuplicateRow[]> {
    const exclusion = excludeId ? ` AND id != $${params.length + 1}` : ''
    const finalParams = excludeId ? [...params, excludeId] : params
    return sqlRows<ContactDuplicateRow[]>(
      qr,
      `SELECT ${MATCH_COLUMNS} FROM contacts
       WHERE is_active = true AND ${condition}${exclusion}
       LIMIT ${MAX_MATCHES}`,
      finalParams,
    )
  }
}
