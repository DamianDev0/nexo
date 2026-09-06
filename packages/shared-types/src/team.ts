import type { UserRole } from './enums'

export type TeamMember = {
  id: string
  fullName: string
  email: string
  avatarUrl: string | null
  role: UserRole
}
