import { applyDecorators, HttpCode } from '@nestjs/common'
import { ApiOperation, ApiParam } from '@nestjs/swagger'
import type { UserRole } from '@repo/shared-types'
import { Auth } from './auth.decorator'

type ApiEndpointOptions = {
  summary: string
  roles?: UserRole[]
  param?: string
  status?: number
}

export const ApiEndpoint = ({ summary, roles = [], param, status }: ApiEndpointOptions) => {
  const decorators = [Auth(...roles), ApiOperation({ summary })]
  if (param) decorators.push(ApiParam({ name: 'id', description: param }))
  if (status !== undefined) decorators.push(HttpCode(status))
  return applyDecorators(...decorators)
}
