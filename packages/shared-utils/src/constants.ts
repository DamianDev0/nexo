import { NEXO_BRAND_PALETTE } from './brand-palette.generated'

import {
  DealStatus,
  IndustrySector,
  InvoiceStatus,
  PaymentMethod,
  PaymentStatus,
  TaxRegime,
  UserRole,
} from '@repo/shared-types'

export const CURRENCY_CODE = 'COP'
export const MAX_INVOICE_ITEMS = 100
export const VAT_RATES = [0, 5, 19] as const
export type VATRate = (typeof VAT_RATES)[number]
export const DEFAULT_VAT_RATE: VATRate = 19

export const DEFAULT_PAGE_SIZE = 25
export const MAX_PAGE_SIZE = 100

export const TENANT_SLUG_REGEX = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/
export const PASSWORD_STRENGTH_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  [InvoiceStatus.DRAFT]: 'Borrador',
  [InvoiceStatus.PENDING_DIAN]: 'Pendiente DIAN',
  [InvoiceStatus.APPROVED]: 'Aprobada',
  [InvoiceStatus.REJECTED]: 'Rechazada',
  [InvoiceStatus.PAID]: 'Pagada',
  [InvoiceStatus.VOIDED]: 'Anulada',
  [InvoiceStatus.OVERDUE]: 'Vencida',
}

export const TAX_REGIME_LABELS: Record<TaxRegime, string> = {
  [TaxRegime.RESPONSIBLE_VAT]: 'Responsable de IVA',
  [TaxRegime.NOT_RESPONSIBLE]: 'No responsable de IVA',
  [TaxRegime.LARGE_CONTRIBUTOR]: 'Gran contribuyente',
  [TaxRegime.SIMPLE_REGIME]: 'Régimen simple',
  [TaxRegime.AUTORRETENEDOR]: 'Autorretenedor',
}

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.SUPER_ADMIN]: 'Super administrador',
  [UserRole.OWNER]: 'Propietario',
  [UserRole.ADMIN]: 'Administrador',
  [UserRole.MANAGER]: 'Gerente',
  [UserRole.SALES_REP]: 'Vendedor',
  [UserRole.MARKETING]: 'Marketing',
  [UserRole.BILLING]: 'Facturación',
  [UserRole.SUPPORT]: 'Soporte',
  [UserRole.VIEWER]: 'Solo lectura',
}

export const DEAL_STATUS_LABELS: Record<DealStatus, string> = {
  [DealStatus.OPEN]: 'Abierto',
  [DealStatus.WON]: 'Ganado',
  [DealStatus.LOST]: 'Perdido',
  [DealStatus.ON_HOLD]: 'En espera',
}

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  [PaymentMethod.CASH]: 'Efectivo',
  [PaymentMethod.BANK_TRANSFER]: 'Transferencia bancaria',
  [PaymentMethod.CREDIT_CARD]: 'Tarjeta de crédito',
  [PaymentMethod.DEBIT_CARD]: 'Tarjeta débito',
  [PaymentMethod.PSE]: 'PSE',
  [PaymentMethod.NEQUI]: 'Nequi',
  [PaymentMethod.DAVIPLATA]: 'Daviplata',
  [PaymentMethod.EFECTY]: 'Efecty',
  [PaymentMethod.BOLD]: 'Bold',
  [PaymentMethod.WOMPI_LINK]: 'Wompi Link',
  [PaymentMethod.CHEQUE]: 'Cheque',
}

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  [PaymentStatus.PENDING]: 'Pendiente',
  [PaymentStatus.APPROVED]: 'Aprobado',
  [PaymentStatus.REJECTED]: 'Rechazado',
  [PaymentStatus.VOIDED]: 'Anulado',
  [PaymentStatus.REFUNDED]: 'Reembolsado',
}

export const TIMEZONE_OPTIONS = [
  { value: 'America/Bogota', label: 'Bogota (UTC-5)' },
  { value: 'America/Mexico_City', label: 'Mexico City (UTC-6)' },
  { value: 'America/Santiago', label: 'Santiago (UTC-4)' },
  { value: 'America/Lima', label: 'Lima (UTC-5)' },
  { value: 'America/Buenos_Aires', label: 'Buenos Aires (UTC-3)' },
  { value: 'America/Sao_Paulo', label: 'São Paulo (UTC-3)' },
  { value: 'America/New_York', label: 'New York (UTC-5)' },
  { value: 'Europe/Madrid', label: 'Madrid (UTC+1)' },
] as const

export const CURRENCY_OPTIONS = [
  { value: 'COP', label: 'COP — Colombian Peso' },
  { value: 'USD', label: 'USD — US Dollar' },
  { value: 'EUR', label: 'EUR — Euro' },
  { value: 'MXN', label: 'MXN — Mexican Peso' },
  { value: 'BRL', label: 'BRL — Brazilian Real' },
  { value: 'ARS', label: 'ARS — Argentine Peso' },
  { value: 'CLP', label: 'CLP — Chilean Peso' },
  { value: 'PEN', label: 'PEN — Peruvian Sol' },
] as const

export const SECTOR_OPTIONS: ReadonlyArray<{
  id: IndustrySector
  label: string
}> = [
  { id: IndustrySector.SALUD, label: 'Salud' },
  { id: IndustrySector.EDUCACION, label: 'Educación' },
  { id: IndustrySector.INMOBILIARIA, label: 'Inmobiliaria' },
  { id: IndustrySector.COMERCIO, label: 'Comercio' },
  { id: IndustrySector.SERVICIOS, label: 'Servicios' },
  { id: IndustrySector.RESTAURANTE, label: 'Restaurante' },
  { id: IndustrySector.TECNOLOGIA, label: 'Tecnología' },
  { id: IndustrySector.CONSTRUCCION, label: 'Construcción' },
  { id: IndustrySector.OTROS, label: 'Otro' },
] as const

export const BRAND_COLOR_OPTIONS = [
  { hex: NEXO_BRAND_PALETTE.primary, label: 'Lime' },
  { hex: '#4F46E5', label: 'Indigo' },
  { hex: '#7C3AED', label: 'Violet' },
  { hex: '#DB2777', label: 'Pink' },
  { hex: '#DC2626', label: 'Red' },
  { hex: '#EA580C', label: 'Orange' },
  { hex: '#D97706', label: 'Amber' },
  { hex: '#059669', label: 'Emerald' },
  { hex: '#0891B2', label: 'Cyan' },
  { hex: '#1D4ED8', label: 'Blue' },
  { hex: '#0F172A', label: 'Slate' },
] as const

export const THEME_MODE_OPTIONS = ['light', 'dark', 'system'] as const

export const INVITE_ROLE_OPTIONS = [
  UserRole.ADMIN,
  UserRole.MANAGER,
  UserRole.SALES_REP,
  UserRole.VIEWER,
] as const

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
