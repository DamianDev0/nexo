import type { UserRole } from './enums'

export interface JwtPayload {
  sub: string
  email: string
  role: UserRole
  tenantId: string
  schemaName: string
  iat?: number
  exp?: number
}

export type AuthUser = {
  id: string
  email: string
  fullName: string
  role: UserRole
  avatarUrl: string | null
}

export type MeResponse = {
  id: string
  email: string
  role: UserRole
  tenantId: string
  schemaName: string
}

export type LoginRequest = {
  email: string
  password: string
}

export type OnboardingRequest = {
  businessName: string
  slug: string
  ownerEmail: string
  ownerPassword: string
  ownerFullName: string
  planName?: string
}

export type LoginResponse = {
  user: AuthUser
}

export type OnboardingResponse = {
  user: AuthUser
  tenant: {
    id: string
    slug: string
    name: string
    schemaName: string
    plan: string
  }
}
