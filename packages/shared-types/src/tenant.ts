import type { UserRole } from './enums'

export type TenantContext = {
  tenantId: string
  slug: string
  schemaName: string
  plan: string
  config: Record<string, unknown>
  productName: string
  customDomain: string | null
}

export type AuthenticatedUser = {
  id: string
  email: string
  role: UserRole
  tenantId: string
  schemaName: string
}

export type TenantConfig = {
  timezone: string
  currency: string
  locale: string
  features: Record<string, boolean>
}

export type PlanLimits = {
  maxUsers: number
  maxContacts: number
  maxDeals: number
  maxInvoicesPerMonth: number
  maxStorageMb: number
  whatsappEnabled: boolean
  aiEnabled: boolean
  customFieldsEnabled: boolean
}
