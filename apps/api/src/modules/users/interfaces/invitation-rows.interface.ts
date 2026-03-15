import type { UserRole } from '@repo/shared-types'

export interface CreateInvitationData {
  email: string
  role: UserRole
  tokenHash: string
  invitedBy: string
  expiresAt: Date
}
