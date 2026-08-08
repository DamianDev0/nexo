import { type INestApplication } from '@nestjs/common'
import request from 'supertest'

import { createTestApp, onboardTenant, asTenant, teardownTenants, API_PREFIX } from './helpers/e2e'
import type { TestApp, OnboardedTenant } from './helpers/e2e'
import { DEFAULT_CONTACT_TAXONOMY } from '@repo/shared-types'
import type { ContactTaxonomy } from '@repo/shared-types'

describe('Contact Taxonomy Tenant Isolation (E2E, real HTTP)', () => {
  let ctx: TestApp
  let app: INestApplication
  let tenantA: OnboardedTenant
  let tenantB: OnboardedTenant

  const SLUG_A = 'iso-taxonomy-a'
  const SLUG_B = 'iso-taxonomy-b'

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

  it("does NOT leak tenant A's custom status to tenant B", async () => {
    const customized: ContactTaxonomy = {
      statuses: [
        ...DEFAULT_CONTACT_TAXONOMY.statuses,
        { key: 'vip_a', label: 'VIP A', color: '#111111', order: 99, isSystem: false },
      ],
      sources: DEFAULT_CONTACT_TAXONOMY.sources,
    }

    await asTenant(
      request(app.getHttpServer()).patch(`/${API_PREFIX}/settings/contact-taxonomy`),
      tenantA,
    )
      .send(customized)
      .expect(200)

    const getA = await asTenant(
      request(app.getHttpServer()).get(`/${API_PREFIX}/settings/contact-taxonomy`),
      tenantA,
    ).expect(200)
    const statusKeysA = (getA.body.data.statuses as Array<{ key: string }>).map((s) => s.key)
    expect(statusKeysA).toContain('vip_a')

    const getB = await asTenant(
      request(app.getHttpServer()).get(`/${API_PREFIX}/settings/contact-taxonomy`),
      tenantB,
    ).expect(200)
    const statusKeysB = (getB.body.data.statuses as Array<{ key: string }>).map((s) => s.key)
    expect(statusKeysB).not.toContain('vip_a')
    expect(statusKeysB).toEqual(DEFAULT_CONTACT_TAXONOMY.statuses.map((s) => s.key))
  })

  it("tenant B's PATCH only affects its own taxonomy, not tenant A's", async () => {
    const bCustomized: ContactTaxonomy = {
      statuses: DEFAULT_CONTACT_TAXONOMY.statuses,
      sources: [
        ...DEFAULT_CONTACT_TAXONOMY.sources,
        { key: 'vip_source_b', label: 'B only', color: '#222222', order: 99, isSystem: false },
      ],
    }

    await asTenant(
      request(app.getHttpServer()).patch(`/${API_PREFIX}/settings/contact-taxonomy`),
      tenantB,
    )
      .send(bCustomized)
      .expect(200)

    const getB = await asTenant(
      request(app.getHttpServer()).get(`/${API_PREFIX}/settings/contact-taxonomy`),
      tenantB,
    ).expect(200)
    const sourceKeysB = (getB.body.data.sources as Array<{ key: string }>).map((s) => s.key)
    expect(sourceKeysB).toContain('vip_source_b')

    const getA = await asTenant(
      request(app.getHttpServer()).get(`/${API_PREFIX}/settings/contact-taxonomy`),
      tenantA,
    ).expect(200)
    const sourceKeysA = (getA.body.data.sources as Array<{ key: string }>).map((s) => s.key)
    expect(sourceKeysA).not.toContain('vip_source_b')
  })

  it('rejects unauthenticated access to the contact taxonomy', async () => {
    await request(app.getHttpServer())
      .get(`/${API_PREFIX}/settings/contact-taxonomy`)
      .set('x-tenant-slug', SLUG_A)
      .expect(401)
  })
})
