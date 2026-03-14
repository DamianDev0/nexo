import { Logger, ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory, Reflector } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

import { AppModule } from './app.module'
import { AllExceptionsFilter } from './shared/filters/all-exceptions.filter'
import { HttpExceptionFilter } from './shared/filters/http-exception.filter'
import { TypeOrmExceptionFilter } from './shared/filters/typeorm-exception.filter'
import { TransformInterceptor } from './shared/interceptors/transform.interceptor'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const config = app.get(ConfigService)
  const logger = new Logger('Bootstrap')

  const port = config.get<number>('app.port', 8080)
  const nodeEnv = config.get<string>('app.nodeEnv', 'development')
  const prefix = config.get<string>('app.apiPrefix', 'api/v1')
  const swaggerPath = config.get<string>('app.swaggerPath', 'api/docs')
  const apiName = config.get<string>('app.apiName', 'NexoCRM API')
  const apiVersion = config.get<string>('app.apiVersion', '1.0')
  const frontendUrl = config.get<string>('app.frontendUrl', 'http://localhost:3001')

  app.setGlobalPrefix(prefix)

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  )

  app.useGlobalFilters(
    new AllExceptionsFilter(),
    new TypeOrmExceptionFilter(),
    new HttpExceptionFilter(),
  )

  app.useGlobalInterceptors(new TransformInterceptor(app.get(Reflector)))

  app.enableCors({ origin: frontendUrl, credentials: true })

  if (nodeEnv !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle(apiName)
      .setVersion(apiVersion)
      .addBearerAuth()
      .build()
    SwaggerModule.setup(swaggerPath, app, SwaggerModule.createDocument(app, swaggerConfig))
  }

  await app.listen(port)

  logger.log(`Application is running on: http://localhost:${port}/${prefix}`)
  if (nodeEnv !== 'production') {
    logger.log(`Swagger docs available at: http://localhost:${port}/${swaggerPath}`)
  }
}

void bootstrap()
