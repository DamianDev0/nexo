import { Global, Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ThrottlerModule } from '@nestjs/throttler'

import { createTypeOrmOptions } from '@/config/database.config'
import { createThrottlerOptions } from '@/config/throttler.config'
import { Tenant } from '@/modules/tenants/entities/tenant.entity'
import { Plan } from '@/modules/tenants/entities/plan.entity'
import { CacheService } from './cache/cache.service'
import { TenantDbService } from './database/tenant-db.service'

@Global()
@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: createThrottlerOptions,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: createTypeOrmOptions,
    }),
    TypeOrmModule.forFeature([Tenant, Plan]),
  ],
  providers: [CacheService, TenantDbService],
  exports: [CacheService, TenantDbService, TypeOrmModule],
})
export class SharedModule {}
