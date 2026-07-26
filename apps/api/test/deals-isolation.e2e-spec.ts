import { type INestApplication } from '@nestjs/common'
import request from 'supertest'

import { createTestApp, onboardTenant, asTenant, teardownTenants, API_PREFIX } from './helpers/e2e'
import type { TestApp, OnboardedTenant } from './helpers/e2e'

describe('Deals Tenant Isolation (E2E, real HTTP)', () => {
  let ctx: TestApp
  let app: INestApplication
  let tenantA: OnboardedTenant
  let tenantB: OnboardedTenant

  const SLUG_A = 'iso-deals-a'
  const SLUG_B = 'iso-deals-b'

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
    expect(tenantA.schemaName).toBe('tenant_iso_deals_a')
    expect(tenantB.schemaName).toBe('tenant_iso_deals_b')
    expect(tenantA.tenantId).not.toBe(tenantB.tenantId)
  })

  it("does NOT expose tenant A's deal to tenant B (404)", async () => {
    const created = await asTenant(
      request(app.getHttpServer()).post(`/${API_PREFIX}/deals`),
      tenantA,
    )
      .send({ title: 'Acme expansion', valueCents: 500000 })
      .expect(201)

    const dealId = created.body.data.id as string
    expect(dealId).toBeTruthy()

    await asTenant(
      request(app.getHttpServer()).get(`/${API_PREFIX}/deals/${dealId}`),
      tenantA,
    ).expect(200)

    await asTenant(
      request(app.getHttpServer()).get(`/${API_PREFIX}/deals/${dealId}`),
      tenantB,
    ).expect(404)
  })

  it('rejects unauthenticated access to the deals list', async () => {
    await request(app.getHttpServer())
      .get(`/${API_PREFIX}/deals`)
      .set('x-tenant-slug', SLUG_A)
      .expect(401)
  })
})
