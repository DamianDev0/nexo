import type { AuditAction, AuditEntityType, AuditSeverity } from './audit-log.interfaces'

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
