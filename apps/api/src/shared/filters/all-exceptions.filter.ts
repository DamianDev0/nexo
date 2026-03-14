import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common'
import type { Request, Response } from 'express'
import { QueryFailedError } from 'typeorm'

import type { ApiErrorResponse } from '../interfaces/api-response.interface'

/**
 * Catch-all filter for any unhandled exception that slips past
 * HttpExceptionFilter and TypeOrmExceptionFilter.
 *
 * This ensures the client ALWAYS gets a standardized JSON response,
 * even for unexpected crashes.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name)

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()

    // Skip if already handled by a more specific filter
    if (exception instanceof HttpException || exception instanceof QueryFailedError) {
      throw exception
    }

    const status = HttpStatus.INTERNAL_SERVER_ERROR

    this.logger.error(
      `${request.method} ${request.url} → Unhandled exception`,
      exception instanceof Error ? exception.stack : String(exception),
    )

    const errorResponse: ApiErrorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: 'An unexpected error occurred',
      error: 'INTERNAL_SERVER_ERROR',
    }

    response.status(status).json(errorResponse)
  }
}
