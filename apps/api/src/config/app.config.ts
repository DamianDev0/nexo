import { registerAs } from '@nestjs/config'

export const appConfig = registerAs('app', () => ({
  port: Number.parseInt(process.env.PORT ?? '8080', 10),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:3001',
  apiPrefix: 'api/v1',
  swaggerPath: 'api/docs',
  apiName: 'NexoCRM API',
  apiVersion: '1.0',
  cookieSecret: process.env.COOKIE_SECRET ?? 'nexocrm-dev-secret',
}))
