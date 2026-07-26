import { type INestApplication } from '@nestjs/common'
import request from 'supertest'

import { createTestApp, onboardTenant, teardownTenants, API_PREFIX } from './helpers/e2e'
import type { TestApp, OnboardedTenant } from './helpers/e2e'

describe('Tenant HTTP isolation — TenantMatchGuard (E2E)', () => {
  let ctx: TestApp
  let app: INestApplication
  let tenantA: OnboardedTenant
  let tenantB: OnboardedTenant

  const A_SLUG = 'match-tenant-a'
  const B_SLUG = 'match-tenant-b'

  beforeAll(async () => {
    ctx = await createTestApp()
    app = ctx.app
    await teardownTenants(ctx, [A_SLUG, B_SLUG])
    tenantA = await onboardTenant(app, A_SLUG)
    tenantB = await onboardTenant(app, B_SLUG)
  })

  afterAll(async () => {
    await teardownTenants(ctx, [A_SLUG, B_SLUG])
    await app.close()
  })

  it("blocks tenant A's token sent against tenant B's subdomain with 403", async () => {
    await request(app.getHttpServer())
      .get(`/${API_PREFIX}/contacts`)
      .set('Cookie', tenantA.cookies)
      .set('x-tenant-slug', B_SLUG)
      .expect(403)
  })

  it('allows the same token against its own tenant subdomain', async () => {
    await request(app.getHttpServer())
      .get(`/${API_PREFIX}/contacts`)
      .set('Cookie', tenantA.cookies)
      .set('x-tenant-slug', A_SLUG)
      .expect(200)
  })
})
