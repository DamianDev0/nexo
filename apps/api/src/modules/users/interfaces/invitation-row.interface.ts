import type { UserRole } from '@repo/shared-types'

export interface InvitationRow {
  id: string
  email: string
  role: UserRole
  token_hash: string
  invited_by: string | null
  expires_at: string
  accepted_at: string | null
  created_at: string
}
