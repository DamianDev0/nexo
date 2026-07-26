import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { UserRole } from '@repo/shared-types'
import { ROLE_HIERARCHY } from '@repo/shared-utils'
import { ROLES_KEY } from '@/shared/decorators/roles.decorator'

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ])

    if (!requiredRoles || requiredRoles.length === 0) return true

    const req = ctx.switchToHttp().getRequest<{ user?: { role: UserRole } }>()
    const userRole = req.user?.role

    if (!userRole) throw new ForbiddenException('Insufficient permissions')

    const userLevel = ROLE_HIERARCHY[userRole] ?? 0
    const hasAccess = requiredRoles.some((r) => userLevel >= ROLE_HIERARCHY[r])

    if (!hasAccess) throw new ForbiddenException('Insufficient permissions')

    return true
  }
}
