import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import * as request from 'supertest'
import { DataSource } from 'typeorm'
import { UserRole } from '@repo/shared-types'

import { AppModule } from '../src/app.module'
import { TenantProvisioningService } from '../src/modules/tenants/services/tenant-provisioning.service'
import { TokenService } from '../src/modules/auth/services/token.service'

interface CreatedTenant {
  id: string
  slug: string
  schemaName: string
}

describe('Tenant HTTP isolation — TenantMatchGuard (E2E)', () => {
  let app: INestApplication
  let dataSource: DataSource
  let provisioning: TenantProvisioningService
  let tokens: TokenService

  const A_SLUG = 'match-tenant-a'
  const B_SLUG = 'match-tenant-b'
  let tenantA: CreatedTenant
  let tenantB: CreatedTenant

  async function createTenant(name: string, slug: string): Promise<CreatedTenant> {
    const res = await request(app.getHttpServer())
      .post('/api/v1/tenants')
      .send({ name, slug })
      .expect(201)
    return res.body.data as CreatedTenant
  }

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    app.setGlobalPrefix('api/v1')
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
    await app.init()

    dataSource = moduleFixture.get(DataSource)
    provisioning = moduleFixture.get(TenantProvisioningService)
    tokens = moduleFixture.get(TokenService)

    tenantA = await createTenant('Match Tenant A', A_SLUG)
    tenantB = await createTenant('Match Tenant B', B_SLUG)
  })

  afterAll(async () => {
    try {
      await provisioning.dropTenantSchema(tenantA.schemaName)
    } catch {
      /* ignore */
    }
    try {
      await provisioning.dropTenantSchema(tenantB.schemaName)
    } catch {
      /* ignore */
    }
    await dataSource.query(`DELETE FROM public.tenants WHERE slug IN ($1, $2)`, [A_SLUG, B_SLUG])
    await app.close()
  })

  function tokenForTenant(tenant: CreatedTenant): string {
    return tokens.generateAccessToken({
      sub: 'attacker-user',
      email: 'attacker@tenant-a.com',
      role: UserRole.OWNER,
      tenantId: tenant.id,
      schemaName: tenant.schemaName,
    })
  }

  it("blocks a tenant-A token sent against tenant-B's subdomain with 403", async () => {
    const tokenA = tokenForTenant(tenantA)

    await request(app.getHttpServer())
      .get('/api/v1/contacts')
      .set('Authorization', `Bearer ${tokenA}`)
      .set('x-tenant-slug', B_SLUG)
      .expect(403)
  })

  it('allows the same token against its own tenant subdomain', async () => {
    const tokenA = tokenForTenant(tenantA)

    await request(app.getHttpServer())
      .get('/api/v1/contacts')
      .set('Authorization', `Bearer ${tokenA}`)
      .set('x-tenant-slug', A_SLUG)
      .expect((res) => {
        if (res.status === 403) throw new Error('own-tenant request must not be forbidden')
      })
  })
})
