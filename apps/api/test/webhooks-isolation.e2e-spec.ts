import { type INestApplication } from '@nestjs/common'
import request from 'supertest'

import { createTestApp, onboardTenant, asTenant, teardownTenants, API_PREFIX } from './helpers/e2e'
import type { TestApp, OnboardedTenant } from './helpers/e2e'

describe('Webhooks Tenant Isolation (E2E, real HTTP)', () => {
  let ctx: TestApp
  let app: INestApplication
  let tenantA: OnboardedTenant
  let tenantB: OnboardedTenant

  const SLUG_A = 'iso-webhooks-a'
  const SLUG_B = 'iso-webhooks-b'

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
    expect(tenantA.schemaName).toBe('tenant_iso_webhooks_a')
    expect(tenantB.schemaName).toBe('tenant_iso_webhooks_b')
    expect(tenantA.tenantId).not.toBe(tenantB.tenantId)
  })

  it("does NOT expose tenant A's webhook to tenant B", async () => {
    const created = await asTenant(
      request(app.getHttpServer()).post(`/${API_PREFIX}/webhooks`),
      tenantA,
    )
      .send({ url: 'https://example.com/hooks/nexo', events: ['deal.won'] })
      .expect(201)

    const webhookId = created.body.data.id as string
    expect(webhookId).toBeTruthy()

    const listA = await asTenant(
      request(app.getHttpServer()).get(`/${API_PREFIX}/webhooks`),
      tenantA,
    ).expect(200)
    const idsA = (listA.body.data as Array<{ id: string }>).map((w) => w.id)
    expect(idsA).toContain(webhookId)

    const listB = await asTenant(
      request(app.getHttpServer()).get(`/${API_PREFIX}/webhooks`),
      tenantB,
    ).expect(200)
    const idsB = (listB.body.data as Array<{ id: string }>).map((w) => w.id)
    expect(idsB).not.toContain(webhookId)

    await asTenant(
      request(app.getHttpServer()).delete(`/${API_PREFIX}/webhooks/${webhookId}`),
      tenantB,
    )

    const listAafter = await asTenant(
      request(app.getHttpServer()).get(`/${API_PREFIX}/webhooks`),
      tenantA,
    ).expect(200)
    const idsAafter = (listAafter.body.data as Array<{ id: string }>).map((w) => w.id)
    expect(idsAafter).toContain(webhookId)
  })

  it('rejects unauthenticated access to the webhooks list', async () => {
    await request(app.getHttpServer())
      .get(`/${API_PREFIX}/webhooks`)
      .set('x-tenant-slug', SLUG_A)
      .expect(401)
  })
})
