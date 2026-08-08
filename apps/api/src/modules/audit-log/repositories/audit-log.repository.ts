import { Injectable } from '@nestjs/common'
import { TenantDbService } from '@/shared/database/tenant-db.service'
import type { AuditEvent } from '../interfaces/audit-log.interfaces'
import type {
  AuditLogCursor,
  AuditLogFilters,
  AuditLogPage,
  AuditLogRow,
} from '../interfaces/audit-log-row.interfaces'
import { sqlRows } from '@/shared/database/sql.util'

@Injectable()
export class AuditLogRepository {
  constructor(private readonly tenantDb: TenantDbService) {}

  async insert(event: AuditEvent): Promise<void> {
    const {
      schemaName,
      action,
      entityType,
      entityId = null,
      userId = null,
      ip = null,
      userAgent = null,
      severity = 'info',
      description = null,
      metadata = null,
      oldValue = null,
      newValue = null,
    } = event

    await this.tenantDb.query(schemaName, async (qr) => {
      await qr.query(
        `INSERT INTO "${schemaName}".audit_log
           (action, entity_type, entity_id, user_id, ip_address, user_agent,
            severity, description, metadata, old_value, new_value)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          action,
          entityType,
          entityId,
          userId,
          ip,
          userAgent,
          severity,
          description,
          metadata ? JSON.stringify(metadata) : null,
          oldValue ? JSON.stringify(oldValue) : null,
          newValue ? JSON.stringify(newValue) : null,
        ],
      )
    })
  }

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
      const raw = await sqlRows<AuditLogRow[]>(
        qr,
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
      return raw
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
      const raw = await sqlRows<AuditLogRow[]>(
        qr,
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
      return raw
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
