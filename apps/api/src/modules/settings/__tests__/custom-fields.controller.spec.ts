import type { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { PlanName } from '@repo/shared-types'
import type { TenantContext } from '@repo/shared-types'
import { CustomFieldsController } from '../controllers/custom-fields.controller'
import { TenantConfigService } from '../services/tenant-config.service'
import { AuditLogService } from '@/modules/audit-log/services/audit-log.service'

const mockCtx: TenantContext = {
  tenantId: 'tenant-1',
  slug: 'acme',
  schemaName: 'tenant_acme',
  plan: PlanName.FREE,
  config: {},
  productName: 'NexoCRM',
  customDomain: null,
}

function buildServiceMock() {
  return {
    getCustomFields: jest.fn().mockResolvedValue({
      contacts: [{ key: 'nit', label: 'NIT', type: 'text', required: false, unique: false, order: 1 }],
      companies: [],
      deals: [],
    }),
    updateCustomFields: jest.fn().mockImplementation((_id, config) => Promise.resolve(config)),
    getFieldPermissions: jest.fn().mockResolvedValue({ contacts: {}, companies: {}, deals: {} }),
    updateFieldPermissions: jest.fn().mockImplementation((_id, config) => Promise.resolve(config)),
  }
}

describe('CustomFieldsController routing', () => {
  let app: INestApplication
  let service: ReturnType<typeof buildServiceMock>

  beforeEach(async () => {
    service = buildServiceMock()
    const module = await Test.createTestingModule({
      controllers: [CustomFieldsController],
      providers: [
        { provide: TenantConfigService, useValue: service },
        { provide: AuditLogService, useValue: { settingsUpdated: jest.fn() } },
      ],
    }).compile()

    app = module.createNestApplication()
    app.use((req: { tenantContext?: TenantContext }, _res: unknown, next: () => void) => {
      req.tenantContext = mockCtx
      next()
    })
    await app.init()
  })

  afterEach(async () => {
    await app.close()
  })

  it('routes PATCH permissions/:entity to updateFieldPermissions, not updateField', async () => {
    const response = await request(app.getHttpServer())
      .patch('/settings/custom-fields/permissions/contacts')
      .send({ permissions: [{ key: 'nit', visibility: 'all', editable: 'admin_plus' }] })

    expect(response.status).toBe(200)
    expect(service.updateFieldPermissions).toHaveBeenCalledWith(
      mockCtx.tenantId,
      expect.objectContaining({
        contacts: { nit: { visibility: 'all', editable: 'admin_plus' } },
      }),
      mockCtx.slug,
    )
  })

  it('routes GET permissions/:entity to getFieldPermissions', async () => {
    const response = await request(app.getHttpServer()).get(
      '/settings/custom-fields/permissions/contacts',
    )

    expect(response.status).toBe(200)
    expect(service.getFieldPermissions).toHaveBeenCalledWith(mockCtx.tenantId)
  })

  it('still routes PATCH :entity/:key to updateField', async () => {
    const response = await request(app.getHttpServer())
      .patch('/settings/custom-fields/contacts/nit')
      .send({ label: 'NIT empresa' })

    expect(response.status).toBe(200)
    expect(response.body.label).toBe('NIT empresa')
    expect(service.updateCustomFields).toHaveBeenCalled()
  })

  it('rejects an invalid entity on the permissions routes', async () => {
    const response = await request(app.getHttpServer()).get(
      '/settings/custom-fields/permissions/products',
    )

    expect(response.status).toBe(400)
  })
})
