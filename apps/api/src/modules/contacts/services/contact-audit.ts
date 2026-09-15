import type { EventBusService } from '@/shared/events/event-bus.service'
import { AUDIT_EVENTS, AuditEntityEvent, AuditEntityType } from '@/shared/events/audit.events'
import type { AuditAction } from '@/shared/events/audit.events'

export type ContactAuditInput = {
  readonly schemaName: string
  readonly action: AuditAction
  readonly entityId: string
  readonly userId: string | undefined
  readonly description: string
}

export function emitContactAudit(
  eventBus: Pick<EventBusService, 'emit'>,
  input: ContactAuditInput,
): void {
  eventBus.emit(
    AUDIT_EVENTS.ENTITY,
    new AuditEntityEvent(
      input.schemaName,
      input.action,
      AuditEntityType.Contact,
      input.entityId,
      input.userId,
      input.description,
    ),
  )
}
