import { Injectable, NestMiddleware, NotFoundException, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectRepository } from '@nestjs/typeorm'
import { verify } from 'jsonwebtoken'
import { Repository } from 'typeorm'
import type { Request, Response, NextFunction } from 'express'

import { Tenant } from '@/modules/tenants/entities/tenant.entity'
import { CacheService } from '@/shared/cache/cache.service'
import type { JwtPayload, PlanName, TenantContext } from '@repo/shared-types'
import { CACHE_TTL_SHORT_SECONDS } from '@/shared/cache/cache.constants'

const EXPIRED_TOKEN_GRACE_SECONDS = 7 * 24 * 60 * 60

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  private readonly logger = new Logger(TenantMiddleware.name)
  private readonly isProduction: boolean
  private readonly jwtPublicKey: string

  constructor(
    @InjectRepository(Tenant)
    private readonly tenantRepo: Repository<Tenant>,
    private readonly cache: CacheService,
    private readonly config: ConfigService,
  ) {
    this.isProduction = config.get<string>('app.nodeEnv') === 'production'
    this.jwtPublicKey = config.get<string>('jwt.publicKey') ?? ''
  }

  async use(req: Request, _res: Response, next: NextFunction) {
    const subdomain = this.subdomainFrom(req)

    const tenantContext = subdomain
      ? await this.resolveBySlug(subdomain)
      : await this.resolveFromToken(req)

    req.tenantContext = tenantContext ?? undefined
    next()
  }

  private subdomainFrom(req: Request): string | undefined {
    const host = req.headers.host ?? ''
    const hostname = host.split(':')[0] ?? ''
    const parts = hostname.split('.')

    const isDirectAccess = parts.length < 2 || hostname === 'localhost' || hostname === '127.0.0.1'

    if (!isDirectAccess) {
      const candidate = parts[0]
      if (candidate && candidate !== 'www' && candidate !== 'api') {
        return candidate
      }
    }

    if (!this.isProduction) {
      const headerSlug = req.headers['x-tenant-slug']
      if (typeof headerSlug === 'string' && headerSlug) {
        return headerSlug
      }
    }

    return undefined
  }

  private tenantIdFromToken(req: Request): string | null {
    const cookies = req.cookies as Record<string, string> | undefined
    const bearer = req.headers.authorization?.replace(/^Bearer /, '')
    const token = bearer ?? cookies?.['access_token']
    if (!token || !this.jwtPublicKey) return null

    try {
      const payload = verify(token, this.jwtPublicKey, {
        algorithms: ['RS256'],
        ignoreExpiration: true,
      }) as JwtPayload
      const expiredForSeconds = Math.floor(Date.now() / 1000) - (payload.exp ?? 0)
      if (expiredForSeconds > EXPIRED_TOKEN_GRACE_SECONDS) return null
      return payload.tenantId ?? null
    } catch {
      return null
    }
  }

  private async resolveBySlug(slug: string): Promise<TenantContext | null> {
    const cacheKey = `tenant:slug:${slug}`
    const cached = await this.cache.get<TenantContext>(cacheKey)
    if (cached) return cached

    const tenant = await this.tenantRepo.findOne({
      where: { slug, isActive: true },
      relations: ['plan'],
    })
    if (!tenant) {
      throw new NotFoundException('Tenant not found')
    }

    const context = this.buildContext(tenant)
    await this.cache.set(cacheKey, context, CACHE_TTL_SHORT_SECONDS)
    this.logger.debug(`Tenant resolved: ${slug} → ${tenant.schemaName}`)
    return context
  }

  private async resolveFromToken(req: Request): Promise<TenantContext | null> {
    const tenantId = this.tenantIdFromToken(req)
    if (!tenantId) return null

    const cacheKey = `tenant:id:${tenantId}`
    const cached = await this.cache.get<TenantContext>(cacheKey)
    if (cached) return cached

    const tenant = await this.tenantRepo.findOne({
      where: { id: tenantId, isActive: true },
      relations: ['plan'],
    })
    if (!tenant) return null

    const context = this.buildContext(tenant)
    await this.cache.set(cacheKey, context, CACHE_TTL_SHORT_SECONDS)
    this.logger.debug(`Tenant resolved from token: ${tenant.slug} → ${tenant.schemaName}`)
    return context
  }

  private buildContext(tenant: Tenant): TenantContext {
    return {
      tenantId: tenant.id,
      slug: tenant.slug,
      schemaName: tenant.schemaName,
      plan: tenant.plan.name as PlanName,
      config: tenant.config,
      productName: tenant.productName ?? 'NexoCRM',
      customDomain: tenant.customDomain ?? null,
    }
  }
}
