import { Injectable } from '@nestjs/common'
import type { WebhookDeliveryResult, WebhookEvent } from '@repo/shared-types'
import { TenantDbService } from '@/shared/database/tenant-db.service'
import type {
  LogRow,
  WebhookDeliveryAttempt,
  WebhookRow,
} from '../interfaces/webhook-row.interfaces'
import { sqlRows } from '@/shared/database/sql.util'

@Injectable()
export class WebhooksRepository {
  constructor(private readonly db: TenantDbService) {}

  async findAll(schemaName: string): Promise<WebhookRow[]> {
    return this.db.query(schemaName, async (qr): Promise<WebhookRow[]> => {
      return sqlRows<WebhookRow[]>(qr, `SELECT * FROM webhooks ORDER BY created_at DESC`)
    })
  }

  async create(
    schemaName: string,
    url: string,
    events: string[],
    secret: string,
  ): Promise<WebhookRow> {
    return this.db.query(schemaName, async (qr): Promise<WebhookRow> => {
      const rows = await sqlRows<WebhookRow[]>(
        qr,
        `INSERT INTO webhooks (url, events, secret) VALUES ($1, $2, $3) RETURNING *`,
        [url, events, secret],
      )
      const row = rows[0]
      if (!row) throw new Error('Failed to create webhook')
      return row
    })
  }

  async update(
    schemaName: string,
    webhookId: string,
    data: { url?: string; events?: string[]; isActive?: boolean },
  ): Promise<WebhookRow | null> {
    return this.db.query(schemaName, async (qr): Promise<WebhookRow | null> => {
      const sets: string[] = ['updated_at = NOW()']
      const params: unknown[] = []

      if (data.url) {
        params.push(data.url)
        sets.push(`url = $${params.length}`)
      }
      if (data.events) {
        params.push(data.events)
        sets.push(`events = $${params.length}`)
      }
      if (data.isActive !== undefined) {
        params.push(data.isActive)
        sets.push(`is_active = $${params.length}`)
      }

      params.push(webhookId)
      const rows = await sqlRows<WebhookRow[]>(
        qr,
        `UPDATE webhooks SET ${sets.join(', ')} WHERE id = $${params.length} RETURNING *`,
        params,
      )
      return rows[0] ?? null
    })
  }

  async remove(schemaName: string, webhookId: string): Promise<number> {
    return this.db.query(schemaName, async (qr): Promise<number> => {
      const rows = await sqlRows<WebhookRow[]>(
        qr,
        `DELETE FROM webhooks WHERE id = $1 RETURNING id`,
        [webhookId],
      )
      return rows.length
    })
  }

  async getLogs(schemaName: string, webhookId: string, limit: number): Promise<LogRow[]> {
    return this.db.query(schemaName, async (qr): Promise<LogRow[]> => {
      return sqlRows<LogRow[]>(
        qr,
        `SELECT * FROM webhook_logs WHERE webhook_id = $1 ORDER BY created_at DESC LIMIT $2`,
        [webhookId, limit],
      )
    })
  }

  async dispatch(
    schemaName: string,
    event: WebhookEvent,
    payload: Record<string, unknown>,
    deliver: (hook: WebhookRow) => Promise<WebhookDeliveryAttempt>,
  ): Promise<WebhookDeliveryResult[]> {
    return this.db.query(schemaName, async (qr): Promise<WebhookDeliveryResult[]> => {
      const hooks = await sqlRows<WebhookRow[]>(
        qr,
        `SELECT * FROM webhooks WHERE is_active = true AND $1 = ANY(events)`,
        [event],
      )

      const results: WebhookDeliveryResult[] = []

      for (const hook of hooks) {
        const { statusCode, success, error, responseTime } = await deliver(hook)

        await qr.query(
          `INSERT INTO webhook_logs (webhook_id, event, payload, status_code, response_time, success, error)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [hook.id, event, payload, statusCode, responseTime, success, error],
        )

        if (success) {
          await qr.query(
            `UPDATE webhooks SET last_triggered_at = NOW(), last_status_code = $1, fail_count = 0, updated_at = NOW() WHERE id = $2`,
            [statusCode, hook.id],
          )
        } else {
          await qr.query(
            `UPDATE webhooks SET fail_count = fail_count + 1, last_status_code = $1, updated_at = NOW() WHERE id = $2`,
            [statusCode, hook.id],
          )
        }

        results.push({ webhookId: hook.id, event, statusCode, success, responseTime })
      }

      return results
    })
  }
}
