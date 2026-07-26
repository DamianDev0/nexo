import { type INestApplication } from '@nestjs/common'
import request from 'supertest'

import { createTestApp, onboardTenant, asTenant, teardownTenants, API_PREFIX } from './helpers/e2e'
import type { TestApp, OnboardedTenant } from './helpers/e2e'

describe('Message Templates Tenant Isolation (E2E, real HTTP)', () => {
  let ctx: TestApp
  let app: INestApplication
  let tenantA: OnboardedTenant
  let tenantB: OnboardedTenant

  const SLUG_A = 'iso-message-templates-a'
  const SLUG_B = 'iso-message-templates-b'

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
    expect(tenantA.schemaName).toBe('tenant_iso_message_templates_a')
    expect(tenantB.schemaName).toBe('tenant_iso_message_templates_b')
    expect(tenantA.tenantId).not.toBe(tenantB.tenantId)
  })

  it("does NOT expose tenant A's message template to tenant B (404)", async () => {
    const created = await asTenant(
      request(app.getHttpServer()).post(`/${API_PREFIX}/message-templates`),
      tenantA,
    )
      .send({
        name: 'Welcome Email',
        channel: 'email',
        subject: 'Hola {{name}}',
        body: 'Bienvenido {{name}} a nuestra empresa.',
      })
      .expect(201)

    const templateId = created.body.data.id as string
    expect(templateId).toBeTruthy()

    await asTenant(
      request(app.getHttpServer()).get(`/${API_PREFIX}/message-templates/${templateId}`),
      tenantA,
    ).expect(200)

    await asTenant(
      request(app.getHttpServer()).get(`/${API_PREFIX}/message-templates/${templateId}`),
      tenantB,
    ).expect(404)
  })

  it('rejects unauthenticated access to a protected resource', async () => {
    await request(app.getHttpServer())
      .get(`/${API_PREFIX}/message-templates`)
      .set('x-tenant-slug', SLUG_A)
      .expect(401)
  })
})
