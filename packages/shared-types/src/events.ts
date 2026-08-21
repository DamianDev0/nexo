import { type NotificationType } from './enums'

export const DOMAIN_EVENTS = {
  CONTACT_CREATED: 'contact.created',
  CONTACT_UPDATED: 'contact.updated',
  CONTACT_DELETED: 'contact.deleted',
  CONTACT_ASSIGNED: 'contact.assigned',
  CONTACT_LIFECYCLE_CHANGED: 'contact.lifecycle_changed',
  CONTACT_TAGGED: 'contact.tagged',
  CONTACT_IMPORTED: 'contact.imported',
  COMPANY_CREATED: 'company.created',
  COMPANY_UPDATED: 'company.updated',
  COMPANY_DELETED: 'company.deleted',
  USER_CREATED: 'user.created',
  USER_UPDATED: 'user.updated',
  USER_DELETED: 'user.deleted',
  USER_ROLE_CHANGED: 'user.role_changed',
  DEAL_CREATED: 'deal.created',
  DEAL_UPDATED: 'deal.updated',
  DEAL_DELETED: 'deal.deleted',
  DEAL_WON: 'deal.won',
  DEAL_LOST: 'deal.lost',
  DEAL_STAGE_CHANGED: 'deal.stage_changed',
  DEAL_ASSIGNED: 'deal.assigned',
  PRODUCT_CREATED: 'product.created',
  PRODUCT_UPDATED: 'product.updated',
  PRODUCT_DELETED: 'product.deleted',
  ACTIVITY_CREATED: 'activity.created',
  ACTIVITY_UPDATED: 'activity.updated',
  ACTIVITY_DELETED: 'activity.deleted',
  ACTIVITY_COMPLETED: 'activity.completed',
  ACTIVITY_ASSIGNED: 'activity.assigned',
  ACTIVITY_REMINDER: 'activity.reminder',
  INVOICE_CREATED: 'invoice.created',
  INVOICE_UPDATED: 'invoice.updated',
  INVOICE_DELETED: 'invoice.deleted',
  INVOICE_ISSUED: 'invoice.issued',
  INVOICE_VOIDED: 'invoice.voided',
  INVOICE_SENT: 'invoice.sent',
  INVOICE_APPROVED: 'invoice.approved',
  INVOICE_REJECTED: 'invoice.rejected',
  INVOICE_PAID: 'invoice.paid',
  INVOICE_DIAN_VALIDATED: 'invoice.dian_validated',
  INVOICE_DIAN_REJECTED: 'invoice.dian_rejected',
  PAYMENT_RECEIVED: 'payment.received',
  PAYMENT_FAILED: 'payment.failed',
  PAYMENT_RECORDED: 'payment.recorded',
  PAYMENT_UPDATED: 'payment.updated',
  PAYMENT_REFUNDED: 'payment.refunded',
  PIPELINE_CREATED: 'pipeline.created',
  PIPELINE_UPDATED: 'pipeline.updated',
  PIPELINE_DELETED: 'pipeline.deleted',
  PIPELINE_STAGE_CREATED: 'pipeline.stage_created',
  PIPELINE_STAGE_UPDATED: 'pipeline.stage_updated',
  PIPELINE_STAGE_DELETED: 'pipeline.stage_deleted',
  WORKFLOW_CREATED: 'workflow.created',
  WORKFLOW_UPDATED: 'workflow.updated',
  WORKFLOW_DELETED: 'workflow.deleted',
  WORKFLOW_ACTIVATED: 'workflow.activated',
  WORKFLOW_DEACTIVATED: 'workflow.deactivated',
  WORKFLOW_EXECUTED: 'workflow.executed',
  WORKFLOW_FAILED: 'workflow.failed',
  STOCK_LOW: 'stock.low',
  IMPORT_COMPLETED: 'import.completed',
  WHATSAPP_NEW_MESSAGE: 'whatsapp.new_message',
} as const

export type DomainEvent = (typeof DOMAIN_EVENTS)[keyof typeof DOMAIN_EVENTS]

type Assert<T extends true> = T

export type NotificationDomainEvent = Extract<`${NotificationType}`, DomainEvent>

export type NotificationSystemType = Exclude<`${NotificationType}`, DomainEvent>

export type NotificationTypesAreCataloged = Assert<
  NotificationSystemType extends 'mention' | 'system' ? true : false
>
