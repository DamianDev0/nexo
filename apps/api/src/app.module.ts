import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { ThrottlerGuard } from '@nestjs/throttler'
import { LoggerModule } from 'nestjs-pino'

import { appConfig } from '@/config/app.config'
import { databaseConfig } from '@/config/database.config'
import { redisConfig } from '@/config/redis.config'
import { jwtConfig } from '@/config/jwt.config'
import { createLoggerOptions } from '@/config/logger.config'
import { validateEnv } from '@/config/env.validation'

import { SharedModule } from '@/shared/shared.module'
import { TenantMiddleware } from '@/shared/tenant/tenant.middleware'

import { TenantsModule } from '@/modules/tenants/tenants.module'
import { AuthModule } from '@/modules/auth/auth.module'
import { UsersModule } from '@/modules/users/users.module'
import { SettingsModule } from '@/modules/settings/settings.module'
import { ContactsModule } from '@/modules/contacts/contacts.module'
import { CompaniesModule } from '@/modules/companies/companies.module'
import { DealsModule } from '@/modules/deals/deals.module'
import { ActivitiesModule } from '@/modules/activities/activities.module'
import { ProductsModule } from '@/modules/products/products.module'
import { NotificationsModule } from '@/modules/notifications/notifications.module'
import { DashboardModule } from '@/modules/dashboard/dashboard.module'
import { TagsModule } from '@/modules/tags/tags.module'
import { MessageTemplatesModule } from '@/modules/message-templates/message-templates.module'
import { SavedFiltersModule } from '@/modules/saved-filters/saved-filters.module'
import { TimelineModule } from '@/modules/timeline/timeline.module'
import { BulkActionsModule } from '@/modules/bulk-actions/bulk-actions.module'
import { WebhooksModule } from '@/modules/webhooks/webhooks.module'
import { ApiKeysModule } from '@/modules/api-keys/api-keys.module'
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard'
import { RolesGuard } from '@/modules/auth/guards/roles.guard'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, redisConfig, jwtConfig],
      validate: validateEnv,
    }),
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: createLoggerOptions,
    }),
    SharedModule,
    TenantsModule,
    AuthModule,
    UsersModule,
    SettingsModule,
    ContactsModule,
    CompaniesModule,
    DealsModule,
    ActivitiesModule,
    ProductsModule,
    NotificationsModule,
    DashboardModule,
    TagsModule,
    MessageTemplatesModule,
    SavedFiltersModule,
    TimelineModule,
    BulkActionsModule,
    WebhooksModule,
    ApiKeysModule,
  ],
  providers: [
    // Global guards — order matters: Throttler → JWT → Roles
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(TenantMiddleware).forRoutes('*path')
  }
}
