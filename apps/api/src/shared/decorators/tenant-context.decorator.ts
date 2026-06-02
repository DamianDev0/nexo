import { createParamDecorator, type ExecutionContext } from '@nestjs/common'
import { type TenantContext } from '@repo/shared-types'

export const TenantCtx = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): TenantContext => {
    const request = ctx.switchToHttp().getRequest<{ tenantContext: TenantContext }>()
    return request.tenantContext
  },
)
