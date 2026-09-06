import type { TeamMember, UserRole } from '@repo/shared-types'
import type { MemberRow } from '../interfaces/member-row.interface'

export function mapMember(row: MemberRow): TeamMember {
  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    avatarUrl: row.avatar_url,
    role: row.role as UserRole,
  }
}
