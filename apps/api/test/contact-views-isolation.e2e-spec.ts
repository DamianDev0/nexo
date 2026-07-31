import { type INestApplication } from '@nestjs/common'
import request from 'supertest'

import { createTestApp, onboardTenant, asTenant, teardownTenants, API_PREFIX } from './helpers/e2e'
import type { TestApp, OnboardedTenant } from './helpers/e2e'

describe('Contact Views Tenant Isolation (E2E, real HTTP)', () => {
  let ctx: TestApp
  let app: INestApplication
  let tenantA: OnboardedTenant
  let tenantB: OnboardedTenant

  const SLUG_A = 'iso-contact-views-a'
  const SLUG_B = 'iso-contact-views-b'

  beforeAll(async () => {
    ctx = await createTestApp()
    app = ctx.app
    await teardownTenants(ctx, [SLUG_A, SLUG_B])
    tenantA = await onboardTenant(app, SLUG_A)
    tenantB = await onboardTenant(app, SLUG_B)
  })

  afterAll(async () => {
    await teardownTenants(ctx, [SLUG_A, SLUG_B])
    await app.close()
  })

  it('provisions two tenants with isolated schemas', () => {
    expect(tenantA.schemaName).toBe('tenant_iso_contact_views_a')
    expect(tenantB.schemaName).toBe('tenant_iso_contact_views_b')
  })

  it("does NOT leak tenant A's contact view to tenant B, even shared ones", async () => {
    const created = await asTenant(
      request(app.getHttpServer()).post(`/${API_PREFIX}/contacts/views`),
      tenantA,
    )
      .send({
        name: 'Hot leads',
        filters: { status: 'new' },
        columns: { hidden: ['city'] },
        visibility: 'shared',
      })
      .expect(201)

    const viewId = created.body.data.id as string
    expect(viewId).toBeTruthy()

    const listA = await asTenant(
      request(app.getHttpServer()).get(`/${API_PREFIX}/contacts/views`),
      tenantA,
    ).expect(200)
    expect((listA.body.data as Array<{ id: string }>).map((v) => v.id)).toContain(viewId)

    const listB = await asTenant(
      request(app.getHttpServer()).get(`/${API_PREFIX}/contacts/views`),
      tenantB,
    ).expect(200)
    expect((listB.body.data as Array<{ id: string }>).map((v) => v.id)).not.toContain(viewId)

    await asTenant(
      request(app.getHttpServer()).delete(`/${API_PREFIX}/contacts/views/${viewId}`),
      tenantB,
    ).expect(404)

    const listAafter = await asTenant(
      request(app.getHttpServer()).get(`/${API_PREFIX}/contacts/views`),
      tenantA,
    ).expect(200)
    expect((listAafter.body.data as Array<{ id: string }>).map((v) => v.id)).toContain(viewId)
  })

  it('keeps contact counts scoped to each tenant', async () => {
    await asTenant(request(app.getHttpServer()).post(`/${API_PREFIX}/contacts`), tenantA)
      .send({ firstName: 'Laura', lastName: 'Isolada' })
      .expect(201)

    const countsA = await asTenant(
      request(app.getHttpServer()).get(`/${API_PREFIX}/contacts/counts`),
      tenantA,
    ).expect(200)
    const countsB = await asTenant(
      request(app.getHttpServer()).get(`/${API_PREFIX}/contacts/counts`),
      tenantB,
    ).expect(200)

    expect(countsA.body.data.total).toBeGreaterThanOrEqual(1)
    expect(countsB.body.data.total).toBe(0)
  })

  it('rejects unauthenticated access to contact views', async () => {
    await request(app.getHttpServer())
      .get(`/${API_PREFIX}/contacts/views`)
      .set('x-tenant-slug', SLUG_A)
      .expect(401)
  })
})
