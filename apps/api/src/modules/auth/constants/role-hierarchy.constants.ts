import { UserRole } from '@repo/shared-types'

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  [UserRole.SUPER_ADMIN]: 9,
  [UserRole.OWNER]: 8,
  [UserRole.ADMIN]: 7,
  [UserRole.MANAGER]: 6,
  [UserRole.MARKETING]: 5,
  [UserRole.BILLING]: 4,
  [UserRole.SUPPORT]: 3,
  [UserRole.SALES_REP]: 2,
  [UserRole.VIEWER]: 1,
}

export function canAssignRole(inviterRole: UserRole, targetRole: UserRole): boolean {
  if (targetRole === UserRole.SUPER_ADMIN) return false
  return (ROLE_HIERARCHY[targetRole] ?? 0) < (ROLE_HIERARCHY[inviterRole] ?? 0)
}
