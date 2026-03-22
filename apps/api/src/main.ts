import { ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory, Reflector } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import helmet from 'helmet'
import { Logger } from 'nestjs-pino'
import cookieParser from 'cookie-parser'

import { AppModule } from './app.module'
import { AllExceptionsFilter } from './shared/filters/all-exceptions.filter'
import { HttpExceptionFilter } from './shared/filters/http-exception.filter'
import { TypeOrmExceptionFilter } from './shared/filters/typeorm-exception.filter'
import { TransformInterceptor } from './shared/interceptors/transform.interceptor'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    // Disable NestJS default logger — Pino takes over via bufferLogs
    bufferLogs: true,
  })

  // ── Pino logger ────────────────────────────────────────────────────────────
  const logger = app.get(Logger)
  app.useLogger(logger)

  const config = app.get(ConfigService)
  const cookieSecret = config.get<string>('app.cookieSecret')

  // ── Cookie parser ──────────────────────────────────────────────────────────
  app.use(cookieParser(cookieSecret))
  const port = config.get<number>('app.port', 8080)
  const nodeEnv = config.get<string>('app.nodeEnv', 'development')
  const prefix = config.get<string>('app.apiPrefix', 'api/v1')
  const swaggerPath = config.get<string>('app.swaggerPath', 'api/docs')
  const apiName = config.get<string>('app.apiName', 'NexoCRM API')
  const apiVersion = config.get<string>('app.apiVersion', '1.0')
  const frontendUrl = config.get<string>('app.frontendUrl', 'http://localhost:3001')

  // ── Security headers (Helmet) ──────────────────────────────────────────────
  // Adds: X-Content-Type-Options, X-Frame-Options, CSP, HSTS, Referrer-Policy, etc.
  // CSP and COEP disabled in development so Swagger UI loads correctly
  app.use(
    helmet({
      contentSecurityPolicy: nodeEnv === 'production',
      crossOriginEmbedderPolicy: nodeEnv === 'production',
    }),
  )

  // ── Global prefix ──────────────────────────────────────────────────────────
  app.setGlobalPrefix(prefix)

  // ── Validation pipe ────────────────────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  )

  // ── Exception filters ──────────────────────────────────────────────────────
  // Last registered = outermost (catches first)
  app.useGlobalFilters(
    new AllExceptionsFilter(),
    new TypeOrmExceptionFilter(),
    new HttpExceptionFilter(),
  )

  // ── Response transformer ───────────────────────────────────────────────────
  app.useGlobalInterceptors(new TransformInterceptor(app.get(Reflector)))

  // ── CORS ───────────────────────────────────────────────────────────────────
  app.enableCors({
    origin: frontendUrl,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-tenant-slug'],
  })

  // ── Swagger (non-production only) ──────────────────────────────────────────
  if (nodeEnv !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle(apiName)
      .setVersion(apiVersion)
      .addBearerAuth()
      .build()
    SwaggerModule.setup(swaggerPath, app, SwaggerModule.createDocument(app, swaggerConfig))
  }

  await app.listen(port)

  logger.log(`Running in ${nodeEnv} mode`, 'Bootstrap')
  logger.log(`API: http://localhost:${port}/${prefix}`, 'Bootstrap')
  if (nodeEnv !== 'production') {
    logger.log(`Swagger: http://localhost:${port}/${swaggerPath}`, 'Bootstrap')
  }
}

void bootstrap()
