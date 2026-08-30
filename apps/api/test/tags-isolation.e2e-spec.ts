import { type INestApplication } from '@nestjs/common'
import request from 'supertest'

import { createTestApp, onboardTenant, asTenant, teardownTenants, API_PREFIX } from './helpers/e2e'
import type { TestApp, OnboardedTenant } from './helpers/e2e'

describe('Tags Tenant Isolation (E2E, real HTTP)', () => {
  let ctx: TestApp
  let app: INestApplication
  let tenantA: OnboardedTenant
  let tenantB: OnboardedTenant

  const SLUG_A = 'iso-tags-a'
  const SLUG_B = 'iso-tags-b'

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
    expect(tenantA.schemaName).toBe('tenant_iso_tags_a')
    expect(tenantB.schemaName).toBe('tenant_iso_tags_b')
    expect(tenantA.tenantId).not.toBe(tenantB.tenantId)
  })

  it("does NOT expose tenant A's tag to tenant B", async () => {
    const created = await asTenant(
      request(app.getHttpServer()).post(`/${API_PREFIX}/tags`),
      tenantA,
    )
      .send({ name: 'VIP', color: '#ff0000', entityType: 'contact' })
      .expect(201)

    const tagId = created.body.data.id as string
    expect(tagId).toBeTruthy()

    const listA = await asTenant(
      request(app.getHttpServer()).get(`/${API_PREFIX}/tags`),
      tenantA,
    ).expect(200)

    const idsA = (listA.body.data.data as Array<{ id: string }>).map((t) => t.id)
    expect(idsA).toContain(tagId)

    const listB = await asTenant(
      request(app.getHttpServer()).get(`/${API_PREFIX}/tags`),
      tenantB,
    ).expect(200)

    const idsB = (listB.body.data.data as Array<{ id: string }>).map((t) => t.id)
    expect(idsB).not.toContain(tagId)
  })

  it('rejects unauthenticated access to the tags list', async () => {
    await request(app.getHttpServer())
      .get(`/${API_PREFIX}/tags`)
      .set('x-tenant-slug', SLUG_A)
      .expect(401)
  })
})
