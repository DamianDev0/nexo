import { ForbiddenException, type ExecutionContext } from '@nestjs/common'
import { type Reflector } from '@nestjs/core'
import { UserRole } from '@repo/shared-types'
import type { AuthenticatedUser, TenantContext } from '@repo/shared-types'
import { TenantMatchGuard } from '../guards/tenant-match.guard'
import { IS_PUBLIC_KEY } from '@/shared/decorators/public.decorator'

function buildReflector(isPublic: boolean): Reflector {
  return {
    getAllAndOverride: jest.fn((key) => (key === IS_PUBLIC_KEY ? isPublic : undefined)),
  } as unknown as Reflector
}

function buildContext(req: {
  user?: Partial<AuthenticatedUser>
  tenantContext?: Partial<TenantContext>
}): ExecutionContext {
  return {
    getHandler: () => ({}),
    getClass: () => ({}),
    switchToHttp: () => ({ getRequest: () => req }),
  } as unknown as ExecutionContext
}

const userA: AuthenticatedUser = {
  id: 'u1',
  email: 'a@acme.co',
  role: UserRole.ADMIN,
  tenantId: 'tenant-acme',
  schemaName: 'tenant_acme',
}

const ctxAcme: Partial<TenantContext> = {
  tenantId: 'tenant-acme',
  schemaName: 'tenant_acme',
}

const ctxVictim: Partial<TenantContext> = {
  tenantId: 'tenant-victim',
  schemaName: 'tenant_victim',
}

describe('TenantMatchGuard', () => {
  it('allows @Public() routes without inspecting tenant', () => {
    const guard = new TenantMatchGuard(buildReflector(true))
    expect(guard.canActivate(buildContext({}))).toBe(true)
  })

  it('allows when there is no authenticated user (unauthenticated/public slip-through)', () => {
    const guard = new TenantMatchGuard(buildReflector(false))
    expect(guard.canActivate(buildContext({ tenantContext: ctxAcme }))).toBe(true)
  })

  it('allows when request is not tenant-scoped (no tenantContext)', () => {
    const guard = new TenantMatchGuard(buildReflector(false))
    expect(guard.canActivate(buildContext({ user: userA }))).toBe(true)
  })

  it('allows when the JWT tenant matches the subdomain tenant', () => {
    const guard = new TenantMatchGuard(buildReflector(false))
    expect(guard.canActivate(buildContext({ user: userA, tenantContext: ctxAcme }))).toBe(true)
  })

  it('BLOCKS the cross-tenant attack: tenant-A token against tenant-B subdomain', () => {
    const guard = new TenantMatchGuard(buildReflector(false))
    expect(() =>
      guard.canActivate(buildContext({ user: userA, tenantContext: ctxVictim })),
    ).toThrow(ForbiddenException)
  })

  it('blocks when only schemaName drifts from the matching tenantId', () => {
    const guard = new TenantMatchGuard(buildReflector(false))
    const drifted: Partial<TenantContext> = { tenantId: 'tenant-acme', schemaName: 'tenant_other' }
    expect(() => guard.canActivate(buildContext({ user: userA, tenantContext: drifted }))).toThrow(
      ForbiddenException,
    )
  })
})
