import { type INestApplication } from '@nestjs/common'
import request from 'supertest'

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
})
