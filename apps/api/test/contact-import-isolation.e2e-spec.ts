import { type INestApplication } from '@nestjs/common'
import request from 'supertest'

import { createTestApp, onboardTenant, asTenant, teardownTenants, API_PREFIX } from './helpers/e2e'
import type { TestApp, OnboardedTenant } from './helpers/e2e'

describe('Contact Import Tenant Isolation (E2E, real HTTP)', () => {
  let ctx: TestApp
  let app: INestApplication
  let tenantA: OnboardedTenant
  let tenantB: OnboardedTenant
  let fileId: string

  const SLUG_A = 'iso-contact-import-a'
  const SLUG_B = 'iso-contact-import-b'
  const CSV = Buffer.from('firstName,lastName,email\nAna,Salazar,ana@confidencial.co\n')
  const MAPPING = { firstName: 'firstName', lastName: 'lastName', email: 'email' }

  beforeAll(async () => {
    ctx = await createTestApp()
    app = ctx.app
    await teardownTenants(ctx, [SLUG_A, SLUG_B])
    tenantA = await onboardTenant(app, SLUG_A)
    tenantB = await onboardTenant(app, SLUG_B)

    const analyzed = await asTenant(
      request(app.getHttpServer()).post(`/${API_PREFIX}/contacts/import/analyze`),
      tenantA,
    )
      .attach('file', CSV, 'contactos.csv')
      .expect(201)

    fileId = analyzed.body.data.fileId as string
    expect(fileId).toBeTruthy()
  })

  afterAll(async () => {
    await teardownTenants(ctx, [SLUG_A, SLUG_B])
    await app.close()
  })

  it("refuses to preview tenant A's uploaded file for tenant B", async () => {
    await asTenant(
      request(app.getHttpServer()).post(`/${API_PREFIX}/contacts/import/preview`),
      tenantB,
    )
      .send({ fileId, mapping: MAPPING })
      .expect(400)
  })

  it("refuses to validate tenant A's uploaded file for tenant B", async () => {
    await asTenant(
      request(app.getHttpServer()).post(`/${API_PREFIX}/contacts/import/validate`),
      tenantB,
    )
      .send({ fileId, mapping: MAPPING })
      .expect(400)
  })

  it("refuses to import tenant A's uploaded file into tenant B", async () => {
    await asTenant(
      request(app.getHttpServer()).post(`/${API_PREFIX}/contacts/import/execute`),
      tenantB,
    )
      .send({ fileId, mapping: MAPPING, duplicateStrategy: 'skip' })
      .expect(400)

    const listB = await asTenant(
      request(app.getHttpServer()).get(`/${API_PREFIX}/contacts`),
      tenantB,
    ).expect(200)
    expect(listB.body.data.total).toBe(0)
  })

  it('still lets the uploading tenant import its own file', async () => {
    const executed = await asTenant(
      request(app.getHttpServer()).post(`/${API_PREFIX}/contacts/import/execute`),
      tenantA,
    )
      .send({ fileId, mapping: MAPPING, duplicateStrategy: 'skip' })
      .expect(201)

    expect(executed.body.data.imported).toBe(1)
  })
})
