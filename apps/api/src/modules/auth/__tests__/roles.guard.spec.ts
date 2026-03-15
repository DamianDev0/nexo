import { ForbiddenException } from '@nestjs/common'
import { type Reflector } from '@nestjs/core'
import { type ExecutionContext } from '@nestjs/common'
import { UserRole } from '@repo/shared-types'
import { RolesGuard } from '../guards/roles.guard'

function buildContext(
  userRole: UserRole | undefined,
  _requiredRoles: UserRole[] | undefined,
): ExecutionContext {
  return {
    getHandler: () => ({}),
    getClass: () => ({}),
    switchToHttp: () => ({
      getRequest: () => ({ user: userRole ? { role: userRole } : undefined }),
    }),
  } as unknown as ExecutionContext
}

function buildReflector(roles: UserRole[] | undefined): Reflector {
  return {
    getAllAndOverride: jest.fn().mockReturnValue(roles),
  } as unknown as Reflector
}

describe('RolesGuard', () => {
  it('allows access when no roles are required', () => {
    const guard = new RolesGuard(buildReflector(undefined))
    const ctx = buildContext(UserRole.VIEWER, undefined)
    expect(guard.canActivate(ctx)).toBe(true)
  })

  it('allows access when required roles array is empty', () => {
    const guard = new RolesGuard(buildReflector([]))
    const ctx = buildContext(UserRole.VIEWER, [])
    expect(guard.canActivate(ctx)).toBe(true)
  })

  it('throws ForbiddenException when request has no user', () => {
    const guard = new RolesGuard(buildReflector([UserRole.ADMIN]))
    const ctx = buildContext(undefined, [UserRole.ADMIN])
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException)
  })

  it('allows exact role match', () => {
    const guard = new RolesGuard(buildReflector([UserRole.MANAGER]))
    const ctx = buildContext(UserRole.MANAGER, [UserRole.MANAGER])
    expect(guard.canActivate(ctx)).toBe(true)
  })

  it('allows higher role to access lower-role route (hierarchy)', () => {
    const guard = new RolesGuard(buildReflector([UserRole.VIEWER]))
    const ctx = buildContext(UserRole.OWNER, [UserRole.VIEWER])
    expect(guard.canActivate(ctx)).toBe(true)
  })

  it('throws ForbiddenException when user role is below required', () => {
    const guard = new RolesGuard(buildReflector([UserRole.ADMIN]))
    const ctx = buildContext(UserRole.SALES_REP, [UserRole.ADMIN])
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException)
  })

  it('allows OWNER on MANAGER route', () => {
    const guard = new RolesGuard(buildReflector([UserRole.MANAGER]))
    const ctx = buildContext(UserRole.OWNER, [UserRole.MANAGER])
    expect(guard.canActivate(ctx)).toBe(true)
  })

  it('denies VIEWER on SALES_REP route', () => {
    const guard = new RolesGuard(buildReflector([UserRole.SALES_REP]))
    const ctx = buildContext(UserRole.VIEWER, [UserRole.SALES_REP])
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException)
  })

  it('grants access if user satisfies any one of multiple required roles', () => {
    const guard = new RolesGuard(buildReflector([UserRole.ADMIN, UserRole.MANAGER]))
    const ctx = buildContext(UserRole.MANAGER, [UserRole.ADMIN, UserRole.MANAGER])
    expect(guard.canActivate(ctx)).toBe(true)
  })
})
