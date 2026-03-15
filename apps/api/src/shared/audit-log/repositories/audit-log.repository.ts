import { Injectable } from '@nestjs/common'
import { TenantDbService } from '@/shared/database/tenant-db.service'
import type { AuditAction, AuditEntityType, AuditSeverity } from '../audit-log.interfaces'

export interface AuditLogRow {
  id: string
  action: string
  entity_type: string
  entity_id: string | null
  user_id: string | null
  ip_address: string | null
  user_agent: string | null
  severity: AuditSeverity
  description: string | null
  metadata: Record<string, unknown> | null
  old_value: Record<string, unknown> | null
  new_value: Record<string, unknown> | null
  created_at: Date
}

export interface AuditLogCursor {
  createdAt: string
  id: string
}

export interface AuditLogFilters {
  userId?: string
  action?: AuditAction
  severity?: AuditSeverity
  entityType?: AuditEntityType
  from?: string
  to?: string
  cursor?: string
  limit?: number
}

export interface AuditLogPage {
  rows: AuditLogRow[]
  nextCursor: string | null
}

@Injectable()
export class AuditLogRepository {
  constructor(private readonly tenantDb: TenantDbService) {}

  async findPage(schemaName: string, filters: AuditLogFilters): Promise<AuditLogPage> {
    const limit = Math.min(filters.limit ?? 50, 200)
    const cursor = filters.cursor ? this.decodeCursor(filters.cursor) : null

    const params: unknown[] = [
      filters.userId ?? null,
      filters.action ?? null,
      filters.severity ?? null,
      filters.entityType ?? null,
      filters.from ?? null,
      filters.to ?? null,
      cursor?.createdAt ?? null,
      cursor?.id ?? null,
      limit + 1,
    ]

    const rows = await this.tenantDb.query<AuditLogRow[]>(schemaName, async (qr) => {
      const raw: unknown = await qr.query(
        `SELECT id, action, entity_type, entity_id, user_id, ip_address, user_agent,
                severity, description, metadata, old_value, new_value, created_at
           FROM "${schemaName}".audit_log
          WHERE ($1::uuid   IS NULL OR user_id     = $1::uuid)
            AND ($2::text   IS NULL OR action      = $2)
            AND ($3::text   IS NULL OR severity    = $3)
            AND ($4::text   IS NULL OR entity_type = $4)
            AND ($5::timestamptz IS NULL OR created_at >= $5::timestamptz)
            AND ($6::timestamptz IS NULL OR created_at <= $6::timestamptz)
            AND ($7::timestamptz IS NULL OR
                 created_at < $7::timestamptz OR
                 (created_at = $7::timestamptz AND id::text < $8))
          ORDER BY created_at DESC, id DESC
          LIMIT $9`,
        params,
      )
      return raw as AuditLogRow[]
    })

    const hasNext = rows.length > limit
    const data = hasNext ? rows.slice(0, limit) : rows
    const last = data[data.length - 1]

    return {
      rows: data,
      nextCursor:
        hasNext && last
          ? this.encodeCursor({ createdAt: last.created_at.toISOString(), id: last.id })
          : null,
    }
  }

  async findAll(
    schemaName: string,
    filters: Omit<AuditLogFilters, 'cursor' | 'limit'>,
  ): Promise<AuditLogRow[]> {
    const params: unknown[] = [
      filters.userId ?? null,
      filters.action ?? null,
      filters.severity ?? null,
      filters.entityType ?? null,
      filters.from ?? null,
      filters.to ?? null,
    ]

    return this.tenantDb.query<AuditLogRow[]>(schemaName, async (qr) => {
      const raw: unknown = await qr.query(
        `SELECT id, action, entity_type, entity_id, user_id, ip_address, user_agent,
                severity, description, metadata, old_value, new_value, created_at
           FROM "${schemaName}".audit_log
          WHERE ($1::uuid   IS NULL OR user_id     = $1::uuid)
            AND ($2::text   IS NULL OR action      = $2)
            AND ($3::text   IS NULL OR severity    = $3)
            AND ($4::text   IS NULL OR entity_type = $4)
            AND ($5::timestamptz IS NULL OR created_at >= $5::timestamptz)
            AND ($6::timestamptz IS NULL OR created_at <= $6::timestamptz)
          ORDER BY created_at DESC`,
        params,
      )
      return raw as AuditLogRow[]
    })
  }

  private encodeCursor(cursor: AuditLogCursor): string {
    return Buffer.from(JSON.stringify(cursor)).toString('base64url')
  }

  private decodeCursor(encoded: string): AuditLogCursor {
    try {
      return JSON.parse(Buffer.from(encoded, 'base64url').toString()) as AuditLogCursor
    } catch {
      return { createdAt: new Date().toISOString(), id: '' }
    }
  }
}
