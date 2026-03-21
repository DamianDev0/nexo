export enum DocumentType {
  CC = 'cc',
  NIT = 'nit',
  CE = 'ce',
  PP = 'pp',
  TI = 'ti',
  PEP = 'pep',
  PPT = 'ppt',
}

export enum ContactStatus {
  NEW = 'new',
  IN_CONTACT = 'in_contact',
  QUALIFIED = 'qualified',
  UNQUALIFIED = 'unqualified',
  NURTURING = 'nurturing',
  CLIENT = 'client',
  INACTIVE = 'inactive',
  LOST = 'lost',
}

export enum LifecycleStage {
  SUBSCRIBER = 'subscriber',
  LEAD = 'lead',
  MQL = 'mql',
  SQL = 'sql',
  OPPORTUNITY = 'opportunity',
  CUSTOMER = 'customer',
  EVANGELIST = 'evangelist',
}

export enum ContactSource {
  MANUAL = 'manual',
  WHATSAPP = 'whatsapp',
  WEB_FORM = 'web_form',
  REFERRAL = 'referral',
  IMPORT = 'import',
  EMAIL_CAMPAIGN = 'email_campaign',
  SOCIAL_MEDIA = 'social_media',
  PAID_AD = 'paid_ad',
  ORGANIC_SEARCH = 'organic_search',
  EVENT = 'event',
  COLD_CALL = 'cold_call',
  PARTNER = 'partner',
  CHAT = 'chat',
}

export enum InvoiceStatus {
  DRAFT = 'draft',
  PENDING_DIAN = 'pending_dian',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  PAID = 'paid',
  VOIDED = 'voided',
  OVERDUE = 'overdue',
}

export enum TaxRegime {
  RESPONSIBLE_VAT = 'responsible_vat',
  NOT_RESPONSIBLE = 'not_responsible',
  LARGE_CONTRIBUTOR = 'large_contributor',
  SIMPLE_REGIME = 'simple_regime',
  AUTORRETENEDOR = 'autorretenedor',
}

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  OWNER = 'owner',
  ADMIN = 'admin',
  MANAGER = 'manager',
  SALES_REP = 'sales_rep',
  MARKETING = 'marketing',
  BILLING = 'billing',
  SUPPORT = 'support',
  VIEWER = 'viewer',
}

export enum ActivityType {
  CALL = 'call',
  MEETING = 'meeting',
  EMAIL = 'email',
  TASK = 'task',
  NOTE = 'note',
  WHATSAPP = 'whatsapp',
  SMS = 'sms',
  DEMO = 'demo',
  PROPOSAL = 'proposal',
  SITE_VISIT = 'site_visit',
  LINKEDIN_MESSAGE = 'linkedin_message',
}

export enum NotificationType {
  DEAL_ASSIGNED = 'deal.assigned',
  DEAL_WON = 'deal.won',
  DEAL_LOST = 'deal.lost',
  DEAL_STAGE_CHANGED = 'deal.stage_changed',
  ACTIVITY_REMINDER = 'activity.reminder',
  ACTIVITY_ASSIGNED = 'activity.assigned',
  INVOICE_APPROVED = 'invoice.approved',
  INVOICE_REJECTED = 'invoice.rejected',
  PAYMENT_RECEIVED = 'payment.received',
  PAYMENT_FAILED = 'payment.failed',
  STOCK_LOW = 'stock.low',
  IMPORT_COMPLETED = 'import.completed',
  WHATSAPP_NEW_MESSAGE = 'whatsapp.new_message',
  MENTION = 'mention',
  SYSTEM = 'system',
}

export enum CompanySize {
  MICRO = 'micro',
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
}

export enum AccountType {
  PROSPECT = 'prospect',
  CUSTOMER = 'customer',
  PARTNER = 'partner',
  VENDOR = 'vendor',
  COMPETITOR = 'competitor',
}

export enum PersonType {
  NATURAL = 'natural',
  JURIDICA = 'juridica',
}

export enum CIIUSector {
  A = 'A',
  B = 'B',
  C = 'C',
  D = 'D',
  E = 'E',
  F = 'F',
  G = 'G',
  H = 'H',
  I = 'I',
  J = 'J',
  K = 'K',
  L = 'L',
  M = 'M',
  N = 'N',
  O = 'O',
  P = 'P',
  Q = 'Q',
  R = 'R',
  S = 'S',
  T = 'T',
  U = 'U',
}

export enum DealStatus {
  OPEN = 'open',
  WON = 'won',
  LOST = 'lost',
  ON_HOLD = 'on_hold',
}

export enum DealType {
  NEW_BUSINESS = 'new_business',
  EXISTING_CUSTOMER = 'existing_customer',
  RENEWAL = 'renewal',
  UPSELL = 'upsell',
}

export enum DealPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum AccountRating {
  HOT = 'hot',
  WARM = 'warm',
  COLD = 'cold',
}

export enum PaymentMethod {
  CASH = 'cash',
  BANK_TRANSFER = 'bank_transfer',
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  PSE = 'pse',
  NEQUI = 'nequi',
  DAVIPLATA = 'daviplata',
  EFECTY = 'efecty',
  BOLD = 'bold',
  WOMPI_LINK = 'wompi_link',
  CHEQUE = 'cheque',
}

export enum PaymentStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  VOIDED = 'voided',
  REFUNDED = 'refunded',
}
