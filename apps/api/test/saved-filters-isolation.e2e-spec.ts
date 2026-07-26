import { type INestApplication } from '@nestjs/common'
import request from 'supertest'

import { createTestApp, onboardTenant, asTenant, teardownTenants, API_PREFIX } from './helpers/e2e'
import type { TestApp, OnboardedTenant } from './helpers/e2e'

describe('Saved Filters Tenant Isolation (E2E, real HTTP)', () => {
  let ctx: TestApp
  let app: INestApplication
  let tenantA: OnboardedTenant
  let tenantB: OnboardedTenant

  const SLUG_A = 'iso-saved-filters-a'
  const SLUG_B = 'iso-saved-filters-b'

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
    expect(tenantA.schemaName).toBe('tenant_iso_saved_filters_a')
    expect(tenantB.schemaName).toBe('tenant_iso_saved_filters_b')
    expect(tenantA.tenantId).not.toBe(tenantB.tenantId)
  })

  it("does NOT leak tenant A's saved filter to tenant B", async () => {
    const created = await asTenant(
      request(app.getHttpServer()).post(`/${API_PREFIX}/saved-filters`),
      tenantA,
    )
      .send({ entityType: 'contact', name: 'Hot leads', filters: { status: 'active' } })
      .expect(201)

    const filterId = created.body.data.id as string
    expect(filterId).toBeTruthy()

    const listA = await asTenant(
      request(app.getHttpServer()).get(`/${API_PREFIX}/saved-filters`),
      tenantA,
    ).expect(200)
    const idsA = (listA.body.data as Array<{ id: string }>).map((f) => f.id)
    expect(idsA).toContain(filterId)

    const listB = await asTenant(
      request(app.getHttpServer()).get(`/${API_PREFIX}/saved-filters`),
      tenantB,
    ).expect(200)
    const idsB = (listB.body.data as Array<{ id: string }>).map((f) => f.id)
    expect(idsB).not.toContain(filterId)

    await asTenant(
      request(app.getHttpServer()).delete(`/${API_PREFIX}/saved-filters/${filterId}`),
      tenantB,
    )

    const listAafter = await asTenant(
      request(app.getHttpServer()).get(`/${API_PREFIX}/saved-filters`),
      tenantA,
    ).expect(200)
    const idsAafter = (listAafter.body.data as Array<{ id: string }>).map((f) => f.id)
    expect(idsAafter).toContain(filterId)
  })

  it('rejects unauthenticated access to the saved-filters list', async () => {
    await request(app.getHttpServer())
      .get(`/${API_PREFIX}/saved-filters`)
      .set('x-tenant-slug', SLUG_A)
      .expect(401)
  })
})
