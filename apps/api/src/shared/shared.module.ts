import { Global, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { CacheService } from './cache/cache.service'
import { TenantDbService } from './database/tenant-db.service'
import { Tenant } from '@/modules/tenants/entities/tenant.entity'
import { Plan } from '@/modules/tenants/entities/plan.entity'

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Tenant, Plan])],
  providers: [CacheService, TenantDbService],
  exports: [CacheService, TenantDbService, TypeOrmModule],
})
export class SharedModule {}
