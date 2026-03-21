export type TimelineEventType =
  | 'activity'
  | 'note'
  | 'deal_created'
  | 'deal_stage_changed'
  | 'deal_won'
  | 'deal_lost'
  | 'invoice_created'
  | 'invoice_paid'
  | 'payment_received'
  | 'email_sent'
  | 'sms_sent'
  | 'contact_created'
  | 'company_assigned'

export type TimelineEntry = {
  id: string
  eventType: TimelineEventType
  title: string
  description: string | null
  entityType: string | null
  entityId: string | null
  userId: string | null
  userName: string | null
  metadata: Record<string, unknown>
  createdAt: string
}

export type PaginatedTimeline = {
  data: TimelineEntry[]
  total: number
  page: number
  limit: number
}
