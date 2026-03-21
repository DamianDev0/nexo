export const NOTIFICATION_EVENTS = {
  DEAL_ASSIGNED: 'deal.assigned',
  DEAL_WON: 'deal.won',
  DEAL_LOST: 'deal.lost',
  DEAL_STAGE_CHANGED: 'deal.stage_changed',
  ACTIVITY_REMINDER: 'activity.reminder',
  ACTIVITY_ASSIGNED: 'activity.assigned',
  INVOICE_APPROVED: 'invoice.approved',
  INVOICE_REJECTED: 'invoice.rejected',
  PAYMENT_RECEIVED: 'payment.received',
  PAYMENT_FAILED: 'payment.failed',
  STOCK_LOW: 'stock.low',
  IMPORT_COMPLETED: 'import.completed',
} as const

export interface NotificationEvent {
  schemaName: string
  tenantId: string
  userId: string
  type: string
  title: string
  body?: string
  entityType?: string
  entityId?: string
}
