export const QUEUE_NAMES = {
  NOTIFICATIONS: 'notifications',
  MESSAGES: 'messages',
  INVOICES: 'invoices',
  IMPORTS: 'imports',
  BULK_ACTIONS: 'bulk-actions',
} as const

export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES]
