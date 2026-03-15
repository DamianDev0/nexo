export interface PasswordResetRow {
  id: string
  user_id: string
  token_hash: string
  expires_at: string
  used_at: string | null
}

export interface CreateResetTokenData {
  userId: string
  tokenHash: string
  expiresAt: Date
}
