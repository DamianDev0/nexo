import {
  findDocumentCollisionRows,
  groupDocumentCollisions,
  type DocumentCollision,
} from './lib/document-collisions'
import { createScriptDataSource, findActiveTenants, tenantSlugArgument } from './lib/tenant-scripts'

function printCollision(slug: string, collision: DocumentCollision): void {
  const state = collision.active ? 'active' : 'archived'
  console.log(`${slug} · ${collision.normalized} (${state})`)
  for (const contact of collision.contacts) {
    const marker = contact.clean ? 'kept' : 'needs review'
    console.log(
      `  ${contact.id}  ${contact.stored.padEnd(16)}  ${marker.padEnd(12)}  ${contact.name}`,
    )
  }
}

async function main(): Promise<void> {
  const slug = tenantSlugArgument(process.argv.slice(2))
  const dataSource = createScriptDataSource()
  await dataSource.initialize()
  const runner = dataSource.createQueryRunner()
  await runner.connect()

  let total = 0
  try {
    const tenants = await findActiveTenants(runner, slug)
    for (const tenant of tenants) {
      try {
        const collisions = groupDocumentCollisions(
          await findDocumentCollisionRows(runner, tenant.schemaName),
        )
        for (const collision of collisions) printCollision(tenant.slug, collision)
        total += collisions.length
      } catch (error) {
        console.log(`${tenant.slug}: skipped (${(error as Error).message})`)
      }
    }
    console.log(
      total === 0
        ? 'No document numbers left unnormalized by 0047'
        : `${total} document number(s) need a merge or a manual fix before they can be normalized`,
    )
  } finally {
    await runner.release()
    await dataSource.destroy()
  }
}

main().catch((error: unknown) => {
  console.error(error)
  process.exit(1)
})
