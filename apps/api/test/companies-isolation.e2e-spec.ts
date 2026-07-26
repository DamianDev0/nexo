import { type INestApplication } from '@nestjs/common'
import request from 'supertest'

import { createTestApp, onboardTenant, asTenant, teardownTenants, API_PREFIX } from './helpers/e2e'
import type { TestApp, OnboardedTenant } from './helpers/e2e'

describe('Companies Tenant Isolation (E2E, real HTTP)', () => {
  let ctx: TestApp
  let app: INestApplication
  let tenantA: OnboardedTenant
  let tenantB: OnboardedTenant

  const SLUG_A = 'iso-companies-a'
  const SLUG_B = 'iso-companies-b'

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
    expect(tenantA.schemaName).toBe('tenant_iso_companies_a')
    expect(tenantB.schemaName).toBe('tenant_iso_companies_b')
    expect(tenantA.tenantId).not.toBe(tenantB.tenantId)
  })

  it("does NOT expose tenant A's company to tenant B (404)", async () => {
    const created = await asTenant(
      request(app.getHttpServer()).post(`/${API_PREFIX}/companies`),
      tenantA,
    )
      .send({ name: 'Empresa A S.A.S', nit: '900123456', email: 'contacto@empresaa.co' })
      .expect(201)

    const companyId = created.body.data.id as string
    expect(companyId).toBeTruthy()

    await asTenant(
      request(app.getHttpServer()).get(`/${API_PREFIX}/companies/${companyId}`),
      tenantA,
    ).expect(200)

    await asTenant(
      request(app.getHttpServer()).get(`/${API_PREFIX}/companies/${companyId}`),
      tenantB,
    ).expect(404)
  })

  it('rejects unauthenticated access to the companies list', async () => {
    await request(app.getHttpServer())
      .get(`/${API_PREFIX}/companies`)
      .set('x-tenant-slug', SLUG_A)
      .expect(401)
  })
})
