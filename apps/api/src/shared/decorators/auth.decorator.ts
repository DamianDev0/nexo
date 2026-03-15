import { applyDecorators } from '@nestjs/common'
import { ApiBearerAuth } from '@nestjs/swagger'
import type { UserRole } from '@repo/shared-types'
import { Roles } from './roles.decorator'

/**
 * Composed decorator — marks an endpoint as requiring JWT auth.
 * Optionally restricts access to a minimum role level (hierarchy-based).
 *
 * Guards (JwtAuthGuard, RolesGuard) are already global — this decorator
 * only sets metadata and wires the Swagger lock icon.
 *
 * @example
 *   @Auth()                    — any authenticated user
 *   @Auth(UserRole.MANAGER)    — MANAGER, ADMIN, or OWNER
 *   @Auth(UserRole.OWNER)      — OWNER only
 */
export const Auth = (...roles: UserRole[]) => {
  const decorators = [ApiBearerAuth()]
  if (roles.length > 0) {
    decorators.push(Roles(...roles))
  }
  return applyDecorators(...decorators)
}
