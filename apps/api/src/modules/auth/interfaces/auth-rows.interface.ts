import type { UserRole, TenantContext } from '@repo/shared-types'

// ─── DATABASE ROW SHAPES (API-internal, never sent to client) ────────

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

// ─── REQUEST METADATA ────────────────────────────────────────────────

export type RequestMeta = {
  ip: string
  userAgent: string
}

// ─── INTERNAL AUTH RESULT (includes raw refresh token for cookie) ────
// Defined independently (not extending AuthTokensResponse) to avoid
// cross-package type resolution issues at the service/controller layer.
// The public API shape (AuthTokensResponse) lives in @repo/shared-types.

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
