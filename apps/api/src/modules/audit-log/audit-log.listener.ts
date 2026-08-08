import { Injectable } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { AUDIT_EVENTS, AuditEntityEvent } from '@/shared/events/audit.events'
import { AuditLogService } from './audit-log.service'

@Injectable()
export class AuditLogListener {
  constructor(private readonly audit: AuditLogService) {}

  @OnEvent(AUDIT_EVENTS.ENTITY)
  async handleEntityEvent(event: AuditEntityEvent): Promise<void> {
    await this.audit.entityEvent(
      event.schemaName,
      event.action,
      event.entityType,
      event.entityId,
      event.userId,
      event.description,
    )
  }
}
