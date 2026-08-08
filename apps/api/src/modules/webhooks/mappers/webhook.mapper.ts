import type { Webhook, WebhookLog } from '@repo/shared-types'
import type { LogRow, WebhookRow } from '../interfaces/webhook-row.interfaces'

export function mapWebhook(r: WebhookRow, opts?: { revealSecret?: boolean }): Webhook {
  return {
    id: r.id,
    url: r.url,
    events: r.events,
    secret: opts?.revealSecret ? r.secret : '',
    isActive: r.is_active,
    lastTriggeredAt: r.last_triggered_at,
    lastStatusCode: r.last_status_code,
    failCount: r.fail_count,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }
}

export function mapWebhookLog(r: LogRow): WebhookLog {
  return {
    id: r.id,
    webhookId: r.webhook_id,
    event: r.event,
    payload: r.payload,
    statusCode: r.status_code,
    responseTime: r.response_time,
    success: r.success,
    error: r.error,
    createdAt: r.created_at,
  }
}
