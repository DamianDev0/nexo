import type { UserRole } from './enums'

// ─── JWT PAYLOAD (embedded in the access token) ──────────────────────
export interface JwtPayload {
  /** User ID (subject) */
  sub: string
  email: string
  role: UserRole
  tenantId: string
  schemaName: string
  iat?: number
  exp?: number
}

// ─── AUTH USER (returned in every auth response) ─────────────────────
export type AuthUser = {
  id: string
  email: string
  fullName: string
  role: UserRole
  avatarUrl: string | null
}

// ─── PUBLIC AUTH RESPONSE SHAPES (API contract shared with frontend) ─
export type AuthTokensResponse = {
  accessToken: string
  user: AuthUser
}

export type OnboardingResponse = AuthTokensResponse & {
  tenant: {
    id: string
    slug: string
    name: string
    schemaName: string
    plan: string
  }
}
