import { type INestApplication } from '@nestjs/common'
import request from 'supertest'

import { createTestApp, onboardTenant, asTenant, teardownTenants, API_PREFIX } from './helpers/e2e'
import type { TestApp, OnboardedTenant } from './helpers/e2e'

describe('Bulk actions isolation (E2E, real HTTP)', () => {
  let ctx: TestApp
  let app: INestApplication
  let tenantA: OnboardedTenant
  let tenantB: OnboardedTenant

  const SLUG_A = 'bulk-iso-a'
  const SLUG_B = 'bulk-iso-b'

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

  async function createContact(tenant: OnboardedTenant, firstName: string): Promise<string> {
    const res = await asTenant(request(app.getHttpServer()).post(`/${API_PREFIX}/contacts`), tenant)
      .send({ firstName, email: `${firstName.toLowerCase()}@${tenant.slug}.co` })
      .expect(201)
    return res.body.data.id as string
  }

  it('queues a bulk action for tenant A that tenant B cannot read (404)', async () => {
    const contactId = await createContact(tenantA, 'Ana')

    const created = await asTenant(
      request(app.getHttpServer()).post(`/${API_PREFIX}/bulk-actions`),
      tenantA,
    )
      .send({
        entity: 'contacts',
        action: 'archive',
        selection: { mode: 'ids', ids: [contactId] },
      })
      .expect(202)

    const bulkId = created.body.data.id as string
    expect(created.body.data.total).toBe(1)

    await asTenant(
      request(app.getHttpServer()).get(`/${API_PREFIX}/bulk-actions/${bulkId}`),
      tenantA,
    ).expect(200)
    await asTenant(
      request(app.getHttpServer()).get(`/${API_PREFIX}/bulk-actions/${bulkId}`),
      tenantB,
    ).expect(404)
    await asTenant(
      request(app.getHttpServer()).post(`/${API_PREFIX}/bulk-actions/${bulkId}/cancel`),
      tenantB,
    ).expect(404)
  })

  it("never mutates tenant A's rows when tenant B targets their ids", async () => {
    const foreignId = await createContact(tenantA, 'Bruno')

    await asTenant(request(app.getHttpServer()).post(`/${API_PREFIX}/bulk-actions`), tenantB)
      .send({
        entity: 'contacts',
        action: 'add_tags',
        params: { tags: ['stolen'] },
        selection: { mode: 'ids', ids: [foreignId] },
      })
      .expect(202)

    await new Promise((resolve) => setTimeout(resolve, 1500))

    const contact = await asTenant(
      request(app.getHttpServer()).get(`/${API_PREFIX}/contacts/${foreignId}`),
      tenantA,
    ).expect(200)
    expect(contact.body.data.tags).toEqual([])
  })

  it('keeps bulk history per tenant', async () => {
    const listA = await asTenant(
      request(app.getHttpServer()).get(`/${API_PREFIX}/bulk-actions`),
      tenantA,
    ).expect(200)
    const listB = await asTenant(
      request(app.getHttpServer()).get(`/${API_PREFIX}/bulk-actions`),
      tenantB,
    ).expect(200)

    const idsA = (listA.body.data.data as Array<{ id: string }>).map((row) => row.id)
    const idsB = (listB.body.data.data as Array<{ id: string }>).map((row) => row.id)
    expect(idsA.some((id) => idsB.includes(id))).toBe(false)
  })
})
