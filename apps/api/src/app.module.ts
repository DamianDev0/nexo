import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler'
import { LoggerModule } from 'nestjs-pino'

import { appConfig } from './config/app.config'
import { databaseConfig } from './config/database.config'
import { redisConfig } from './config/redis.config'
import { jwtConfig } from './config/jwt.config'
import { SharedModule } from './shared/shared.module'
import { TenantMiddleware } from './shared/tenant/tenant.middleware'
import { TenantsModule } from './modules/tenants/tenants.module'
import { AuthModule } from './modules/auth/auth.module'
import { Tenant } from './modules/tenants/entities/tenant.entity'
import { Plan } from './modules/tenants/entities/plan.entity'
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard'
import { RolesGuard } from './modules/auth/guards/roles.guard'
import { AppController } from './app.controller'
import { AppService } from './app.service'

@Module({
  imports: [
    // ── Config ───────────────────────────────────────────────────────────────
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, redisConfig, jwtConfig],
    }),

    // ── Logging (Pino) ────────────────────────────────────────────────────────
    // Structured JSON in production, pretty-printed in development
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const isDev = config.get<string>('app.nodeEnv') !== 'production'
        return {
          pinoHttp: {
            level: isDev ? 'debug' : 'info',
            // Pretty logging in development only — never in production
            transport: isDev
              ? { target: 'pino-pretty', options: { colorize: true, singleLine: true } }
              : undefined,
            // Redact sensitive fields from logs
            redact: {
              paths: ['req.headers.authorization', 'req.headers.cookie', 'req.body.password'],
              remove: true,
            },
            // Custom serializers
            serializers: {
              req: (req: { method: string; url: string }) => ({
                method: req.method,
                url: req.url,
              }),
            },
          },
        }
      },
    }),

    // ── Rate limiting (Throttler) ─────────────────────────────────────────────
    // Default: 100 requests per 60 seconds per IP
    // Override with @Throttle() or @SkipThrottle() on specific endpoints
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        throttlers: [
          {
            name: 'default',
            ttl: 60_000, // 60 seconds window (ms)
            limit: config.get<string>('app.nodeEnv') === 'production' ? 100 : 1000,
          },
        ],
      }),
    }),

    // ── Database ──────────────────────────────────────────────────────────────
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

    // ── Feature modules ───────────────────────────────────────────────────────
    SharedModule,
    TenantsModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Global guards — order matters: Throttler → JWT → Roles
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantMiddleware).forRoutes('*path')
  }
}
