/**
 * Dev utility — idempotent. Usage:
 *   pnpm --filter api clean:contact-tags [--tenant <slug>]
 */

import { type QueryRunner } from 'typeorm'

import {
  backfillTagDescriptions,
  createScriptDataSource,
  SCHEMA_PATTERN,
} from './lib/tenant-scripts'

interface TenantRow {
  slug: string
  schemaName: string
}

async function findTenants(runner: QueryRunner, slug: string | null): Promise<TenantRow[]> {
  const where = slug ? 'AND slug = $1' : ''
  const rows = (await runner.query(
    `SELECT slug, "schemaName" FROM public.tenants WHERE "isActive" = true ${where}`,
    slug ? [slug] : [],
  )) as TenantRow[]

  return rows.filter((tenant) => SCHEMA_PATTERN.test(tenant.schemaName))
}

async function cleanTenant(runner: QueryRunner, schema: string): Promise<number> {
  await backfillTagDescriptions(runner, schema)

  const updated = (await runner.query(
    `UPDATE "${schema}".contacts c
     SET tags = COALESCE(
       (
         SELECT array_agg(DISTINCT t.name)
         FROM unnest(c.tags) AS raw(name)
         JOIN "${schema}".tags t
           ON t.entity_type = 'contact' AND t.enabled = true AND LOWER(t.name) = LOWER(raw.name)
       ),
       '{}'
     ),
     updated_at = NOW()
     WHERE cardinality(c.tags) > 0
     RETURNING c.id`,
  )) as unknown[]

  return updated.length
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2)
  const tenantIndex = argv.indexOf('--tenant')
  const slug = tenantIndex === -1 ? null : (argv[tenantIndex + 1] ?? null)

  const dataSource = createScriptDataSource()
  await dataSource.initialize()
  const runner = dataSource.createQueryRunner()
  await runner.connect()

  try {
    const tenants = await findTenants(runner, slug)
    if (tenants.length === 0) {
      console.log(slug ? `No active tenant "${slug}"` : 'No active tenants')
      return
    }

    for (const tenant of tenants) {
      try {
        const rewritten = await cleanTenant(runner, tenant.schemaName)
        console.log(`${tenant.slug}: rewrote tags on ${rewritten} contacts`)
      } catch (error) {
        console.log(`${tenant.slug}: skipped (${(error as Error).message})`)
      }
    }
  } finally {
    await runner.release()
    await dataSource.destroy()
  }
}

main().catch((error: unknown) => {
  console.error(error)
  process.exit(1)
})
