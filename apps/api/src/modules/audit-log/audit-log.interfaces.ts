import type { DomainEvent } from '@repo/shared-types'

export interface UserRef {
  id: string
  email: string
}

export interface TenantRef {
  id: string
  slug: string
  name: string
  plan: string
}

export type AuditSeverity = 'info' | 'warning' | 'critical'

export enum AuditEntityType {
  User = 'user',
  Contact = 'contact',
  Company = 'company',
  Deal = 'deal',
  Product = 'product',
  Invoice = 'invoice',
  Payment = 'payment',
  Pipeline = 'pipeline',
  PipelineStage = 'pipeline_stage',
  Activity = 'activity',
  Workflow = 'workflow',
  Notification = 'notification',
  RefreshToken = 'refresh_token',
  System = 'system',
}

export enum AuditAction {
  AuthLogin = 'auth.login',
  AuthLoginFailed = 'auth.login_failed',
  AuthLoginGoogle = 'auth.login_google',
  AuthLogout = 'auth.logout',
  AuthTokenRefreshed = 'auth.token_refreshed',
  AuthPasswordChanged = 'auth.password_changed',
  AuthPasswordResetRequested = 'auth.password_reset_requested',
  AuthInviteSent = 'auth.invite_sent',
  AuthInviteAccepted = 'auth.invite_accepted',
  AuthAccountDisabled = 'auth.account_disabled',
  AuthAccountEnabled = 'auth.account_enabled',
  AuthSessionsRevoked = 'auth.sessions_revoked',

  UserCreated = 'user.created',
  UserUpdated = 'user.updated',
  UserDeleted = 'user.deleted',
  UserRoleChanged = 'user.role_changed',

  ContactCreated = 'contact.created',
  ContactUpdated = 'contact.updated',
  ContactDeleted = 'contact.deleted',
  ContactAssigned = 'contact.assigned',
  ContactTagged = 'contact.tagged',
  ContactImported = 'contact.imported',

  CompanyCreated = 'company.created',
  CompanyUpdated = 'company.updated',
  CompanyDeleted = 'company.deleted',

  DealCreated = 'deal.created',
  DealUpdated = 'deal.updated',
  DealDeleted = 'deal.deleted',
  DealStageChanged = 'deal.stage_changed',
  DealWon = 'deal.won',
  DealLost = 'deal.lost',
  DealAssigned = 'deal.assigned',

  ProductCreated = 'product.created',
  ProductUpdated = 'product.updated',
  ProductDeleted = 'product.deleted',

  ActivityCreated = 'activity.created',
  ActivityUpdated = 'activity.updated',
  ActivityDeleted = 'activity.deleted',
  ActivityCompleted = 'activity.completed',

  InvoiceCreated = 'invoice.created',
  InvoiceUpdated = 'invoice.updated',
  InvoiceDeleted = 'invoice.deleted',
  InvoiceIssued = 'invoice.issued',
  InvoiceVoided = 'invoice.voided',
  InvoiceSent = 'invoice.sent',
  InvoiceDianValidated = 'invoice.dian_validated',
  InvoiceDianRejected = 'invoice.dian_rejected',

  PaymentRecorded = 'payment.recorded',
  PaymentUpdated = 'payment.updated',
  PaymentRefunded = 'payment.refunded',

  PipelineCreated = 'pipeline.created',
  PipelineUpdated = 'pipeline.updated',
  PipelineDeleted = 'pipeline.deleted',
  PipelineStageCreated = 'pipeline.stage_created',
  PipelineStageUpdated = 'pipeline.stage_updated',
  PipelineStageDeleted = 'pipeline.stage_deleted',

  WorkflowCreated = 'workflow.created',
  WorkflowUpdated = 'workflow.updated',
  WorkflowDeleted = 'workflow.deleted',
  WorkflowActivated = 'workflow.activated',
  WorkflowDeactivated = 'workflow.deactivated',
  WorkflowExecuted = 'workflow.executed',
  WorkflowFailed = 'workflow.failed',

  TenantCreated = 'system.tenant_created',
  TenantUpdated = 'system.tenant_updated',
  TenantDeleted = 'system.tenant_deleted',
  DataExported = 'system.data_exported',
  SettingsUpdated = 'system.settings_updated',
}

type Assert<T extends true> = T

export type AuditEntityAction = Exclude<`${AuditAction}`, `auth.${string}` | `system.${string}`>

export type AuditEntityActionsAreDomainEvents = Assert<
  AuditEntityAction extends DomainEvent ? true : false
>

export interface AuditMeta {
  ip?: string
  userAgent?: string
  metadata?: Record<string, unknown>
}

export interface AuditEvent {
  schemaName: string
  action: AuditAction
  entityType: AuditEntityType
  entityId?: string
  userId?: string
  ip?: string
  userAgent?: string
  severity?: AuditSeverity
  description?: string
  metadata?: Record<string, unknown>
  oldValue?: Record<string, unknown>
  newValue?: Record<string, unknown>
}
