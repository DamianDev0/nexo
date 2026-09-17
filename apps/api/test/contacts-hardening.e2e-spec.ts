import { type INestApplication } from '@nestjs/common'
import request from 'supertest'

import {
  findDocumentCollisionRows,
  groupDocumentCollisions,
} from '../scripts/lib/document-collisions'
import { TENANT_MIGRATIONS } from '../src/shared/database/tenant-migrations'
import { createTestApp, onboardTenant, asTenant, teardownTenants, API_PREFIX } from './helpers/e2e'
import type { TestApp, OnboardedTenant } from './helpers/e2e'

describe('Contacts hardening: fresh tenants, concurrency, search (E2E, real HTTP)', () => {
  let ctx: TestApp
  let app: INestApplication
  let tenant: OnboardedTenant

  const SLUG = 'hardening-contacts'
  const server = () => app.getHttpServer()
  const contacts = () => asTenant(request(server()).post(`/${API_PREFIX}/contacts`), tenant)

  async function createContact(body: Record<string, unknown>): Promise<string> {
    const res = await contacts().send(body).expect(201)
    return res.body.data.id as string
  }

  beforeAll(async () => {
    ctx = await createTestApp()
    app = ctx.app
    await teardownTenants(ctx, [SLUG])
    tenant = await onboardTenant(app, SLUG)
  })

  afterAll(async () => {
    await teardownTenants(ctx, [SLUG])
    await app.close()
  })

  it('records every migration as applied on a freshly provisioned schema', async () => {
    const rows = (await ctx.dataSource.query(
      `SELECT COUNT(*)::int AS applied FROM "${tenant.schemaName}".schema_migrations`,
    )) as Array<{ applied: number }>
    const pending = (await ctx.dataSource.query(
      `SELECT COUNT(*)::int AS tables FROM information_schema.tables
       WHERE table_schema = $1 AND table_name = 'contact_lifecycle_history'`,
      [tenant.schemaName],
    )) as Array<{ tables: number }>
    expect(rows[0]?.applied).toBeGreaterThanOrEqual(44)
    expect(pending[0]?.tables).toBe(1)
  })

  it('lets a brand-new tenant move a contact through lifecycle stages', async () => {
    const id = await createContact({ firstName: 'Lucía', email: 'lucia@hardening.co' })

    const res = await asTenant(request(server()).patch(`/${API_PREFIX}/contacts/${id}`), tenant)
      .send({ lifecycleStage: 'lead' })
      .expect(200)

    expect(res.body.data.lifecycleStage).toBe('lead')
    const history = (await ctx.dataSource.query(
      `SELECT to_stage FROM "${tenant.schemaName}".contact_lifecycle_history WHERE contact_id = $1`,
      [id],
    )) as Array<{ to_stage: string }>
    expect(history).toEqual([{ to_stage: 'lead' }])
  })

  it('creates exactly one contact when the same email is posted concurrently', async () => {
    const results = await Promise.all(
      Array.from({ length: 8 }, () =>
        contacts().send({ firstName: 'Race', lastName: 'Email', email: 'race@hardening.co' }),
      ),
    )

    const statuses = results.map((res) => res.status).sort()
    expect(statuses.filter((status) => status === 201)).toHaveLength(1)
    expect(statuses.filter((status) => status === 409)).toHaveLength(7)
  })

  it('creates exactly one contact when the same document is posted concurrently', async () => {
    const results = await Promise.all(
      Array.from({ length: 8 }, () =>
        contacts().send({ firstName: 'Race', documentType: 'cc', documentNumber: '1010101010' }),
      ),
    )

    expect(results.filter((res) => res.status === 201)).toHaveLength(1)
    expect(results.every((res) => res.status === 201 || res.status === 409)).toBe(true)
  })

  it('never archives both contacts when two merges cross each other', async () => {
    const a = await createContact({ firstName: 'MergeA', email: 'merge-a@hardening.co' })
    const b = await createContact({ firstName: 'MergeB', email: 'merge-b@hardening.co' })

    const [ab, ba] = await Promise.all([
      asTenant(request(server()).post(`/${API_PREFIX}/contacts/${a}/merge`), tenant).send({
        loserId: b,
      }),
      asTenant(request(server()).post(`/${API_PREFIX}/contacts/${b}/merge`), tenant).send({
        loserId: a,
      }),
    ])

    const statuses = [ab.status, ba.status].sort()
    expect(statuses).toEqual([201, 409])
    const survivors = (await ctx.dataSource.query(
      `SELECT id FROM "${tenant.schemaName}".contacts WHERE id = ANY($1::uuid[]) AND is_active = true`,
      [[a, b]],
    )) as Array<{ id: string }>
    expect(survivors).toHaveLength(1)
  })

  it('keeps one default view and distinct positions under concurrent creation', async () => {
    const results = await Promise.all(
      Array.from({ length: 6 }, (_, index) =>
        asTenant(request(server()).post(`/${API_PREFIX}/contacts/views`), tenant).send({
          name: `Concurrent ${index}`,
          isDefault: true,
        }),
      ),
    )
    expect(results.every((res) => res.status === 201)).toBe(true)

    const list = await asTenant(
      request(server()).get(`/${API_PREFIX}/contacts/views`),
      tenant,
    ).expect(200)
    const views = list.body.data as Array<{ name: string; position: number; isDefault: boolean }>
    const mine = views.filter((view) => view.name.startsWith('Concurrent'))
    expect(mine).toHaveLength(6)
    expect(new Set(mine.map((view) => view.position)).size).toBe(6)
    expect(mine.filter((view) => view.isDefault)).toHaveLength(1)
  })

  it('finds contacts by name, email fragment and custom field text', async () => {
    await createContact({
      firstName: 'Búsqueda',
      lastName: 'Indexada',
      email: 'findme@hardening.co',
      customFields: {},
    })

    for (const q of ['Indexada', 'findme', 'búsqueda']) {
      const res = await asTenant(
        request(server()).get(`/${API_PREFIX}/contacts?q=${encodeURIComponent(q)}`),
        tenant,
      ).expect(200)
      expect(res.body.data.total).toBe(1)
    }
  })

  it('stores the same document one way no matter how it was typed', async () => {
    const id = await createContact({
      firstName: 'Documentada',
      documentType: 'nit',
      documentNumber: '900.373.115',
    })

    const rows = (await ctx.dataSource.query(
      `SELECT document_number FROM "${tenant.schemaName}".contacts WHERE id = $1`,
      [id],
    )) as Array<{ document_number: string }>
    expect(rows[0]?.document_number).toBe('900373115')

    const clash = await contacts()
      .send({ firstName: 'Repetida', documentType: 'nit', documentNumber: '900373115' })
      .expect(409)
    expect(clash.body.message).toBeDefined()

    const probe = await asTenant(
      request(server()).get(`/${API_PREFIX}/contacts/duplicates/probe?documentNumber=900.373.115`),
      tenant,
    ).expect(200)
    expect(probe.body.data.duplicate).toMatchObject({ severity: 'hard', field: 'documentNumber' })
  })

  it('refuses to resurrect the loser of a merge and keeps it out of the trash', async () => {
    const winner = await createContact({ firstName: 'Winner', email: 'winner@hardening.co' })
    const loser = await createContact({ firstName: 'Loser', email: 'loser@hardening.co' })

    await asTenant(request(server()).post(`/${API_PREFIX}/contacts/${winner}/merge`), tenant)
      .send({ loserId: loser })
      .expect(201)

    await asTenant(
      request(server()).post(`/${API_PREFIX}/contacts/${loser}/restore`),
      tenant,
    ).expect(404)

    const archived = await asTenant(
      request(server()).get(`/${API_PREFIX}/contacts?archived=true&limit=100`),
      tenant,
    ).expect(200)
    const ids = (archived.body.data.data as Array<{ id: string }>).map((row) => row.id)
    expect(ids).not.toContain(loser)

    const counts = await asTenant(
      request(server()).get(`/${API_PREFIX}/contacts/counts`),
      tenant,
    ).expect(200)
    expect(counts.body.data.archived).toBe(ids.length)
  })

  it('answers 404, not 200, when patching a contact archived by someone else', async () => {
    const id = await createContact({ firstName: 'Archived', email: 'archived@hardening.co' })
    await asTenant(request(server()).delete(`/${API_PREFIX}/contacts/${id}`), tenant).expect(204)

    await asTenant(request(server()).patch(`/${API_PREFIX}/contacts/${id}`), tenant)
      .send({ city: 'Cali' })
      .expect(404)
  })

  it('reports the documents 0047 could not normalize because a twin already holds them', async () => {
    const insert = async (name: string, document: string): Promise<string> => {
      const rows = (await ctx.dataSource.query(
        `INSERT INTO "${tenant.schemaName}".contacts (first_name, document_type, document_number)
         VALUES ($1, 'cc', $2) RETURNING id`,
        [name, document],
      )) as Array<{ id: string }>
      return rows[0]!.id
    }
    const clean = await insert('Limpia', '1020304050')
    const dirty = await insert('Sucia', '1.020.304.050')
    const alone = await insert('Sola', '2.030.405.060')

    const migration = TENANT_MIGRATIONS.find(
      (m) => m.id === '0047_contacts_document_number_normalized',
    )
    await ctx.dataSource.query(migration!.up(tenant.schemaName))

    const runner = ctx.dataSource.createQueryRunner()
    try {
      const collisions = groupDocumentCollisions(
        await findDocumentCollisionRows(runner, tenant.schemaName),
      )
      expect(collisions).toEqual([
        expect.objectContaining({
          normalized: '1020304050',
          active: true,
          contacts: [
            expect.objectContaining({ id: clean, clean: true }),
            expect.objectContaining({ id: dirty, clean: false }),
          ],
        }),
      ])
      expect(JSON.stringify(collisions)).not.toContain(alone)
    } finally {
      await runner.release()
    }
  })

  describe('lifecycle stage backfill and subscriber remap', () => {
    const REMAP = '0049_contacts_lifecycle_stage_remap'

    async function setLifecycleStages(stages: unknown): Promise<void> {
      await ctx.dataSource.query(
        `UPDATE public.tenants
         SET config = jsonb_set(COALESCE(config, '{}'::jsonb), '{contactTaxonomy}',
           COALESCE(config -> 'contactTaxonomy', '{}'::jsonb) || jsonb_build_object('lifecycleStages', $1::jsonb))
         WHERE "schemaName" = $2`,
        [JSON.stringify(stages), tenant.schemaName],
      )
    }

    async function insertWithStage(stage: string | null): Promise<string> {
      const rows = (await ctx.dataSource.query(
        `INSERT INTO "${tenant.schemaName}".contacts (first_name, lifecycle_stage)
         VALUES ('Remap', $1) RETURNING id`,
        [stage],
      )) as Array<{ id: string }>
      return rows[0]!.id
    }

    async function stageOf(id: string): Promise<string | null> {
      const rows = (await ctx.dataSource.query(
        `SELECT lifecycle_stage FROM "${tenant.schemaName}".contacts WHERE id = $1`,
        [id],
      )) as Array<{ lifecycle_stage: string | null }>
      return rows[0]?.lifecycle_stage ?? null
    }

    async function runRemap(): Promise<void> {
      const migration = TENANT_MIGRATIONS.find((m) => m.id === REMAP)
      await ctx.dataSource.query(migration!.up(tenant.schemaName))
    }

    afterAll(async () => {
      await ctx.dataSource.query(
        `UPDATE public.tenants SET config = config #- '{contactTaxonomy,lifecycleStages}'
         WHERE "schemaName" = $1`,
        [tenant.schemaName],
      )
    })

    it('picks the enabled stage with the lowest order, not the first one stored', async () => {
      await setLifecycleStages([
        { key: 'cliente', order: 3, enabled: true },
        { key: 'archivado', order: 0, enabled: false },
        { key: 'prospecto', order: 1, enabled: true },
      ])
      const empty = await insertWithStage(null)
      const legacy = await insertWithStage('subscriber')
      const kept = await insertWithStage('cliente')

      await runRemap()

      expect(await stageOf(empty)).toBe('prospecto')
      expect(await stageOf(legacy)).toBe('prospecto')
      expect(await stageOf(kept)).toBe('cliente')
    })

    it('leaves subscriber alone for a tenant still on the default catalog', async () => {
      await ctx.dataSource.query(
        `UPDATE public.tenants SET config = config #- '{contactTaxonomy,lifecycleStages}'
         WHERE "schemaName" = $1`,
        [tenant.schemaName],
      )
      const legacy = await insertWithStage('subscriber')

      await runRemap()

      expect(await stageOf(legacy)).toBe('subscriber')
    })
  })
})
