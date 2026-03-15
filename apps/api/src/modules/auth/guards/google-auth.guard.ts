import { Injectable, BadRequestException } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import type { ExecutionContext } from '@nestjs/common'
import type { Request } from 'express'

/**
 * Used on GET /auth/google to initiate the OAuth flow.
 * Reads ?slug= from the query string and encodes it as a base64 JSON
 * state parameter so the tenant context survives the Google redirect.
 */
@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  override getAuthenticateOptions(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest<Request>()
    const slug = req.query['slug']

    if (!slug || typeof slug !== 'string') {
      throw new BadRequestException('Missing required query parameter: slug')
    }

    const state = Buffer.from(JSON.stringify({ slug })).toString('base64')
    return { state }
  }
}

/**
 * Used on GET /auth/google/callback — just handles the passport callback,
 * no custom options needed.
 */
@Injectable()
export class GoogleCallbackGuard extends AuthGuard('google') {}
