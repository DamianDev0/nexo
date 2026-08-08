import type { WebhookEvent } from '@repo/shared-types'

export interface WebhookRow {
  id: string
  url: string
  events: WebhookEvent[]
  secret: string
  is_active: boolean
  last_triggered_at: string | null
  last_status_code: number | null
  fail_count: number
  created_at: string
  updated_at: string
}

export interface WebhookDeliveryAttempt {
  statusCode: number | null
  responseTime: number
  success: boolean
  error: string | null
}

export interface LogRow {
  id: string
  webhook_id: string
  event: WebhookEvent
  payload: Record<string, unknown>
  status_code: number | null
  response_time: number | null
  success: boolean
  error: string | null
  created_at: string
}
