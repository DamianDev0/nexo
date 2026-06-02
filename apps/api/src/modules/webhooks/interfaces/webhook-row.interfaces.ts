export interface WebhookRow {
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

export interface LogRow {
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
