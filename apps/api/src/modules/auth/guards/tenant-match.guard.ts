import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { IS_PUBLIC_KEY } from '@/shared/decorators/public.decorator'

interface TenantScopedRequest {
  user?: { tenantId: string; schemaName: string }
  tenantContext?: { tenantId: string; schemaName: string }
}

@Injectable()
export class TenantMatchGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ])
    if (isPublic) return true

    const req = ctx.switchToHttp().getRequest<TenantScopedRequest>()
    const user = req.user
    const tenant = req.tenantContext

    if (!user || !tenant) return true

    if (user.tenantId !== tenant.tenantId || user.schemaName !== tenant.schemaName) {
      throw new ForbiddenException('Token does not belong to this tenant')
    }

    return true
  }
}
