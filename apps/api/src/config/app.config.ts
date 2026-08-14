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
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  googleCallbackUrl:
    process.env.GOOGLE_CALLBACK_URL ?? 'http://localhost:8080/api/v1/auth/google/callback',
  googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
  resendApiKey: process.env.RESEND_API_KEY,
  emailFrom: process.env.EMAIL_FROM ?? 'NexoCRM <noreply@nexocrm.app>',
  runMigrationsOnBoot: process.env.RUN_MIGRATIONS_ON_BOOT === 'true',
  dbSynchronize: process.env.DB_SYNCHRONIZE === 'true',
}))
