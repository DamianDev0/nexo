import { Injectable } from '@nestjs/common'
import type { QueryRunner } from 'typeorm'
import type { ContactDuplicateRow } from '../interfaces/contact-duplicate-row.interfaces'
import { sqlRows } from '@/shared/database/sql.util'

const MATCH_COLUMNS = 'id, first_name, last_name, email, phone, document_number'
const MAX_MATCHES = 5

type DuplicateMatch = 'email' | 'document' | 'phones' | 'name'

const MATCH_CONDITIONS: Readonly<Record<DuplicateMatch, string>> = {
  email: 'LOWER(email) = $1',
  document: 'document_number = $1',
  phones: '(phone = ANY($1::text[]) OR whatsapp = ANY($1::text[]))',
  name: "LOWER(first_name) = $1 AND LOWER(coalesce(last_name, '')) = $2",
}

@Injectable()
export class ContactDuplicatesRepository {
  async findByEmail(
    qr: QueryRunner,
    email: string,
    excludeId?: string,
  ): Promise<ContactDuplicateRow[]> {
    return this.query(qr, 'email', [email], excludeId)
  }

  async findByDocumentNumber(
    qr: QueryRunner,
    documentNumber: string,
    excludeId?: string,
  ): Promise<ContactDuplicateRow[]> {
    return this.query(qr, 'document', [documentNumber], excludeId)
  }

  async findByPhones(
    qr: QueryRunner,
    phones: string[],
    excludeId?: string,
  ): Promise<ContactDuplicateRow[]> {
    return this.query(qr, 'phones', [phones], excludeId)
  }

  async findByName(
    qr: QueryRunner,
    firstName: string,
    lastName: string,
    excludeId?: string,
  ): Promise<ContactDuplicateRow[]> {
    return this.query(qr, 'name', [firstName, lastName], excludeId)
  }

  private async query(
    qr: QueryRunner,
    match: DuplicateMatch,
    params: unknown[],
    excludeId?: string,
  ): Promise<ContactDuplicateRow[]> {
    const finalParams = excludeId ? [...params, excludeId] : params
    return sqlRows<ContactDuplicateRow[]>(
      qr,
      `SELECT ${MATCH_COLUMNS} FROM contacts
       WHERE is_active = true AND ${this.condition(match)} ${this.exclusion(finalParams.length, excludeId)}
       LIMIT ${MAX_MATCHES}`,
      finalParams,
    )
  }

  private condition(match: DuplicateMatch): string {
    return MATCH_CONDITIONS[match]
  }

  private exclusion(paramCount: number, excludeId?: string): string {
    return excludeId ? `AND id != $${paramCount}` : ''
  }
}
