import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  SetMetadata,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { TenantConfigService } from '../services/tenant-config.service'
import type { REQUIRED_MODULES } from '../interfaces/sidebar-config.interface'

export const MODULE_KEY = 'requiredModule'

/** Decorate a controller or handler to gate access on a sidebar module being enabled. */
export const RequireModule = (key: string) => SetMetadata(MODULE_KEY, key)

@Injectable()
export class ModuleEnabledGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly configService: TenantConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const moduleKey = this.reflector.getAllAndOverride<string>(MODULE_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    if (!moduleKey) return true

    const request = context.switchToHttp().getRequest<{ tenantContext?: { tenantId: string } }>()
    const tenantId = request.tenantContext?.tenantId
    if (!tenantId) return true

    const sidebar = await this.configService.getSidebarConfig(tenantId)
    const mod = sidebar.modules.find((m) => m.key === moduleKey)

    if (!mod?.enabled) {
      throw new ForbiddenException(`Module '${moduleKey}' is disabled for this tenant`)
    }

    return true
  }
}
