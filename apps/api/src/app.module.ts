import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'

import { appConfig } from './config/app.config'
import { databaseConfig } from './config/database.config'
import { redisConfig } from './config/redis.config'
import { SharedModule } from './shared/shared.module'
import { TenantMiddleware } from './shared/tenant/tenant.middleware'
import { TenantsModule } from './modules/tenants/tenants.module'
import { Tenant } from './modules/tenants/entities/tenant.entity'
import { Plan } from './modules/tenants/entities/plan.entity'
import { AppController } from './app.controller'
import { AppService } from './app.service'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, redisConfig],
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const db = config.get('database')
        return {
          type: 'postgres' as const,
          host: db.host,
          port: db.port,
          username: db.username,
          password: db.password,
          database: db.database,
          entities: [Tenant, Plan],
          synchronize: config.get<string>('app.nodeEnv') === 'development',
          logging: config.get<string>('app.nodeEnv') === 'development',
        }
      },
    }),

    SharedModule,
    TenantsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantMiddleware).forRoutes('*path')
  }
}
