import type { Request } from 'express'

import type { AuthenticatedUser, TenantContext } from '@repo/shared-types'

export type { AuthenticatedUser } from '@repo/shared-types'

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser
  tenantContext: TenantContext
}
