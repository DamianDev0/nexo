import { DataSource } from 'typeorm'
import { Tenant } from '../src/modules/tenants/entities/tenant.entity'
import { Plan } from '../src/modules/tenants/entities/plan.entity'
import { seedPlans } from '../src/modules/tenants/seeds/plans.seed'

async function main() {
  const dataSource = new DataSource({
    type: 'postgres',
    // eslint-disable-next-line turbo/no-undeclared-env-vars
    host: process.env.DATABASE_HOST ?? 'localhost',
    port: Number.parseInt(process.env.DATABASE_PORT ?? '5432', 10),
    username: process.env.DATABASE_USER ?? 'nexocrm',
    password: process.env.DATABASE_PASSWORD ?? 'nexocrm_dev',
    database: process.env.DATABASE_NAME ?? 'nexocrm',
    entities: [Tenant, Plan],
    synchronize: true,
  })

  await dataSource.initialize()
  console.log('Database connected. Running seeds...\n')

  await seedPlans(dataSource)

  console.log('\nSeeds completed.')
  await dataSource.destroy()
}

main().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
