import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Tenant } from '@/modules/tenants/entities/tenant.entity'
import { CacheService } from '@/shared/cache/cache.service'
import { CACHE_TTL_SHORT_SECONDS } from '@/shared/cache/cache.constants'

@Injectable()
export class TenantSchemaRepository {
  constructor(
    @InjectRepository(Tenant)
    private readonly tenants: Repository<Tenant>,
    private readonly cache: CacheService,
  ) {}

  async findSchemaName(tenantId: string): Promise<string | null> {
    const cacheKey = `tenant:schema:${tenantId}`
    const cached = await this.cache.get<string>(cacheKey)
    if (cached !== null) return cached

    const tenant = await this.tenants.findOne({
      where: { id: tenantId, isActive: true },
      select: { id: true, schemaName: true },
    })
    if (!tenant) return null

    await this.cache.set(cacheKey, tenant.schemaName, CACHE_TTL_SHORT_SECONDS)
    return tenant.schemaName
  }
}
