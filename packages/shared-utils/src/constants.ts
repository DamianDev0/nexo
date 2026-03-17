import {
  ContactSource,
  ContactStatus,
  DealStatus,
  InvoiceStatus,
  PaymentMethod,
  PaymentStatus,
  TaxRegime,
  UserRole,
} from '@repo/shared-types'

// ─── CURRENCY ────────────────────────────────────────────────────────
export const CURRENCY_CODE = 'COP'
export const MAX_INVOICE_ITEMS = 100
export const VAT_RATES = [0, 5, 19] as const
export type VATRate = (typeof VAT_RATES)[number]

// ─── UI LABELS ───────────────────────────────────────────────────────

export const CONTACT_STATUS_LABELS: Record<ContactStatus, string> = {
  [ContactStatus.NEW]: 'Nuevo',
  [ContactStatus.IN_CONTACT]: 'En contacto',
  [ContactStatus.QUALIFIED]: 'Calificado',
  [ContactStatus.CLIENT]: 'Cliente',
  [ContactStatus.INACTIVE]: 'Inactivo',
  [ContactStatus.LOST]: 'Perdido',
}

export const CONTACT_SOURCE_LABELS: Record<ContactSource, string> = {
  [ContactSource.MANUAL]: 'Manual',
  [ContactSource.WHATSAPP]: 'WhatsApp',
  [ContactSource.WEB_FORM]: 'Formulario web',
  [ContactSource.REFERRAL]: 'Referido',
  [ContactSource.IMPORT]: 'Importación',
}

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  [InvoiceStatus.DRAFT]: 'Borrador',
  [InvoiceStatus.PENDING_DIAN]: 'Pendiente DIAN',
  [InvoiceStatus.APPROVED]: 'Aprobada',
  [InvoiceStatus.REJECTED]: 'Rechazada',
  [InvoiceStatus.PAID]: 'Pagada',
  [InvoiceStatus.VOIDED]: 'Anulada',
}

export const TAX_REGIME_LABELS: Record<TaxRegime, string> = {
  [TaxRegime.RESPONSIBLE_VAT]: 'Responsable de IVA',
  [TaxRegime.NOT_RESPONSIBLE]: 'No responsable de IVA',
  [TaxRegime.LARGE_CONTRIBUTOR]: 'Gran contribuyente',
  [TaxRegime.SIMPLE_REGIME]: 'Régimen simple',
}

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.SUPER_ADMIN]: 'Super administrador',
  [UserRole.OWNER]: 'Propietario',
  [UserRole.ADMIN]: 'Administrador',
  [UserRole.MANAGER]: 'Gerente',
  [UserRole.SALES_REP]: 'Vendedor',
  [UserRole.VIEWER]: 'Solo lectura',
}

export const DEAL_STATUS_LABELS: Record<DealStatus, string> = {
  [DealStatus.OPEN]: 'Abierto',
  [DealStatus.WON]: 'Ganado',
  [DealStatus.LOST]: 'Perdido',
}

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  [PaymentMethod.CASH]: 'Efectivo',
  [PaymentMethod.BANK_TRANSFER]: 'Transferencia bancaria',
  [PaymentMethod.CREDIT_CARD]: 'Tarjeta de crédito',
  [PaymentMethod.DEBIT_CARD]: 'Tarjeta débito',
  [PaymentMethod.PSE]: 'PSE',
  [PaymentMethod.NEQUI]: 'Nequi',
  [PaymentMethod.DAVIPLATA]: 'Daviplata',
}

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  [PaymentStatus.PENDING]: 'Pendiente',
  [PaymentStatus.APPROVED]: 'Aprobado',
  [PaymentStatus.REJECTED]: 'Rechazado',
  [PaymentStatus.VOIDED]: 'Anulado',
}

// ─── DEFAULT PIPELINE STAGES (by industry sector) ───────────────────

export const DEFAULT_PIPELINE_STAGES = {
  general: [
    { name: 'Prospecto', probability: 10, order: 1 },
    { name: 'Contacto inicial', probability: 20, order: 2 },
    { name: 'Propuesta', probability: 40, order: 3 },
    { name: 'Negociación', probability: 60, order: 4 },
    { name: 'Cierre', probability: 90, order: 5 },
    { name: 'Ganado', probability: 100, order: 6 },
    { name: 'Perdido', probability: 0, order: 7 },
  ],
  retail: [
    { name: 'Interesado', probability: 10, order: 1 },
    { name: 'Cotización', probability: 30, order: 2 },
    { name: 'Negociación', probability: 60, order: 3 },
    { name: 'Cierre', probability: 90, order: 4 },
    { name: 'Ganado', probability: 100, order: 5 },
    { name: 'Perdido', probability: 0, order: 6 },
  ],
  services: [
    { name: 'Lead', probability: 10, order: 1 },
    { name: 'Reunión agendada', probability: 25, order: 2 },
    { name: 'Diagnóstico', probability: 40, order: 3 },
    { name: 'Propuesta enviada', probability: 55, order: 4 },
    { name: 'Negociación', probability: 75, order: 5 },
    { name: 'Contrato', probability: 90, order: 6 },
    { name: 'Ganado', probability: 100, order: 7 },
    { name: 'Perdido', probability: 0, order: 8 },
  ],
} as const
