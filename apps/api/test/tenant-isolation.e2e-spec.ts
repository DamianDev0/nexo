import { type INestApplication } from '@nestjs/common'
import request from 'supertest'

import { createTestApp, onboardTenant, asTenant, teardownTenants, API_PREFIX } from './helpers/e2e'
import type { TestApp, OnboardedTenant } from './helpers/e2e'

describe('Tenant Isolation (E2E, real HTTP)', () => {
  let ctx: TestApp
  let app: INestApplication
  let tenantA: OnboardedTenant
  let tenantB: OnboardedTenant

  const SLUG_A = 'iso-tenant-a'
  const SLUG_B = 'iso-tenant-b'

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
    expect(tenantA.schemaName).toBe('tenant_iso_tenant_a')
    expect(tenantB.schemaName).toBe('tenant_iso_tenant_b')
    expect(tenantA.tenantId).not.toBe(tenantB.tenantId)
  })

  it("does NOT expose tenant A's contact to tenant B (404)", async () => {
    // Tenant A creates a contact
    const created = await asTenant(
      request(app.getHttpServer()).post(`/${API_PREFIX}/contacts`),
      tenantA,
    )
      .send({ firstName: 'Juan', lastName: 'García', email: 'juan@empresaa.co' })
      .expect(201)

    const contactId = created.body.data.id as string
    expect(contactId).toBeTruthy()

    // Tenant A can read its own contact
    await asTenant(
      request(app.getHttpServer()).get(`/${API_PREFIX}/contacts/${contactId}`),
      tenantA,
    ).expect(200)

    // Tenant B must NOT see tenant A's contact — it lives in another schema
    await asTenant(
      request(app.getHttpServer()).get(`/${API_PREFIX}/contacts/${contactId}`),
      tenantB,
    ).expect(404)
  })

  it('rejects unauthenticated access to a protected resource', async () => {
    await request(app.getHttpServer())
      .get(`/${API_PREFIX}/contacts`)
      .set('x-tenant-slug', SLUG_A)
      .expect(401)
  })
})
