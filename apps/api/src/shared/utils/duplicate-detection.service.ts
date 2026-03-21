import { Injectable } from '@nestjs/common'
import type { DuplicateCheckResult, DuplicateMatch } from '@repo/shared-types'
import { TenantDbService } from '@/shared/database/tenant-db.service'

interface DuplicateRow {
  id: string
  name: string
  match_field: string
  match_value: string
  similarity: number
  created_at: string
}

@Injectable()
export class DuplicateDetectionService {
  constructor(private readonly db: TenantDbService) {}

  async checkContact(
    schemaName: string,
    email?: string | null,
    phone?: string | null,
    documentNumber?: string | null,
    firstName?: string,
    lastName?: string | null,
    excludeId?: string,
  ): Promise<DuplicateCheckResult> {
    return this.db.query(schemaName, async (qr): Promise<DuplicateCheckResult> => {
      const matches: DuplicateMatch[] = []
      const exclude = excludeId ? ` AND id != '${excludeId}'` : ''

      if (email) {
        const rows: DuplicateRow[] = await qr.query(
          `SELECT id, first_name || ' ' || COALESCE(last_name, '') AS name,
           'email' AS match_field, email AS match_value, 1.0 AS similarity, created_at
           FROM contacts WHERE LOWER(email) = LOWER($1) AND is_active = true${exclude}`,
          [email],
        )
        matches.push(...rows.map((r) => this.mapMatch(r, 'contact')))
      }

      if (phone) {
        const cleaned = phone.replaceAll(/\D/g, '')
        const rows: DuplicateRow[] = await qr.query(
          `SELECT id, first_name || ' ' || COALESCE(last_name, '') AS name,
           'phone' AS match_field, phone AS match_value, 1.0 AS similarity, created_at
           FROM contacts WHERE REPLACE(REPLACE(REPLACE(phone, ' ', ''), '-', ''), '+', '') = $1
           AND is_active = true${exclude}`,
          [cleaned],
        )
        matches.push(...rows.map((r) => this.mapMatch(r, 'contact')))
      }

      if (documentNumber) {
        const rows: DuplicateRow[] = await qr.query(
          `SELECT id, first_name || ' ' || COALESCE(last_name, '') AS name,
           'documentNumber' AS match_field, document_number AS match_value, 1.0 AS similarity, created_at
           FROM contacts WHERE document_number = $1 AND is_active = true${exclude}`,
          [documentNumber],
        )
        matches.push(...rows.map((r) => this.mapMatch(r, 'contact')))
      }

      if (firstName) {
        const fullName = `${firstName} ${lastName ?? ''}`.trim()
        const rows: DuplicateRow[] = await qr.query(
          `SELECT id, first_name || ' ' || COALESCE(last_name, '') AS name,
           'name' AS match_field, first_name || ' ' || COALESCE(last_name, '') AS match_value,
           similarity(first_name || ' ' || COALESCE(last_name, ''), $1) AS similarity, created_at
           FROM contacts WHERE similarity(first_name || ' ' || COALESCE(last_name, ''), $1) > 0.6
           AND is_active = true${exclude}
           ORDER BY similarity DESC LIMIT 5`,
          [fullName],
        )
        matches.push(...rows.map((r) => this.mapMatch(r, 'contact')))
      }

      const unique = this.dedup(matches)
      return { hasDuplicates: unique.length > 0, matches: unique }
    })
  }

  async checkCompany(
    schemaName: string,
    nit?: string | null,
    name?: string,
    email?: string | null,
    excludeId?: string,
  ): Promise<DuplicateCheckResult> {
    return this.db.query(schemaName, async (qr): Promise<DuplicateCheckResult> => {
      const matches: DuplicateMatch[] = []
      const exclude = excludeId ? ` AND id != '${excludeId}'` : ''

      if (nit) {
        const rows: DuplicateRow[] = await qr.query(
          `SELECT id, name, 'nit' AS match_field, nit AS match_value, 1.0 AS similarity, created_at
           FROM companies WHERE nit = $1 AND is_active = true${exclude}`,
          [nit],
        )
        matches.push(...rows.map((r) => this.mapMatch(r, 'company')))
      }

      if (email) {
        const rows: DuplicateRow[] = await qr.query(
          `SELECT id, name, 'email' AS match_field, email AS match_value, 1.0 AS similarity, created_at
           FROM companies WHERE LOWER(email) = LOWER($1) AND is_active = true${exclude}`,
          [email],
        )
        matches.push(...rows.map((r) => this.mapMatch(r, 'company')))
      }

      if (name) {
        const rows: DuplicateRow[] = await qr.query(
          `SELECT id, name, 'name' AS match_field, name AS match_value,
           similarity(name, $1) AS similarity, created_at
           FROM companies WHERE similarity(name, $1) > 0.6 AND is_active = true${exclude}
           ORDER BY similarity DESC LIMIT 5`,
          [name],
        )
        matches.push(...rows.map((r) => this.mapMatch(r, 'company')))
      }

      const unique = this.dedup(matches)
      return { hasDuplicates: unique.length > 0, matches: unique }
    })
  }

  private mapMatch(r: DuplicateRow, entityType: 'contact' | 'company'): DuplicateMatch {
    return {
      id: r.id,
      matchField: r.match_field,
      matchValue: r.match_value,
      similarity: Number(r.similarity),
      entityType,
      name: r.name?.trim() ?? '',
      createdAt: r.created_at,
    }
  }

  private dedup(matches: DuplicateMatch[]): DuplicateMatch[] {
    const seen = new Set<string>()
    return matches.filter((m) => {
      if (seen.has(m.id)) return false
      seen.add(m.id)
      return true
    })
  }
}
