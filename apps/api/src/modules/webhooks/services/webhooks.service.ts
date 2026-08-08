import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { randomBytes, createHmac } from 'node:crypto'
import type { Webhook, WebhookDeliveryResult, WebhookEvent, WebhookLog } from '@repo/shared-types'
import type { WebhookDeliveryAttempt, WebhookRow } from '../interfaces/webhook-row.interfaces'
import { WebhooksRepository } from '../repositories/webhooks.repository'
import { mapWebhook, mapWebhookLog } from '../mappers/webhook.mapper'
import { assertSafeWebhookUrl } from '../webhook-url.util'

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name)

  constructor(private readonly repository: WebhooksRepository) {}

  async findAll(schemaName: string): Promise<Webhook[]> {
    const rows = await this.repository.findAll(schemaName)
    return rows.map((r) => mapWebhook(r))
  }

  async create(schemaName: string, data: { url: string; events: string[] }): Promise<Webhook> {
    assertSafeWebhookUrl(data.url)
    const secret = randomBytes(32).toString('hex')
    const row = await this.repository.create(schemaName, data.url, data.events, secret)
    return mapWebhook(row, { revealSecret: true })
  }

  async update(
    schemaName: string,
    webhookId: string,
    data: { url?: string; events?: string[]; isActive?: boolean },
  ): Promise<Webhook> {
    if (data.url) assertSafeWebhookUrl(data.url)
    const row = await this.repository.update(schemaName, webhookId, data)
    if (!row) throw new NotFoundException(`Webhook ${webhookId} not found`)
    return mapWebhook(row)
  }

  async remove(schemaName: string, webhookId: string): Promise<void> {
    const removed = await this.repository.remove(schemaName, webhookId)
    if (removed === 0) throw new NotFoundException(`Webhook ${webhookId} not found`)
  }

  async getLogs(schemaName: string, webhookId: string, limit = 20): Promise<WebhookLog[]> {
    const rows = await this.repository.getLogs(schemaName, webhookId, limit)
    return rows.map((r) => mapWebhookLog(r))
  }

  async dispatch(
    schemaName: string,
    event: WebhookEvent,
    payload: Record<string, unknown>,
  ): Promise<WebhookDeliveryResult[]> {
    return this.repository.dispatch(schemaName, event, payload, (hook) =>
      this.deliver(hook, event, payload),
    )
  }

  private async deliver(
    hook: WebhookRow,
    event: WebhookEvent,
    payload: Record<string, unknown>,
  ): Promise<WebhookDeliveryAttempt> {
    const start = Date.now()
    let statusCode: number | null = null
    let success = false
    let error: string | null = null

    try {
      assertSafeWebhookUrl(hook.url)
      const body = JSON.stringify({ event, data: payload, timestamp: new Date().toISOString() })
      const signature = createHmac('sha256', hook.secret).update(body).digest('hex')

      const res = await fetch(hook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': signature,
          'X-Webhook-Event': event,
        },
        body,
        signal: AbortSignal.timeout(10000),
      })

      statusCode = res.status
      success = res.ok
    } catch (err) {
      error = err instanceof Error ? err.message : String(err)
      this.logger.warn(`Webhook ${hook.id} failed: ${error}`)
    }

    return { statusCode, responseTime: Date.now() - start, success, error }
  }
}
