import { registerAs } from '@nestjs/config'

export const databaseConfig = registerAs('database', () => ({
  host: process.env.DATABASE_HOST ?? 'localhost',
  port: Number.parseInt(process.env.DATABASE_PORT ?? '5432', 10),
  username: process.env.DATABASE_USER ?? 'nexocrm',
  password: process.env.DATABASE_PASSWORD ?? 'nexocrm_dev',
  database: process.env.DATABASE_NAME ?? 'nexocrm',
}))
