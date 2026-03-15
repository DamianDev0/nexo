import { registerAs } from '@nestjs/config'
import type { ConfigService } from '@nestjs/config'
import type { TypeOrmModuleOptions } from '@nestjs/typeorm'

export interface DatabaseConfig {
  host: string
  port: number
  username: string
  password: string
  database: string
}

export const databaseConfig = registerAs(
  'database',
  (): DatabaseConfig => ({
    host: process.env.DATABASE_HOST ?? 'localhost',
    port: Number.parseInt(process.env.DATABASE_PORT ?? '5432', 10),
    username: process.env.DATABASE_USER ?? 'nexocrm',
    password: process.env.DATABASE_PASSWORD ?? 'nexocrm_dev',
    database: process.env.DATABASE_NAME ?? 'nexocrm',
  }),
)

export function createTypeOrmOptions(config: ConfigService): TypeOrmModuleOptions {
  const db = config.getOrThrow<DatabaseConfig>('database')
  const isDev = config.get<string>('app.nodeEnv') === 'development'

  return {
    type: 'postgres',
    host: db.host,
    port: db.port,
    username: db.username,
    password: db.password,
    database: db.database,
    autoLoadEntities: true,
    synchronize: isDev,
    logging: isDev,
  }
}
