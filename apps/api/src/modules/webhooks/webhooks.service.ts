import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { randomBytes, createHmac } from 'node:crypto'
import type { Webhook, WebhookDeliveryResult, WebhookEvent, WebhookLog } from '@repo/shared-types'
import { TenantDbService } from '@/shared/database/tenant-db.service'

interface WebhookRow {
  id: string
  url: string
  events: string[]
  secret: string
  is_active: boolean
  last_triggered_at: string | null
  last_status_code: number | null
  fail_count: number
  created_at: string
  updated_at: string
}

interface LogRow {
  id: string
  webhook_id: string
  event: string
  payload: Record<string, unknown>
  status_code: number | null
  response_time: number | null
  success: boolean
  error: string | null
  created_at: string
}

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name)

  constructor(private readonly db: TenantDbService) {}

  async findAll(schemaName: string): Promise<Webhook[]> {
    return this.db.query(schemaName, async (qr): Promise<Webhook[]> => {
      const rows: WebhookRow[] = await qr.query(`SELECT * FROM webhooks ORDER BY created_at DESC`)
      return rows.map((r) => this.map(r))
    })
  }

  async create(schemaName: string, data: { url: string; events: string[] }): Promise<Webhook> {
    return this.db.query(schemaName, async (qr): Promise<Webhook> => {
      const secret = randomBytes(32).toString('hex')
      const rows: WebhookRow[] = await qr.query(
        `INSERT INTO webhooks (url, events, secret) VALUES ($1, $2, $3) RETURNING *`,
        [data.url, data.events, secret],
      )
      const row = rows[0]
      if (!row) throw new Error('Failed to create webhook')
      return this.map(row)
    })
  }

  async update(
    schemaName: string,
    webhookId: string,
    data: { url?: string; events?: string[]; isActive?: boolean },
  ): Promise<Webhook> {
    return this.db.query(schemaName, async (qr): Promise<Webhook> => {
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
      const rows: WebhookRow[] = await qr.query(
        `UPDATE webhooks SET ${sets.join(', ')} WHERE id = $${params.length} RETURNING *`,
        params,
      )
      if (!rows[0]) throw new NotFoundException(`Webhook ${webhookId} not found`)
      return this.map(rows[0])
    })
  }

  async remove(schemaName: string, webhookId: string): Promise<void> {
    return this.db.query(schemaName, async (qr): Promise<void> => {
      const rows: WebhookRow[] = await qr.query(`DELETE FROM webhooks WHERE id = $1 RETURNING id`, [
        webhookId,
      ])
      if (rows.length === 0) throw new NotFoundException(`Webhook ${webhookId} not found`)
    })
  }

  async getLogs(schemaName: string, webhookId: string, limit = 20): Promise<WebhookLog[]> {
    return this.db.query(schemaName, async (qr): Promise<WebhookLog[]> => {
      const rows: LogRow[] = await qr.query(
        `SELECT * FROM webhook_logs WHERE webhook_id = $1 ORDER BY created_at DESC LIMIT $2`,
        [webhookId, limit],
      )
      return rows.map((r) => this.mapLog(r))
    })
  }

  async dispatch(
    schemaName: string,
    event: WebhookEvent,
    payload: Record<string, unknown>,
  ): Promise<WebhookDeliveryResult[]> {
    return this.db.query(schemaName, async (qr): Promise<WebhookDeliveryResult[]> => {
      const hooks: WebhookRow[] = await qr.query(
        `SELECT * FROM webhooks WHERE is_active = true AND $1 = ANY(events)`,
        [event],
      )

      const results: WebhookDeliveryResult[] = []

      for (const hook of hooks) {
        const start = Date.now()
        let statusCode: number | null = null
        let success = false
        let error: string | null = null

        try {
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

        const responseTime = Date.now() - start

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

  private map(r: WebhookRow): Webhook {
    return {
      id: r.id,
      url: r.url,
      events: r.events as WebhookEvent[],
      secret: r.secret,
      isActive: r.is_active,
      lastTriggeredAt: r.last_triggered_at,
      lastStatusCode: r.last_status_code,
      failCount: r.fail_count,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }
  }

  private mapLog(r: LogRow): WebhookLog {
    return {
      id: r.id,
      webhookId: r.webhook_id,
      event: r.event as WebhookEvent,
      payload: r.payload,
      statusCode: r.status_code,
      responseTime: r.response_time,
      success: r.success,
      error: r.error,
      createdAt: r.created_at,
    }
  }
}
