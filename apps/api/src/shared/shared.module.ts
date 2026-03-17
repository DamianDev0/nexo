import { Global, Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ThrottlerModule } from '@nestjs/throttler'
import { EventEmitterModule } from '@nestjs/event-emitter'

import { createTypeOrmOptions } from '@/config/database.config'
import { createThrottlerOptions } from '@/config/throttler.config'
import { Tenant } from '@/modules/tenants/entities/tenant.entity'
import { Plan } from '@/modules/tenants/entities/plan.entity'
import { AuditLogModule } from './audit-log/audit-log.module'
import { ResendModule } from './integrations/resend/resend.module'
import { S3Module } from './integrations/aws/s3.module'
import { CacheService } from './cache/cache.service'
import { TenantDbService } from './database/tenant-db.service'
import { TenantMigrationService } from './database/tenant-migration.service'
import { PasswordService } from './security/password.service'
import { EventBusService } from './events/event-bus.service'

@Global()
@Module({
  imports: [
    EventEmitterModule.forRoot(),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: createThrottlerOptions,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: createTypeOrmOptions,
    }),
    TypeOrmModule.forFeature([Tenant, Plan]),
    AuditLogModule,
    ResendModule,
    S3Module,
  ],
  providers: [
    CacheService,
    TenantDbService,
    TenantMigrationService,
    PasswordService,
    EventBusService,
  ],
  exports: [CacheService, TenantDbService, TypeOrmModule, PasswordService, EventBusService],
})
export class SharedModule {}
