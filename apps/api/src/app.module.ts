import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TenantThrottlerGuard } from '@/shared/security/tenant-throttler.guard'
import { LoggerModule } from 'nestjs-pino'

import { appConfig } from '@/config/app.config'
import { databaseConfig } from '@/config/database.config'
import { redisConfig } from '@/config/redis.config'
import { jwtConfig } from '@/config/jwt.config'
import { twilioConfig } from '@/config/twilio.config'
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
import { GeoModule } from '@/modules/geo/geo.module'
import { TagsModule } from '@/modules/tags/tags.module'
import { MessageTemplatesModule } from '@/modules/message-templates/message-templates.module'
import { SavedFiltersModule } from '@/modules/saved-filters/saved-filters.module'
import { TimelineModule } from '@/modules/timeline/timeline.module'
import { BulkActionsModule } from '@/modules/bulk-actions/bulk-actions.module'
import { WebhooksModule } from '@/modules/webhooks/webhooks.module'
import { ApiKeysModule } from '@/modules/api-keys/api-keys.module'
import { AuditLogModule } from '@/modules/audit-log/audit-log.module'
import { TelephonyModule } from '@/modules/telephony/telephony.module'
import { MessagingModule } from '@/modules/messaging/messaging.module'
import { MESSAGING_WEBHOOK_PATH } from '@/modules/messaging/constants/message.constants'
import { VOICE_WEBHOOK_PATH } from '@/modules/telephony/constants/call.constants'
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard'
import { TenantMatchGuard } from '@/modules/auth/guards/tenant-match.guard'
import { RolesGuard } from '@/modules/auth/guards/roles.guard'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, redisConfig, jwtConfig, twilioConfig],
      validate: validateEnv,
    }),
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: createLoggerOptions,
    }),
    SharedModule,
    AuditLogModule,
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
    GeoModule,
    MessageTemplatesModule,
    SavedFiltersModule,
    TimelineModule,
    BulkActionsModule,
    WebhooksModule,
    ApiKeysModule,
    TelephonyModule,
    MessagingModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: TenantThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: TenantMatchGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(TenantMiddleware)
      .exclude(
        { path: `${VOICE_WEBHOOK_PATH}/{*path}`, method: RequestMethod.POST },
        { path: `${MESSAGING_WEBHOOK_PATH}/{*path}`, method: RequestMethod.POST },
      )
      .forRoutes('*path')
  }
}
