// ─── DOCUMENT TYPES (Colombian ID documents) ────────────────────────
export enum DocumentType {
  CC = 'cc', // Cédula de Ciudadanía
  NIT = 'nit', // Número de Identificación Tributaria
  CE = 'ce', // Cédula de Extranjería
  PP = 'pp', // Pasaporte
  TI = 'ti', // Tarjeta de Identidad (minors)
}

// ─── CONTACT ─────────────────────────────────────────────────────────
export enum ContactStatus {
  NEW = 'new',
  IN_CONTACT = 'in_contact',
  QUALIFIED = 'qualified',
  CLIENT = 'client',
  INACTIVE = 'inactive',
  LOST = 'lost',
}

export enum ContactSource {
  MANUAL = 'manual',
  WHATSAPP = 'whatsapp',
  WEB_FORM = 'web_form',
  REFERRAL = 'referral',
  IMPORT = 'import',
}

// ─── INVOICE ─────────────────────────────────────────────────────────
export enum InvoiceStatus {
  DRAFT = 'draft',
  PENDING_DIAN = 'pending_dian',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  PAID = 'paid',
  VOIDED = 'voided',
}

// ─── TAX ─────────────────────────────────────────────────────────────
export enum TaxRegime {
  RESPONSIBLE_VAT = 'responsible_vat',
  NOT_RESPONSIBLE = 'not_responsible',
  LARGE_CONTRIBUTOR = 'large_contributor',
  SIMPLE_REGIME = 'simple_regime',
}

// ─── USER ROLES (RBAC) ──────────────────────────────────────────────
// super_admin  → platform operator (can manage all tenants)
// owner        → tenant business owner (highest role within a tenant)
// admin        → tenant administrator
// manager      → team manager
// sales_rep    → sales representative
// viewer       → read-only
export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  OWNER = 'owner',
  ADMIN = 'admin',
  MANAGER = 'manager',
  SALES_REP = 'sales_rep',
  VIEWER = 'viewer',
}

// ─── ACTIVITY ────────────────────────────────────────────────────────
export enum ActivityType {
  CALL = 'call',
  MEETING = 'meeting',
  EMAIL = 'email',
  TASK = 'task',
  NOTE = 'note',
  WHATSAPP = 'whatsapp',
}

// ─── NOTIFICATION ────────────────────────────────────────────────────
export enum NotificationType {
  INVOICE_APPROVED_DIAN = 'invoice_approved_dian',
  INVOICE_REJECTED_DIAN = 'invoice_rejected_dian',
  PAYMENT_RECEIVED = 'payment_received',
  PAYMENT_FAILED = 'payment_failed',
  DEAL_ASSIGNED = 'deal_assigned',
  DEAL_STAGE_CHANGED = 'deal_stage_changed',
  TASK_DUE = 'task_due',
  WHATSAPP_NEW_MESSAGE = 'whatsapp_new_message',
}

// ─── COMPANY ─────────────────────────────────────────────────────────
export enum CompanySize {
  MICRO = 'micro', // < 10 employees
  SMALL = 'small', // 10–50
  MEDIUM = 'medium', // 51–200
  LARGE = 'large', // > 200
}

// ─── DEAL ────────────────────────────────────────────────────────────
export enum DealStatus {
  OPEN = 'open',
  WON = 'won',
  LOST = 'lost',
}

// ─── PAYMENT ─────────────────────────────────────────────────────────
export enum PaymentMethod {
  CASH = 'cash',
  BANK_TRANSFER = 'bank_transfer',
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  PSE = 'pse', // Colombian bank payment system
  NEQUI = 'nequi',
  DAVIPLATA = 'daviplata',
}

export enum PaymentStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  VOIDED = 'voided',
}
