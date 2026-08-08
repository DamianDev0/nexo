import { AuditAction, AuditEntityType } from '@/shared/events/audit.events'

import type { DomainEvent } from '@repo/shared-types'

export { AuditAction, AuditEntityType }

export interface UserRef {
  id: string
  email: string
}

export interface TenantRef {
  id: string
  slug: string
  name: string
  plan: string
}

export type AuditSeverity = 'info' | 'warning' | 'critical'

type Assert<T extends true> = T

export type AuditEntityAction = Exclude<`${AuditAction}`, `auth.${string}` | `system.${string}`>

export type AuditEntityActionsAreDomainEvents = Assert<
  AuditEntityAction extends DomainEvent ? true : false
>

export interface AuditMeta {
  ip?: string
  userAgent?: string
  metadata?: Record<string, unknown>
}

export interface AuditEvent {
  schemaName: string
  action: AuditAction
  entityType: AuditEntityType
  entityId?: string
  userId?: string
  ip?: string
  userAgent?: string
  severity?: AuditSeverity
  description?: string
  metadata?: Record<string, unknown>
  oldValue?: Record<string, unknown>
  newValue?: Record<string, unknown>
}
