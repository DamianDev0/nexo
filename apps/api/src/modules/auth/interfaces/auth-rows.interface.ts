import type { UserRole, TenantContext } from '@repo/shared-types'

export interface UserRow {
  id: string
  email: string
  full_name: string
  avatar_url: string | null
  role: UserRole
  password_hash: string | null
  is_active: boolean
}

export interface RefreshTokenRow {
  id: string
  user_id: string
  token_hash: string
  expires_at: string
  revoked_at: string | null
}

export type RequestMeta = {
  ip: string
  userAgent: string
}

export type AuthUser = {
  id: string
  email: string
  fullName: string
  role: UserRole
  avatarUrl: string | null
}

export type AuthResult = {
  accessToken: string
  refreshToken: string
  user: AuthUser
}

export type OnboardingResult = AuthResult & {
  tenant: { id: string; slug: string; name: string; schemaName: string; plan: string }
}

export type GoogleAuthResult = AuthResult & { tenantCtx: TenantContext }
