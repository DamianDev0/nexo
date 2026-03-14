import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import * as request from 'supertest'
import { DataSource } from 'typeorm'

import { AppModule } from '../src/app.module'
import { TenantProvisioningService } from '../src/modules/tenants/services/tenant-provisioning.service'

describe('Tenant Isolation (E2E)', () => {
  let app: INestApplication
  let dataSource: DataSource
  let provisioning: TenantProvisioningService

  const TENANT_A_SLUG = 'test-tenant-a'
  const TENANT_B_SLUG = 'test-tenant-b'
  const SCHEMA_A = 'tenant_test_tenant_a'
  const SCHEMA_B = 'tenant_test_tenant_b'

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    app.setGlobalPrefix('api/v1')
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    )
    await app.init()

    dataSource = moduleFixture.get(DataSource)
    provisioning = moduleFixture.get(TenantProvisioningService)
  })

  afterAll(async () => {
    // Cleanup test schemas
    try {
      await provisioning.dropTenantSchema(SCHEMA_A)
    } catch { /* ignore */ }
    try {
      await provisioning.dropTenantSchema(SCHEMA_B)
    } catch { /* ignore */ }

    // Cleanup test tenant records
    await dataSource.query(`DELETE FROM public.tenants WHERE slug IN ($1, $2)`, [
      TENANT_A_SLUG,
      TENANT_B_SLUG,
    ])

    await app.close()
  })

  it('should create two tenants with isolated schemas', async () => {
    // Create tenant A
    const responseA = await request(app.getHttpServer())
      .post('/api/v1/tenants')
      .send({ name: 'Empresa A', slug: TENANT_A_SLUG })
      .expect(201)

    expect(responseA.body.data.slug).toBe(TENANT_A_SLUG)
    expect(responseA.body.data.schemaName).toBe(SCHEMA_A)

    // Create tenant B
    const responseB = await request(app.getHttpServer())
      .post('/api/v1/tenants')
      .send({ name: 'Empresa B', slug: TENANT_B_SLUG })
      .expect(201)

    expect(responseB.body.data.slug).toBe(TENANT_B_SLUG)
    expect(responseB.body.data.schemaName).toBe(SCHEMA_B)
  })

  it('should isolate data between tenant schemas', async () => {
    // Insert a contact directly into tenant A's schema
    await dataSource.query(
      `INSERT INTO "${SCHEMA_A}".contacts (first_name, last_name, email)
       VALUES ($1, $2, $3)`,
      ['Juan', 'García', 'juan@empresaa.co'],
    )

    // Insert a contact into tenant B's schema
    await dataSource.query(
      `INSERT INTO "${SCHEMA_B}".contacts (first_name, last_name, email)
       VALUES ($1, $2, $3)`,
      ['María', 'López', 'maria@empresab.co'],
    )

    // Query tenant A — should only see Juan
    const contactsA = await dataSource.query(
      `SELECT * FROM "${SCHEMA_A}".contacts WHERE is_active = true`,
    )
    expect(contactsA).toHaveLength(1)
    expect(contactsA[0].first_name).toBe('Juan')

    // Query tenant B — should only see María
    const contactsB = await dataSource.query(
      `SELECT * FROM "${SCHEMA_B}".contacts WHERE is_active = true`,
    )
    expect(contactsB).toHaveLength(1)
    expect(contactsB[0].first_name).toBe('María')

    // Tenant A should NOT see María
    const crossCheck = await dataSource.query(
      `SELECT * FROM "${SCHEMA_A}".contacts WHERE email = $1`,
      ['maria@empresab.co'],
    )
    expect(crossCheck).toHaveLength(0)
  })

  it('should reject duplicate tenant slugs', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/tenants')
      .send({ name: 'Empresa A Duplicada', slug: TENANT_A_SLUG })
      .expect(409)
  })
})
