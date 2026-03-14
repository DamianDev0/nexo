import {
  Injectable,
  NestMiddleware,
  NotFoundException,
  Logger,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import type { Request, Response, NextFunction } from 'express'

import { Tenant } from '@/modules/tenants/entities/tenant.entity'
import { CacheService } from '@/shared/cache/cache.service'
import type { TenantContext } from '@repo/shared-types'

const TENANT_CACHE_TTL = 300 // 5 minutes

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  private readonly logger = new Logger(TenantMiddleware.name)

  constructor(
    @InjectRepository(Tenant)
    private readonly tenantRepo: Repository<Tenant>,
    private readonly cache: CacheService,
  ) {}

  async use(req: Request, _res: Response, next: NextFunction) {
    const host = req.headers.host ?? ''
    const hostname = host.split(':')[0] ?? '' // Strip port
    const parts = hostname.split('.')

    // Skip tenant resolution for platform-level routes or direct IP/localhost access
    if (parts.length < 2 || hostname === 'localhost' || hostname === '127.0.0.1') {
      return next()
    }

    const subdomain = parts[0]

    if (!subdomain || subdomain === 'www' || subdomain === 'api') {
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
        schemaName: tenant.schemaName,
        plan: tenant.plan.name,
        config: tenant.config,
      }

      await this.cache.set(cacheKey, tenantContext, TENANT_CACHE_TTL)
      this.logger.debug(`Tenant resolved: ${subdomain} → ${tenant.schemaName}`)
    }

    ;(req as any).tenantContext = tenantContext
    next()
  }
}
