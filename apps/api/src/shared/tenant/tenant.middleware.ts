import { Injectable, NestMiddleware, NotFoundException, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import type { Request, Response, NextFunction } from 'express'

import { Tenant } from '@/modules/tenants/entities/tenant.entity'
import { CacheService } from '@/shared/cache/cache.service'
import type { PlanName, TenantContext } from '@repo/shared-types'
import { CACHE_TTL_SHORT_SECONDS } from '@/shared/cache/cache.constants'

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  private readonly logger = new Logger(TenantMiddleware.name)
  private readonly isProduction: boolean

  constructor(
    @InjectRepository(Tenant)
    private readonly tenantRepo: Repository<Tenant>,
    private readonly cache: CacheService,
    private readonly config: ConfigService,
  ) {
    this.isProduction = config.get<string>('app.nodeEnv') === 'production'
  }

  async use(req: Request, _res: Response, next: NextFunction) {
    const host = req.headers.host ?? ''
    const hostname = host.split(':')[0] ?? ''
    const parts = hostname.split('.')

    let subdomain: string | undefined

    const isDirectAccess = parts.length < 2 || hostname === 'localhost' || hostname === '127.0.0.1'

    if (!isDirectAccess) {
      const candidate = parts[0]
      if (candidate && candidate !== 'www' && candidate !== 'api') {
        subdomain = candidate
      }
    }

    if (!subdomain && !this.isProduction) {
      const headerSlug = req.headers['x-tenant-slug']
      if (typeof headerSlug === 'string' && headerSlug) {
        subdomain = headerSlug
      }
    }

    if (!subdomain) {
      return next()
    }

    const cacheKey = `tenant:slug:${subdomain}`
    let tenantContext = await this.cache.get<TenantContext>(cacheKey)

    if (!tenantContext) {
      const tenant = await this.tenantRepo.findOne({
        where: { slug: subdomain, isActive: true },
        relations: ['plan'],
      })

      if (!tenant) {
        throw new NotFoundException('Tenant not found')
      }

      tenantContext = {
        tenantId: tenant.id,
        slug: tenant.slug,
        schemaName: tenant.schemaName,
        plan: tenant.plan.name as PlanName,
        config: tenant.config,
        productName: tenant.productName ?? 'NexoCRM',
        customDomain: tenant.customDomain ?? null,
      }

      await this.cache.set(cacheKey, tenantContext, CACHE_TTL_SHORT_SECONDS)
      this.logger.debug(`Tenant resolved: ${subdomain} → ${tenant.schemaName}`)
    }

    req.tenantContext = tenantContext ?? undefined
    next()
  }
}
