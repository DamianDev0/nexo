// ─── Internal refs ────────────────────────────────────────────────────────────

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

// ─── Severity ────────────────────────────────────────────────────────────────

export type AuditSeverity = 'info' | 'warning' | 'critical'

// ─── Entity types ─────────────────────────────────────────────────────────────

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

// ─── Actions ──────────────────────────────────────────────────────────────────

export enum AuditAction {
  // Auth
  AuthLogin = 'auth.login',
  AuthLoginFailed = 'auth.login.failed',
  AuthLoginGoogle = 'auth.login.google',
  AuthLogout = 'auth.logout',
  AuthTokenRefreshed = 'auth.token.refreshed',
  AuthPasswordChanged = 'auth.password.changed',
  AuthPasswordResetRequested = 'auth.password.reset.requested',
  AuthInviteSent = 'auth.invite.sent',
  AuthInviteAccepted = 'auth.invite.accepted',
  AuthAccountDisabled = 'auth.account.disabled',
  AuthAccountEnabled = 'auth.account.enabled',
  AuthSessionsRevoked = 'auth.sessions.revoked',

  // Users
  UserCreated = 'user.created',
  UserUpdated = 'user.updated',
  UserDeleted = 'user.deleted',
  UserRoleChanged = 'user.role.changed',

  // Contacts
  ContactCreated = 'contact.created',
  ContactUpdated = 'contact.updated',
  ContactDeleted = 'contact.deleted',
  ContactAssigned = 'contact.assigned',
  ContactTagged = 'contact.tagged',
  ContactImported = 'contact.imported',

  // Companies
  CompanyCreated = 'company.created',
  CompanyUpdated = 'company.updated',
  CompanyDeleted = 'company.deleted',

  // Deals
  DealCreated = 'deal.created',
  DealUpdated = 'deal.updated',
  DealDeleted = 'deal.deleted',
  DealStageChanged = 'deal.stage.changed',
  DealWon = 'deal.won',
  DealLost = 'deal.lost',
  DealAssigned = 'deal.assigned',

  // Products
  ProductCreated = 'product.created',
  ProductUpdated = 'product.updated',
  ProductDeleted = 'product.deleted',

  // Invoices
  InvoiceCreated = 'invoice.created',
  InvoiceUpdated = 'invoice.updated',
  InvoiceDeleted = 'invoice.deleted',
  InvoiceIssued = 'invoice.issued',
  InvoiceVoided = 'invoice.voided',
  InvoiceSent = 'invoice.sent',
  InvoiceDianValidated = 'invoice.dian.validated',
  InvoiceDianRejected = 'invoice.dian.rejected',

  // Payments
  PaymentRecorded = 'payment.recorded',
  PaymentUpdated = 'payment.updated',
  PaymentRefunded = 'payment.refunded',

  // Pipelines
  PipelineCreated = 'pipeline.created',
  PipelineUpdated = 'pipeline.updated',
  PipelineDeleted = 'pipeline.deleted',
  PipelineStageCreated = 'pipeline.stage.created',
  PipelineStageUpdated = 'pipeline.stage.updated',
  PipelineStageDeleted = 'pipeline.stage.deleted',

  // Workflows
  WorkflowCreated = 'workflow.created',
  WorkflowUpdated = 'workflow.updated',
  WorkflowDeleted = 'workflow.deleted',
  WorkflowActivated = 'workflow.activated',
  WorkflowDeactivated = 'workflow.deactivated',
  WorkflowExecuted = 'workflow.executed',
  WorkflowFailed = 'workflow.failed',

  // System
  TenantCreated = 'system.tenant.created',
  TenantUpdated = 'system.tenant.updated',
  TenantDeleted = 'system.tenant.deleted',
  DataExported = 'system.data.exported',
  SettingsUpdated = 'system.settings.updated',
}

// ─── Request context (subset of RequestMeta — all fields optional for audit) ──

export interface AuditMeta {
  ip?: string
  userAgent?: string
}

// ─── Event payload ────────────────────────────────────────────────────────────

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
