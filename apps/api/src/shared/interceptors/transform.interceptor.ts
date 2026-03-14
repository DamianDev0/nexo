import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  type NestInterceptor,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import type { Request, Response } from 'express'
import type { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

import { API_RESPONSE_MESSAGE_KEY } from '../decorators/api-response-message.decorator'
import type { PaginatedResult } from '../interfaces/api-response.interface'

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>()
    const response = context.switchToHttp().getResponse<Response>()

    const customMessage = this.reflector.getAllAndOverride<string | undefined>(
      API_RESPONSE_MESSAGE_KEY,
      [context.getHandler(), context.getClass()],
    )

    const defaultMessage = this.getDefaultMessage(request.method, response.statusCode)

    return next.handle().pipe(
      map((data) => {
        const base = {
          statusCode: response.statusCode,
          timestamp: new Date().toISOString(),
          path: request.url,
          method: request.method,
          message: customMessage ?? defaultMessage,
        }

        // If the service returns a PaginatedResult, unwrap it
        if (this.isPaginatedResult(data)) {
          return {
            ...base,
            data: data.data,
            pagination: data.pagination,
          }
        }

        return { ...base, data }
      }),
    )
  }

  private isPaginatedResult(data: unknown): data is PaginatedResult<unknown> {
    if (!data || typeof data !== 'object') return false
    const obj = data as Record<string, unknown>
    return (
      Array.isArray(obj.data) &&
      obj.pagination !== undefined &&
      typeof obj.pagination === 'object'
    )
  }

  private getDefaultMessage(method: string, statusCode: number): string {
    if (statusCode === 204) return 'No content'

    const messages: Record<string, string> = {
      GET: 'Retrieved successfully',
      POST: 'Created successfully',
      PATCH: 'Updated successfully',
      PUT: 'Updated successfully',
      DELETE: 'Deleted successfully',
    }

    return messages[method] ?? 'Success'
  }
}
