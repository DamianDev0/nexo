import { Injectable } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import type { WebhookEvent } from '@repo/shared-types'
import { WebhooksService } from './webhooks.service'

interface CrmEvent {
  schemaName: string
  entityType: string
  entityId: string
  [key: string]: unknown
}

@Injectable()
export class WebhooksListener {
  constructor(private readonly webhooksService: WebhooksService) {}

  @OnEvent('contact.**')
  @OnEvent('company.**')
  @OnEvent('deal.**')
  @OnEvent('activity.**')
  @OnEvent('invoice.**')
  @OnEvent('payment.**')
  @OnEvent('product.**')
  async handleEvent(event: CrmEvent & { _eventName?: string }): Promise<void> {
    if (!event.schemaName || !event._eventName) return

    const { schemaName, _eventName, ...payload } = event
    await this.webhooksService.dispatch(schemaName, _eventName as WebhookEvent, payload)
  }
}
