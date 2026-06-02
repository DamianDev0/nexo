import { applyDecorators } from '@nestjs/common'
import { ApiBearerAuth } from '@nestjs/swagger'
import type { UserRole } from '@repo/shared-types'
import { Roles } from './roles.decorator'

export const Auth = (...roles: UserRole[]) => {
  const decorators = [ApiBearerAuth()]
  if (roles.length > 0) {
    decorators.push(Roles(...roles))
  }
  return applyDecorators(...decorators)
}
