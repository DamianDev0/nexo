import { type INestApplication } from '@nestjs/common'
import request from 'supertest'

import { createTestApp, onboardTenant, asTenant, teardownTenants, API_PREFIX } from './helpers/e2e'
import type { TestApp, OnboardedTenant } from './helpers/e2e'

describe('Contacts Core Tenant Isolation (E2E, real HTTP)', () => {
  let ctx: TestApp
  let app: INestApplication
  let tenantA: OnboardedTenant
  let tenantB: OnboardedTenant
  let contactA: string

  const SLUG_A = 'iso-contacts-core-a'
  const SLUG_B = 'iso-contacts-core-b'
  const EMAIL_A = 'confidencial@tenant-a.co'

  const server = () => app.getHttpServer()

  beforeAll(async () => {
    ctx = await createTestApp()
    app = ctx.app
    await teardownTenants(ctx, [SLUG_A, SLUG_B])
    tenantA = await onboardTenant(app, SLUG_A)
    tenantB = await onboardTenant(app, SLUG_B)

    const created = await asTenant(request(server()).post(`/${API_PREFIX}/contacts`), tenantA)
      .send({ firstName: 'Ana', lastName: 'Salazar', email: EMAIL_A, phone: '3001112233' })
      .expect(201)

    contactA = created.body.data.id as string
    expect(contactA).toBeTruthy()
  })

  afterAll(async () => {
    await teardownTenants(ctx, [SLUG_A, SLUG_B])
    await app.close()
  })

  it('provisions two tenants with isolated schemas', () => {
    expect(tenantA.schemaName).toBe('tenant_iso_contacts_core_a')
    expect(tenantB.schemaName).toBe('tenant_iso_contacts_core_b')
  })

  it("keeps tenant A's contact out of tenant B's list, search and counts", async () => {
    const list = await asTenant(request(server()).get(`/${API_PREFIX}/contacts`), tenantB).expect(
      200,
    )
    expect(list.body.data.total).toBe(0)

    const search = await asTenant(
      request(server()).get(`/${API_PREFIX}/contacts?q=Salazar`),
      tenantB,
    ).expect(200)
    expect(search.body.data.total).toBe(0)

    const counts = await asTenant(
      request(server()).get(`/${API_PREFIX}/contacts/counts`),
      tenantB,
    ).expect(200)
    expect(counts.body.data.total).toBe(0)
  })

  it("hides tenant A's contact from every per-record route", async () => {
    await asTenant(request(server()).get(`/${API_PREFIX}/contacts/${contactA}`), tenantB).expect(
      404,
    )
    await asTenant(request(server()).patch(`/${API_PREFIX}/contacts/${contactA}`), tenantB)
      .send({ city: 'Cali' })
      .expect(404)
    await asTenant(request(server()).delete(`/${API_PREFIX}/contacts/${contactA}`), tenantB).expect(
      404,
    )
    await asTenant(
      request(server()).post(`/${API_PREFIX}/contacts/${contactA}/restore`),
      tenantB,
    ).expect(404)
    await asTenant(
      request(server()).get(`/${API_PREFIX}/contacts/${contactA}/timeline`),
      tenantB,
    ).expect(404)
    await asTenant(
      request(server()).get(`/${API_PREFIX}/contacts/${contactA}/consents`),
      tenantB,
    ).expect(404)
    await asTenant(request(server()).put(`/${API_PREFIX}/contacts/${contactA}/consents`), tenantB)
      .send({ channel: 'email', granted: true })
      .expect(404)
  })

  it("does not report tenant A's email as a duplicate for tenant B", async () => {
    const probe = await asTenant(
      request(server()).get(`/${API_PREFIX}/contacts/duplicates/probe?email=${EMAIL_A}`),
      tenantB,
    ).expect(200)
    expect(probe.body.data.matches ?? []).toHaveLength(0)

    await asTenant(request(server()).post(`/${API_PREFIX}/contacts`), tenantB)
      .send({ firstName: 'Beto', email: EMAIL_A })
      .expect(201)
  })

  it("never counts tenant A's rows in tenant B's taxonomy usage", async () => {
    const usage = await asTenant(
      request(server()).get(`/${API_PREFIX}/contacts/taxonomy-usage`),
      tenantB,
    ).expect(200)

    const statuses = usage.body.data.statuses as Record<string, number>
    const total = Object.values(statuses).reduce((sum, count) => sum + Number(count), 0)
    expect(total).toBe(1)
  })

  it('reassigns taxonomy only inside the caller tenant', async () => {
    const before = await asTenant(
      request(server()).get(`/${API_PREFIX}/contacts/${contactA}`),
      tenantA,
    ).expect(200)
    const statusA = before.body.data.status as string

    await asTenant(request(server()).patch(`/${API_PREFIX}/contacts/reassign-taxonomy`), tenantB)
      .send({ kind: 'status', fromKey: statusA, toKey: 'won' })
      .expect(200)

    const after = await asTenant(
      request(server()).get(`/${API_PREFIX}/contacts/${contactA}`),
      tenantA,
    ).expect(200)
    expect(after.body.data.status).toBe(statusA)
  })

  it('archives and restores within the owning tenant only', async () => {
    await asTenant(request(server()).delete(`/${API_PREFIX}/contacts/${contactA}`), tenantA).expect(
      204,
    )

    const archivedForB = await asTenant(
      request(server()).get(`/${API_PREFIX}/contacts?archived=true`),
      tenantB,
    ).expect(200)
    expect(archivedForB.body.data.total).toBe(0)

    const archivedForA = await asTenant(
      request(server()).get(`/${API_PREFIX}/contacts?archived=true`),
      tenantA,
    ).expect(200)
    expect(archivedForA.body.data.total).toBe(1)

    await asTenant(
      request(server()).post(`/${API_PREFIX}/contacts/${contactA}/restore`),
      tenantB,
    ).expect(404)
    await asTenant(
      request(server()).post(`/${API_PREFIX}/contacts/${contactA}/restore`),
      tenantA,
    ).expect(200)
  })
})
