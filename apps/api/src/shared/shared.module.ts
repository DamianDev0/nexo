import { Global, Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ThrottlerModule } from '@nestjs/throttler'
import { EventEmitterModule } from '@nestjs/event-emitter'

import { createTypeOrmOptions } from '@/config/database.config'
import { createThrottlerOptions } from '@/config/throttler.config'
import { Tenant } from '@/modules/tenants/entities/tenant.entity'
import { Plan } from '@/modules/tenants/entities/plan.entity'
import { ResendModule } from './integrations/resend/resend.module'
import { S3Module } from './integrations/aws/s3.module'
import { CacheService } from './cache/cache.service'
import { TenantDbService } from './database/tenant-db.service'
import { TenantMigrationService } from './database/tenant-migration.service'
import { PasswordService } from './security/password.service'
import { EventBusService } from './events/event-bus.service'
import { CsvExportService } from './csv/csv-export.service'
import { CsvParseService } from './csv/csv-parse.service'
import { ImportsModule } from './imports/imports.module'
import { QueueModule } from './queue/queue.module'
import { DuplicateDetectionService } from './duplicate-detection/duplicate-detection.service'

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
    ResendModule,
    S3Module,
    ImportsModule,
    QueueModule,
  ],
  providers: [
    CacheService,
    TenantDbService,
    TenantMigrationService,
    PasswordService,
    EventBusService,
    CsvExportService,
    CsvParseService,
    DuplicateDetectionService,
  ],
  exports: [
    CacheService,
    TenantDbService,
    TypeOrmModule,
    PasswordService,
    EventBusService,
    CsvExportService,
    CsvParseService,
    DuplicateDetectionService,
  ],
})
export class SharedModule {}
