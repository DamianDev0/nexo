import type { TenantContext } from '@repo/shared-types'

declare global {
  namespace Express {
    interface Request {
      tenantContext?: TenantContext
    }
  }
}
