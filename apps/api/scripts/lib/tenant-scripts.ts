import { DataSource, type QueryRunner } from 'typeorm'

export const SCHEMA_PATTERN = /^tenant_[a-z0-9_]+$/

type CatalogTag = { name: string; color: string; description: string }

export const SEED_TAG = 'seed'

export const CONTACT_TAG_CATALOG: readonly CatalogTag[] = [
  { name: SEED_TAG, color: '#9CA3AF', description: 'Contacto de prueba creado por el seeder' },
  { name: 'VIP', color: '#F59E0B', description: 'Cliente de alto valor — atención prioritaria' },
  {
    name: 'Frío',
    color: '#60A5FA',
    description: 'Sin interacción reciente, requiere reactivación',
  },
  { name: 'Referido', color: '#34D399', description: 'Llegó recomendado por otro cliente' },
  { name: 'Recompra', color: '#A78BFA', description: 'Cliente con compras repetidas' },
  { name: 'Mayorista', color: '#F472B6', description: 'Compra por volumen con precios mayoristas' },
  { name: 'Moroso', color: '#F87171', description: 'Tiene pagos pendientes o vencidos' },
]

export function createScriptDataSource(): DataSource {
  return new DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST ?? 'localhost',
    port: Number.parseInt(process.env.DATABASE_PORT ?? '5432', 10),
    username: process.env.DATABASE_USER ?? 'nexocrm',
    password: process.env.DATABASE_PASSWORD ?? 'nexocrm_dev',
    database: process.env.DATABASE_NAME ?? 'nexocrm',
  })
}

export async function backfillTagDescriptions(runner: QueryRunner, schema: string): Promise<void> {
  for (const tag of CONTACT_TAG_CATALOG) {
    await runner.query(
      `UPDATE "${schema}".tags SET description = $2
       WHERE entity_type = 'contact' AND LOWER(name) = LOWER($1) AND description IS NULL`,
      [tag.name, tag.description],
    )
  }
}

export async function upsertContactTagCatalog(runner: QueryRunner, schema: string): Promise<void> {
  for (const tag of CONTACT_TAG_CATALOG) {
    await runner.query(
      `INSERT INTO "${schema}".tags (name, color, description, entity_type)
       SELECT $1::text, $2::text, $3::text, 'contact'
       WHERE NOT EXISTS (
         SELECT 1 FROM "${schema}".tags WHERE entity_type = 'contact' AND LOWER(name) = LOWER($1)
       )`,
      [tag.name, tag.color, tag.description],
    )
  }
  await backfillTagDescriptions(runner, schema)
}
