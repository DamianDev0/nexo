/**
 * Contact seeder — development only.
 *
 * Usage:
 *   pnpm --filter api seed:contacts --tenant damiantest
 *   pnpm --filter api seed:contacts --tenant damiantest --count 200
 *   pnpm --filter api seed:contacts --tenant damiantest --purge
 *
 * Rows are tagged `seed` so `--purge` can remove exactly what this script created
 * without touching real data. Status, source and type keys are read from the
 * tenant's own contactTaxonomy, so the seeded rows always land in existing smart lists.
 */

import { type QueryRunner } from 'typeorm'

import {
  CONTACT_TAG_CATALOG,
  createScriptDataSource,
  SCHEMA_PATTERN,
  SEED_TAG,
  upsertContactTagCatalog,
} from './lib/tenant-scripts'

interface TenantRow {
  slug: string
  schemaName: string
  config: { contactTaxonomy?: TaxonomyConfig } | null
}

interface TaxonomyEntry {
  key: string
  enabled: boolean
}

interface TaxonomyConfig {
  statuses?: TaxonomyEntry[]
  sources?: TaxonomyEntry[]
  types?: TaxonomyEntry[]
}

interface Options {
  tenantSlug: string
  count: number
  purge: boolean
}

const FIRST_NAMES = [
  'Andrés',
  'Camila',
  'Santiago',
  'Valentina',
  'Mateo',
  'Isabella',
  'Sebastián',
  'Sofía',
  'Nicolás',
  'Mariana',
  'Samuel',
  'Daniela',
  'Tomás',
  'Luciana',
  'Emiliano',
  'Salomé',
  'Julián',
  'Antonella',
  'Martín',
  'Gabriela',
  'Felipe',
  'Manuela',
  'Diego',
  'Paula',
  'Ricardo',
  'Carolina',
  'Esteban',
  'Juliana',
  'Alejandro',
  'Natalia',
]

const LAST_NAMES = [
  'Gómez',
  'Rodríguez',
  'Martínez',
  'García',
  'López',
  'Hernández',
  'Ramírez',
  'Torres',
  'Vargas',
  'Moreno',
  'Jiménez',
  'Rojas',
  'Castro',
  'Ortiz',
  'Cárdenas',
  'Mendoza',
  'Salazar',
  'Guerrero',
  'Restrepo',
  'Quintero',
  'Arias',
  'Peña',
  'Sanabria',
  'Betancur',
]

const PLACES = [
  { city: 'Bogotá D.C.', department: 'Bogotá D.C.', code: '11001' },
  { city: 'Medellín', department: 'Antioquia', code: '05001' },
  { city: 'Cali', department: 'Valle del Cauca', code: '76001' },
  { city: 'Barranquilla', department: 'Atlántico', code: '08001' },
  { city: 'Cartagena', department: 'Bolívar', code: '13001' },
  { city: 'Bucaramanga', department: 'Santander', code: '68001' },
  { city: 'Pereira', department: 'Risaralda', code: '66001' },
  { city: 'Manizales', department: 'Caldas', code: '17001' },
  { city: 'Santa Marta', department: 'Magdalena', code: '47001' },
  { city: 'Villavicencio', department: 'Meta', code: '50001' },
]

const JOB_TITLES = [
  'Gerente General',
  'Director Comercial',
  'Jefe de Compras',
  'Coordinadora de Marketing',
  'Analista de Operaciones',
  'Contadora',
  'Jefe de Bodega',
  'Asesor Comercial',
  'Directora Financiera',
  'Ingeniero de Proyectos',
  'Administradora',
  'Socio Fundador',
]

const LIFECYCLE_STAGES = ['subscriber', 'lead', 'opportunity', 'customer']

const TAG_POOL = CONTACT_TAG_CATALOG.filter((tag) => tag.name !== SEED_TAG)

const FALLBACK_STATUSES = ['new']
const FALLBACK_SOURCES = ['import']
const FALLBACK_TYPES = ['customer']

function parseOptions(argv: string[]): Options {
  const read = (flag: string): string | null => {
    const index = argv.indexOf(flag)
    return index === -1 ? null : (argv[index + 1] ?? null)
  }

  const tenantSlug = read('--tenant')
  if (!tenantSlug) {
    throw new Error('Missing --tenant <slug>')
  }

  const rawCount = read('--count')
  const count = rawCount === null ? 50 : Number.parseInt(rawCount, 10)
  if (!Number.isInteger(count) || count < 1 || count > 5000) {
    throw new Error('--count must be an integer between 1 and 5000')
  }

  return { tenantSlug, count, purge: argv.includes('--purge') }
}

