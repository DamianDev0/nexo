export type WebhookEvent =
  | 'contact.created'
  | 'contact.updated'
  | 'contact.deleted'
  | 'company.created'
  | 'company.updated'
  | 'company.deleted'
  | 'deal.created'
  | 'deal.updated'
  | 'deal.won'
  | 'deal.lost'
  | 'deal.stage_changed'
  | 'activity.created'
  | 'activity.completed'
  | 'invoice.created'
  | 'invoice.approved'
  | 'invoice.paid'
  | 'payment.received'
  | 'payment.failed'
  | 'product.created'
  | 'product.updated'

export type Webhook = {
  id: string
  url: string
  events: WebhookEvent[]
  secret: string
  isActive: boolean
  lastTriggeredAt: string | null
  lastStatusCode: number | null
  failCount: number
  createdAt: string
  updatedAt: string
}

export type WebhookLog = {
  id: string
  webhookId: string
  event: WebhookEvent
  payload: Record<string, unknown>
  statusCode: number | null
  responseTime: number | null
  success: boolean
  error: string | null
  createdAt: string
}

export type WebhookDeliveryResult = {
  webhookId: string
  event: WebhookEvent
  statusCode: number | null
  success: boolean
  responseTime: number
}

export type ApiKey = {
  id: string
  name: string
  keyPrefix: string
  scopes: string[]
  lastUsedAt: string | null
  expiresAt: string | null
  isActive: boolean
  createdAt: string
}
