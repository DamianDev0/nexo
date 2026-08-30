import { type INestApplication } from '@nestjs/common'
import request from 'supertest'

import { createTestApp, onboardTenant, asTenant, teardownTenants, API_PREFIX } from './helpers/e2e'
import type { TestApp, OnboardedTenant } from './helpers/e2e'

describe('Contact Workspace Tenant Isolation (E2E, real HTTP)', () => {
  let ctx: TestApp
  let app: INestApplication
  let tenantA: OnboardedTenant
  let tenantB: OnboardedTenant

  const SLUG_A = 'iso-workspace-a'
  const SLUG_B = 'iso-workspace-b'

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

  it('returns an empty/default workspace state before anything is saved', async () => {
    const workspaceA = await asTenant(
      request(app.getHttpServer()).get(`/${API_PREFIX}/contacts/workspace`),
      tenantA,
    ).expect(200)

    expect(workspaceA.body.data.activeViewId).toBeNull()
    expect(workspaceA.body.data.tableState).toEqual({})
  })

  it("does NOT leak tenant A's saved workspace state to tenant B", async () => {
    const createdView = await asTenant(
      request(app.getHttpServer()).post(`/${API_PREFIX}/contacts/views`),
      tenantA,
    )
      .send({ name: 'Hot leads', filters: { status: 'new' }, columns: { hidden: ['city'] } })
      .expect(201)
    const viewId = createdView.body.data.id as string

    await asTenant(request(app.getHttpServer()).patch(`/${API_PREFIX}/contacts/workspace`), tenantA)
      .send({ activeViewId: viewId, tableState: { density: 'compact' } })
      .expect(204)

    const workspaceA = await asTenant(
      request(app.getHttpServer()).get(`/${API_PREFIX}/contacts/workspace`),
      tenantA,
    ).expect(200)
    expect(workspaceA.body.data.activeViewId).toBe(viewId)
    expect(workspaceA.body.data.tableState).toEqual({ density: 'compact' })

    const workspaceB = await asTenant(
      request(app.getHttpServer()).get(`/${API_PREFIX}/contacts/workspace`),
      tenantB,
    ).expect(200)
    expect(workspaceB.body.data.activeViewId).toBeNull()
    expect(workspaceB.body.data.tableState).toEqual({})
    const viewIdsB = (workspaceB.body.data.views as Array<{ id: string }>).map((v) => v.id)
    expect(viewIdsB).not.toContain(viewId)
  })

  it('rejects unauthenticated access to the contacts workspace', async () => {
    await request(app.getHttpServer())
      .get(`/${API_PREFIX}/contacts/workspace`)
      .set('x-tenant-slug', SLUG_A)
      .expect(401)
  })
})
