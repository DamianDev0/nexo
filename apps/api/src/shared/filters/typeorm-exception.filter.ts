import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common'
import type { Request, Response } from 'express'
import { QueryFailedError } from 'typeorm'

import type { ApiErrorResponse } from '../interfaces/api-response.interface'

/**
 * Catches TypeORM QueryFailedError and maps PostgreSQL error codes
 * to appropriate HTTP responses with human-readable messages.
 */
@Catch(QueryFailedError)
export class TypeOrmExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(TypeOrmExceptionFilter.name)

  catch(exception: QueryFailedError, host: ArgumentsHost): void {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()

    const pgError = exception.driverError as { code?: string; detail?: string; constraint?: string }
    const pgCode = pgError?.code ?? 'UNKNOWN'

    const { status, message, error } = this.mapPostgresError(pgCode, pgError?.detail)

    const errorResponse: ApiErrorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
      error,
    }

    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.url} → DB Error [${pgCode}]: ${exception.message}`,
        exception.stack,
      )
    }

    response.status(status).json(errorResponse)
  }

  private mapPostgresError(
    code: string,
    detail?: string,
  ): { status: number; message: string; error: string } {
    const map: Record<string, { status: number; message: string; error: string }> = {
      // Unique constraint violation
      '23505': {
        status: HttpStatus.CONFLICT,
        message: detail
          ? `A record with that value already exists: ${this.extractField(detail)}`
          : 'A record with that value already exists',
        error: 'CONFLICT',
      },
      // Foreign key constraint violation
      '23503': {
        status: HttpStatus.BAD_REQUEST,
        message: 'Referenced record does not exist',
        error: 'FOREIGN_KEY_VIOLATION',
      },
      // Not null violation
      '23502': {
        status: HttpStatus.BAD_REQUEST,
        message: 'A required field is missing',
        error: 'NOT_NULL_VIOLATION',
      },
      // Check constraint violation
      '23514': {
        status: HttpStatus.BAD_REQUEST,
        message: 'Value does not meet the required constraints',
        error: 'CHECK_VIOLATION',
      },
      // String data right truncation
      '22001': {
        status: HttpStatus.BAD_REQUEST,
        message: 'Value is too long for the field',
        error: 'VALUE_TOO_LONG',
      },
      // Invalid text representation (e.g., invalid UUID)
      '22P02': {
        status: HttpStatus.BAD_REQUEST,
        message: 'Invalid data format',
        error: 'INVALID_FORMAT',
      },
    }

    return map[code] ?? {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'An unexpected database error occurred',
      error: 'DATABASE_ERROR',
    }
  }

  /**
   * Extracts the field name from PostgreSQL's detail message.
   * e.g., "Key (email)=(test@test.com) already exists" → "email"
   */
  private extractField(detail: string): string {
    const match = detail.match(/Key \((.+?)\)/)
    return match?.[1] ?? 'unknown'
  }
}
