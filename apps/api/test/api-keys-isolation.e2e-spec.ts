import { type INestApplication } from '@nestjs/common'
import request from 'supertest'

import { createTestApp, onboardTenant, asTenant, teardownTenants, API_PREFIX } from './helpers/e2e'
import type { TestApp, OnboardedTenant } from './helpers/e2e'

describe('API Keys Tenant Isolation (E2E, real HTTP)', () => {
  let ctx: TestApp
  let app: INestApplication
  let tenantA: OnboardedTenant
  let tenantB: OnboardedTenant

  const SLUG_A = 'iso-api-keys-a'
  const SLUG_B = 'iso-api-keys-b'

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
    expect(tenantA.schemaName).toBe('tenant_iso_api_keys_a')
    expect(tenantB.schemaName).toBe('tenant_iso_api_keys_b')
    expect(tenantA.tenantId).not.toBe(tenantB.tenantId)
  })

  it("does NOT expose tenant A's api-key to tenant B", async () => {
    const created = await asTenant(
      request(app.getHttpServer()).post(`/${API_PREFIX}/api-keys`),
      tenantA,
    )
      .send({ name: 'ci-deploy-key' })
      .expect(201)

    const keyId = created.body.data.id as string
    expect(keyId).toBeTruthy()

    const listA = await asTenant(
      request(app.getHttpServer()).get(`/${API_PREFIX}/api-keys`),
      tenantA,
    ).expect(200)
    expect(listA.body.data.some((k: { id: string }) => k.id === keyId)).toBe(true)

    const listB = await asTenant(
      request(app.getHttpServer()).get(`/${API_PREFIX}/api-keys`),
      tenantB,
    ).expect(200)
    expect(listB.body.data.some((k: { id: string }) => k.id === keyId)).toBe(false)

    const listAAfter = await asTenant(
      request(app.getHttpServer()).get(`/${API_PREFIX}/api-keys`),
      tenantA,
    ).expect(200)
    expect(listAAfter.body.data.some((k: { id: string }) => k.id === keyId)).toBe(true)
  })

  it('rejects unauthenticated access to the api-keys list endpoint', async () => {
    await request(app.getHttpServer())
      .get(`/${API_PREFIX}/api-keys`)
      .set('x-tenant-slug', SLUG_A)
      .expect(401)
  })
})
