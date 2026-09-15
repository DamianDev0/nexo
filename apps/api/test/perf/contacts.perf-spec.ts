import { type INestApplication } from '@nestjs/common'
import request from 'supertest'

import { createTestApp, onboardTenant, asTenant, teardownTenants, API_PREFIX } from '../helpers/e2e'
import type { TestApp, OnboardedTenant } from '../helpers/e2e'

const CONTACTS = Number.parseInt(process.env.PERF_CONTACTS ?? '50000', 10)
const SAMPLES = Number.parseInt(process.env.PERF_SAMPLES ?? '20', 10)
const WARMUP = 3

type Budget = { readonly name: string; readonly path: string; readonly p95Ms: number }

const READ_BUDGETS: ReadonlyArray<Budget> = [
  { name: 'list page 1', path: '/contacts?limit=25', p95Ms: 120 },
  { name: 'list page 500', path: '/contacts?limit=25&page=500', p95Ms: 120 },
  {
    name: 'list sorted by next activity',
    path: '/contacts?limit=25&sortBy=nextActivity',
    p95Ms: 120,
  },
  { name: 'search by name', path: '/contacts?limit=25&q=maria', p95Ms: 120 },
  { name: 'search by email fragment', path: '/contacts?limit=25&q=user123', p95Ms: 120 },
  { name: 'filter status + tag', path: '/contacts?limit=25&status=new&tags=vip', p95Ms: 120 },
  { name: 'filter by city', path: '/contacts?limit=25&city=Cali', p95Ms: 120 },
  { name: 'counts', path: '/contacts/counts', p95Ms: 150 },
  { name: 'workspace', path: '/contacts/workspace', p95Ms: 200 },
  { name: 'taxonomy usage', path: '/contacts/taxonomy-usage', p95Ms: 300 },
  {
    name: 'duplicate probe',
    path: '/contacts/duplicates/probe?email=user777@stress.test',
    p95Ms: 60,
  },
]

function percentile(samples: number[], fraction: number): number {
  const sorted = [...samples].sort((a, b) => a - b)
  return sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * fraction))] ?? 0
}

describe(`Contacts performance budgets (${CONTACTS} rows, sequential p95)`, () => {
  let ctx: TestApp
  let app: INestApplication
  let tenant: OnboardedTenant
  const SLUG = 'perf-contacts'
  const server = () => app.getHttpServer()

  async function measure(path: string, samples = SAMPLES): Promise<number[]> {
    const latencies: number[] = []
    for (let i = 0; i < WARMUP + samples; i++) {
      const started = performance.now()
      await asTenant(request(server()).get(`/${API_PREFIX}${path}`), tenant).expect(200)
      if (i >= WARMUP) latencies.push(performance.now() - started)
    }
    return latencies
  }

  beforeAll(async () => {
    ctx = await createTestApp()
    app = ctx.app
    await teardownTenants(ctx, [SLUG])
    tenant = await onboardTenant(app, SLUG)
    await ctx.dataSource.query(
      `
      INSERT INTO "${tenant.schemaName}".contacts
        (first_name, last_name, email, phone, whatsapp, document_type, document_number, city,
         status, lifecycle_stage, source, tags, custom_fields, created_at)
      SELECT (ARRAY['Andrés','Camila','Santiago','Valentina','Mateo','Isabella','María','Juan'])[1 + (g % 8)],
             (ARRAY['García','Rodríguez','Martínez','López','Pérez','Gómez','Torres','Ramírez'])[1 + (g % 8)],
             'user' || g || '@stress.test',
             '30' || lpad((1000000 + g)::text, 8, '0'),
             '30' || lpad((1000000 + g)::text, 8, '0'),
             'cc', (10000000 + g)::text,
             (ARRAY['Bogotá','Medellín','Cali','Barranquilla'])[1 + (g % 4)],
             (ARRAY['new','contacted','qualified'])[1 + (g % 3)], 'subscriber',
             (ARRAY['web','referral','import'])[1 + (g % 3)],
             CASE WHEN g % 5 = 0 THEN ARRAY['vip'] ELSE '{}'::text[] END,
             jsonb_build_object('nota', 'cliente ' || g),
             NOW() - (g || ' minutes')::interval
      FROM generate_series(1, $1) g
    `,
      [CONTACTS],
    )
    await ctx.dataSource.query(`ANALYZE "${tenant.schemaName}".contacts`)
  })

  afterAll(async () => {
    await teardownTenants(ctx, [SLUG])
    await app.close()
  })

  it.each(READ_BUDGETS)('$name stays under $p95Ms ms p95', async ({ path, p95Ms }) => {
    const latencies = await measure(path)
    const p95 = percentile(latencies, 0.95)
    const p50 = percentile(latencies, 0.5)
    process.stdout.write(`  ${path} → p50 ${p50.toFixed(0)} ms · p95 ${p95.toFixed(0)} ms\n`)
    expect(p95).toBeLessThan(p95Ms)
  })

  it('creates a contact under 150 ms p95 with every duplicate check running', async () => {
    const latencies: number[] = []
    for (let i = 0; i < WARMUP + SAMPLES; i++) {
      const started = performance.now()
      await asTenant(request(server()).post(`/${API_PREFIX}/contacts`), tenant)
        .send({
          firstName: `Perf${i}`,
          lastName: 'Load',
          email: `perf-${i}@stress.test`,
          phone: `31${String(1000000 + i).padStart(8, '0')}`,
        })
        .expect(201)
      if (i >= WARMUP) latencies.push(performance.now() - started)
    }
    const p95 = percentile(latencies, 0.95)
    process.stdout.write(`  POST /contacts → p95 ${p95.toFixed(0)} ms\n`)
    expect(p95).toBeLessThan(150)
  })

  it('serves 20 concurrent searches with a p95 under 250 ms', async () => {
    const started = performance.now()
    const burst = await Promise.all(
      Array.from({ length: 20 }, (_, i) =>
        asTenant(request(server()).get(`/${API_PREFIX}/contacts?limit=25&q=user${i}`), tenant).then(
          (res) => ({ status: res.status, elapsed: performance.now() - started }),
        ),
      ),
    )
    expect(burst.every((res) => res.status === 200)).toBe(true)
    const p95 = percentile(
      burst.map((res) => res.elapsed),
      0.95,
    )
    process.stdout.write(`  20 × search burst → p95 ${p95.toFixed(0)} ms\n`)
    expect(p95).toBeLessThan(250)
  })
})
