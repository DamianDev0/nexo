import { Injectable, BadRequestException } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import type { ExecutionContext } from '@nestjs/common'
import type { Request } from 'express'

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

@Injectable()
export class GoogleCallbackGuard extends AuthGuard('google') {}
