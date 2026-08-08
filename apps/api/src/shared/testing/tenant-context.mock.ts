import { PlanName } from '@repo/shared-types'
import type { AuthenticatedUser, TenantContext } from '@repo/shared-types'

export function makeTenantContext(overrides: Partial<TenantContext> = {}): TenantContext {
  return {
    tenantId: 'tenant-1',
    slug: 'acme',
    schemaName: 'tenant_acme',
    plan: PlanName.FREE,
    config: {},
    productName: 'NexoCRM',
    customDomain: null,
    ...overrides,
  }
}

export function makeAuthenticatedUser(
  overrides: Partial<AuthenticatedUser> = {},
): AuthenticatedUser {
  return {
    id: 'user-1',
    email: 'a@b.co',
    role: 'sales_rep' as AuthenticatedUser['role'],
    tenantId: 'tenant-1',
    schemaName: 'tenant_acme',
    ...overrides,
  }
}
