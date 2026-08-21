import { Injectable } from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import type { WebhookEvent } from '@repo/shared-types'

export interface CrmEventPayload {
  schemaName: string
  entityType: string
  entityId: string
  [key: string]: unknown
}

@Injectable()
export class EventBusService {
  constructor(private readonly emitter: EventEmitter2) {}

  emit(event: string, payload: object): void {
    this.emitter.emit(event, payload)
  }

  emitCrm(event: WebhookEvent, payload: CrmEventPayload): void {
    this.emitter.emit(event, { ...payload, _eventName: event })
  }
}
