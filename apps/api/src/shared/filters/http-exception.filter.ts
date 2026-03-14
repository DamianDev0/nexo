import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common'
import type { Request, Response } from 'express'

import type {
  ApiErrorResponse,
  ApiValidationErrorResponse,
  ValidationErrorDetail,
} from '../interfaces/api-response.interface'

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name)

  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()
    const status = exception.getStatus()
    const exceptionResponse = exception.getResponse()

    const base = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
    }

    // ─── VALIDATION ERRORS (400) ──────────────────────────────────
    if (status === HttpStatus.BAD_REQUEST && this.isValidationError(exceptionResponse)) {
      const validationResponse: ApiValidationErrorResponse = {
        ...base,
        message: 'Validation failed',
        error: 'BAD_REQUEST',
        errors: this.extractValidationErrors(exceptionResponse as object),
      }
      response.status(status).json(validationResponse)
      return
    }

    // ─── ALL OTHER HTTP ERRORS ────────────────────────────────────
    const errorResponse: ApiErrorResponse = {
      ...base,
      message: this.extractMessage(exceptionResponse, exception),
      error: this.extractErrorCode(status),
    }

    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.url} → ${status}: ${errorResponse.message}`,
        exception.stack,
      )
    }

    response.status(status).json(errorResponse)
  }

  private isValidationError(exceptionResponse: string | object): boolean {
    if (typeof exceptionResponse !== 'object' || !('message' in exceptionResponse)) {
      return false
    }
    return Array.isArray((exceptionResponse as { message: unknown }).message)
  }

  private extractMessage(exceptionResponse: string | object, exception: HttpException): string {
    if (typeof exceptionResponse === 'string') return exceptionResponse

    if (typeof exceptionResponse === 'object' && 'message' in exceptionResponse) {
      const msg = (exceptionResponse as { message: string | string[] }).message
      if (typeof msg === 'string') return msg
      if (Array.isArray(msg)) return msg[0] ?? exception.message
    }

    return exception.message
  }

  private extractErrorCode(status: number): string {
    const codeMap: Record<number, string> = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      422: 'UNPROCESSABLE_ENTITY',
      429: 'TOO_MANY_REQUESTS',
      500: 'INTERNAL_SERVER_ERROR',
      502: 'BAD_GATEWAY',
      503: 'SERVICE_UNAVAILABLE',
      504: 'GATEWAY_TIMEOUT',
    }

    return codeMap[status] ?? (HttpStatus[status] ?? 'UNKNOWN_ERROR')
  }

  private extractValidationErrors(exceptionResponse: object): ValidationErrorDetail[] {
    const messages = (exceptionResponse as { message: string[] }).message

    return messages.map((msg) => {
      // class-validator messages typically start with the property name
      // e.g. "slug must be longer than or equal to 3 characters"
      const spaceIndex = msg.indexOf(' ')
      const field = spaceIndex > 0 ? msg.substring(0, spaceIndex) : 'unknown'

      return {
        field,
        message: msg,
      }
    })
  }
}
