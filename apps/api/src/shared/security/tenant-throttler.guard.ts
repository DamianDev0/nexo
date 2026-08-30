import { Injectable } from '@nestjs/common'
import { ThrottlerGuard } from '@nestjs/throttler'

import type { Request } from 'express'

type ThrottledRequest = Request & { user?: { id?: string; sub?: string } }

@Injectable()
export class TenantThrottlerGuard extends ThrottlerGuard {
  protected getTracker(req: ThrottledRequest): Promise<string> {
    const tenant = req.tenantContext?.tenantId
    const user = req.user?.id ?? req.user?.sub
    return Promise.resolve(tenant ?? user ?? req.ip ?? 'anonymous')
  }
}