async function findTenant(runner: QueryRunner, slug: string): Promise<TenantRow> {
  const rows = (await runner.query(
    'SELECT slug, "schemaName", config FROM public.tenants WHERE slug = $1 AND "isActive" = true',
    [slug],
  )) as TenantRow[]

  const tenant = rows[0]
  if (!tenant) {
    throw new Error(`No active tenant with slug "${slug}"`)
  }
  if (!SCHEMA_PATTERN.test(tenant.schemaName)) {
    throw new Error(`Refusing to touch unexpected schema name "${tenant.schemaName}"`)
  }
  return tenant
}

function enabledKeys(entries: TaxonomyEntry[] | undefined, fallback: string[]): string[] {
  const keys = (entries ?? []).filter((entry) => entry.enabled).map((entry) => entry.key)
  return keys.length > 0 ? keys : fallback
}

function pick<T>(values: T[], index: number): T {
  return values[index % values.length] as T
}

function documentNumber(index: number): string {
  return String(1_000_000_000 + index * 7919).slice(0, 10)
}

function phoneNumber(index: number): string {
  return `3${String(100_000_000 + index * 1237).slice(0, 9)}`
}

function tagsFor(index: number): string[] {
  const extra = index % 3 === 0 ? [pick(TAG_POOL, index).name] : []
  return [SEED_TAG, ...extra]
}

function buildRow(index: number, taxonomy: TaxonomyConfig) {
  const firstName = pick(FIRST_NAMES, index)
  const lastName = `${pick(LAST_NAMES, index)} ${pick(LAST_NAMES, index + 7)}`
  const place = pick(PLACES, index)
  const slugName = `${firstName}.${lastName.split(' ')[0]}`
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')

  return [
    firstName,
    lastName,
    `${slugName}${index}@example.co`,
    phoneNumber(index),
    'CC',
    documentNumber(index),
    pick(JOB_TITLES, index),
    place.city,
    place.department,
    place.code,
    pick(enabledKeys(taxonomy.statuses, FALLBACK_STATUSES), index),
    pick(LIFECYCLE_STAGES, index),
    pick(enabledKeys(taxonomy.sources, FALLBACK_SOURCES), index),
    pick(enabledKeys(taxonomy.types, FALLBACK_TYPES), index),
    (index * 13) % 100,
    tagsFor(index),
  ]
}

const COLUMNS = [
  'first_name',
  'last_name',
  'email',
  'phone',
  'document_type',
  'document_number',
  'job_title',
  'city',
  'department',
  'municipio_code',
  'status',
  'lifecycle_stage',
  'source',
  'type',
  'lead_score',
  'tags',
]

function insertStatement(schema: string, rowCount: number): string {
  const width = COLUMNS.length
  const tuples = Array.from({ length: rowCount }, (_, row) => {
    const params = Array.from({ length: width }, (_, column) => `$${row * width + column + 1}`)
    return `(${params.join(', ')})`
  })
  return `INSERT INTO "${schema}".contacts (${COLUMNS.join(', ')}) VALUES ${tuples.join(', ')}`
}

async function purgeSeeded(runner: QueryRunner, schema: string): Promise<number> {
  const result = (await runner.query(
    `DELETE FROM "${schema}".contacts WHERE $1 = ANY(tags) RETURNING id`,
    [SEED_TAG],
  )) as unknown[]
  return result.length
}

async function main(): Promise<void> {
  const options = parseOptions(process.argv.slice(2))
  const dataSource = createScriptDataSource()
  await dataSource.initialize()

  const runner = dataSource.createQueryRunner()
  await runner.connect()

  try {
    const tenant = await findTenant(runner, options.tenantSlug)
    const schema = tenant.schemaName
    const taxonomy = tenant.config?.contactTaxonomy ?? {}

    if (options.purge) {
      const removed = await purgeSeeded(runner, schema)
      console.log(`Removed ${removed} seeded contacts from ${schema}`)
      return
    }

    await upsertContactTagCatalog(runner, schema)

    const rows = Array.from({ length: options.count }, (_, index) => buildRow(index, taxonomy))
    await runner.query(insertStatement(schema, rows.length), rows.flat())

    const totals = (await runner.query(
      `SELECT count(*)::int AS count FROM "${schema}".contacts WHERE is_active = true`,
    )) as Array<{ count: number }>

    console.log(
      `Inserted ${rows.length} contacts into ${schema} (${totals[0]?.count ?? 0} active total)`,
    )
    console.log(
      `To UNDO later (deletes every seeded row): pnpm --filter api seed:contacts --tenant ${tenant.slug} --purge`,
    )
  } finally {
    await runner.release()
    await dataSource.destroy()
  }
}

main().catch((error: unknown) => {
  console.error('Contact seed failed:', error instanceof Error ? error.message : error)
  process.exit(1)
})
