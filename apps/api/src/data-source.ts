import { DataSource } from 'typeorm'

import { Tenant } from './modules/tenants/entities/tenant.entity'
import { Plan } from './modules/tenants/entities/plan.entity'
import { UserTenantMap } from './modules/tenants/entities/user-tenant-map.entity'

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST ?? 'localhost',
  port: Number.parseInt(process.env.DATABASE_PORT ?? '5432', 10),
  username: process.env.DATABASE_USER ?? 'nexocrm',
  password: process.env.DATABASE_PASSWORD ?? 'nexocrm_dev',
  database: process.env.DATABASE_NAME ?? 'nexocrm',
  entities: [Tenant, Plan, UserTenantMap],
  migrations: [__dirname + '/migrations/*.{ts,js}'],
  migrationsTableName: 'public_migrations',
  synchronize: false,
})

export default AppDataSource
