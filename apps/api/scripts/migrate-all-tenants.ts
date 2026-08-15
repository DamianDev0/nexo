import { DataSource } from 'typeorm'
import { TENANT_MIGRATIONS } from '../src/shared/database/tenant-migrations'
import { applyPendingMigrations } from '../src/shared/database/tenant-migration.runner'
import type { TenantMigrationOutcome } from '../src/shared/database/tenant-migration.runner'

interface TenantRow {
  slug: string
  schema_name: string
}

interface RunOptions {
  dryRun: boolean
  tenantSlug: string | null
}

type TenantResult = TenantMigrationOutcome & { tenant: string; schema: string }

function createDataSource(): DataSource {
  return new DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST ?? 'localhost',
    port: Number.parseInt(process.env.DATABASE_PORT ?? '5432', 10),
    username: process.env.DATABASE_USER ?? 'nexocrm',
    password: process.env.DATABASE_PASSWORD ?? 'nexocrm_dev',
    database: process.env.DATABASE_NAME ?? 'nexocrm',
  })
}

function parseArgs(): RunOptions {
  const args = process.argv.slice(2)
  return {
    dryRun: args.includes('--dry-run'),
    tenantSlug: args.includes('--tenant') ? (args[args.indexOf('--tenant') + 1] ?? null) : null,
  }
}

async function migrateOneTenant(
  dataSource: DataSource,
  tenant: TenantRow,
  options: RunOptions,
): Promise<TenantResult> {
  const qr = dataSource.createQueryRunner()
  await qr.connect()

  try {
    const outcome = await applyPendingMigrations(qr, tenant.schema_name, options.dryRun)
    return { ...outcome, tenant: tenant.slug, schema: tenant.schema_name }
  } finally {
    await qr.release()
  }
}

function printSummary(results: TenantResult[], dryRun: boolean): void {
  const separator = '─'.repeat(60)
  console.log(`\n${separator}`)
  console.log(dryRun ? '  DRY RUN — no changes were applied' : '  Migration Summary')
  console.log(separator)

  let totalApplied = 0
  let totalFailed = 0

  for (const result of results) {
    const status = result.failed ? '✗' : result.pending.length > 0 ? '✓' : '–'
    console.log(`\n  [${status}] ${result.tenant} (${result.schema})`)

    if (dryRun) {
      for (const id of result.pending) console.log(`      + [DRY-RUN] ${id}`)
    } else {
      for (const id of result.applied) console.log(`      + ${id}`)
      totalApplied += result.applied.length
    }

    if (result.failed) {
      console.log(`      ✗ ${result.failed.id}: ${result.failed.error}`)
      console.log(
        `      ! ${result.pending.length - result.applied.length - 1} migration(s) skipped`,
      )
      totalFailed += 1
    }
  }

  console.log(`\n${separator}`)
  console.log(`  Tenants: ${results.length} | Applied: ${totalApplied} | Failed: ${totalFailed}`)
  console.log(separator)

  if (totalFailed > 0) {
    console.error('\n  ⚠  Some migrations failed — check logs above before deploying.\n')
    process.exit(1)
  }
}

async function main(): Promise<void> {
  const options = parseArgs()

  console.log('\nNexoCRM — Tenant Migration Runner')
  if (options.dryRun) console.log('Mode: DRY RUN')
  if (options.tenantSlug) console.log(`Target: tenant "${options.tenantSlug}"`)
  console.log(`Migrations registered: ${TENANT_MIGRATIONS.length}\n`)

  const dataSource = createDataSource()

  try {
    await dataSource.initialize()

    const tenantFilter = options.tenantSlug ? `AND slug = $1` : ''
    const tenants = await dataSource.query<TenantRow[]>(
      `SELECT slug, "schemaName" AS schema_name FROM public.tenants
       WHERE "isActive" = true ${tenantFilter} ORDER BY "createdAt"`,
      options.tenantSlug ? [options.tenantSlug] : [],
    )

    if (tenants.length === 0) {
      console.log(
        options.tenantSlug
          ? `No active tenant found with slug "${options.tenantSlug}".`
          : 'No active tenants in the database.',
      )
      return
    }

    console.log(`Processing ${tenants.length} tenant(s)...`)

    const results: TenantResult[] = []

    for (const tenant of tenants) {
      process.stdout.write(`  ${tenant.slug}... `)
      const result = await migrateOneTenant(dataSource, tenant, options)
      results.push(result)

      if (result.failed) console.log(`FAILED at ${result.failed.id}`)
      else if (options.dryRun) console.log(`${result.pending.length} pending`)
      else if (result.applied.length > 0) console.log(`OK (${result.applied.length} applied)`)
      else console.log('up to date')
    }

    printSummary(results, options.dryRun)
  } finally {
    if (dataSource.isInitialized) await dataSource.destroy()
  }
}

main().catch((err: unknown) => {
  console.error('\nFatal error:', err instanceof Error ? err.message : err)
  process.exit(1)
})
