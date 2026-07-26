import { UserRole } from '@repo/shared-types'
import { canAssignRole } from '../role-hierarchy.constants'

describe('canAssignRole', () => {
  it('allows inviting a strictly lower role', () => {
    expect(canAssignRole(UserRole.OWNER, UserRole.ADMIN)).toBe(true)
    expect(canAssignRole(UserRole.MANAGER, UserRole.SALES_REP)).toBe(true)
  })

  it('forbids inviting an equal role', () => {
    expect(canAssignRole(UserRole.MANAGER, UserRole.MANAGER)).toBe(false)
  })

  it('forbids inviting a higher role (privilege escalation)', () => {
    expect(canAssignRole(UserRole.MANAGER, UserRole.OWNER)).toBe(false)
    expect(canAssignRole(UserRole.ADMIN, UserRole.OWNER)).toBe(false)
  })

  it('always forbids inviting SUPER_ADMIN, even by an OWNER', () => {
    expect(canAssignRole(UserRole.OWNER, UserRole.SUPER_ADMIN)).toBe(false)
    expect(canAssignRole(UserRole.SUPER_ADMIN, UserRole.SUPER_ADMIN)).toBe(false)
  })
})
