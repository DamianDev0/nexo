import { NotFoundException } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { CompaniesController } from '../companies.controller'
import { CompaniesService } from '../companies.service'
import { UserRole, TaxRegime, CompanySize, CIIUSector } from '@repo/shared-types'
import type {
  TenantContext,
  AuthenticatedUser,
  Company,
  PaginatedCompanies,
  CompanySummary,
} from '@repo/shared-types'

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const mockCtx: TenantContext = {
  tenantId: 'tenant-1',
  slug: 'acme',
  schemaName: 'tenant_acme',
  plan: 'free',
  config: {},
  productName: 'NexoCRM',
  customDomain: null,
}

const mockUser: AuthenticatedUser = {
  id: 'user-1',
  email: 'owner@acme.com',
  role: UserRole.OWNER,
  tenantId: 'tenant-1',
  schemaName: 'tenant_acme',
}

const mockCompany: Company = {
  id: 'co-1',
  name: 'Acme Corp S.A.S',
  nit: '900123456',
  nitDv: '8',
  nitFormatted: '900.123.456-8',
  taxRegime: TaxRegime.RESPONSIBLE_VAT,
  companySize: CompanySize.SMALL,
  sectorCiiu: CIIUSector.C,
  website: 'https://acme.co',
  phone: '3001234567',
  email: 'info@acme.co',
  address: 'Calle 123',
  city: 'Bogotá',
  department: 'Cundinamarca',
  municipioCode: '11001',
  tags: ['cliente'],
  assignedToId: null,
  customFields: {},
  isActive: true,
  createdById: 'user-1',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
}

const { customFields: _cf, ...mockCompanyListItem } = mockCompany
const mockPaginated: PaginatedCompanies = {
  data: [mockCompanyListItem],
  total: 1,
  page: 1,
  limit: 25,
}

const mockSummary: CompanySummary = {
  ...mockCompany,
  stats: {
    contactCount: 2,
    activeDealCount: 1,
    totalDealsValueCents: 500000,
    invoiceCount: 3,
    totalBilledCents: 1000000,
    pendingDebtCents: 200000,
  },
  contacts: [],
  deals: [],
}

// ─── Mock service ─────────────────────────────────────────────────────────────

function buildServiceMock() {
  return {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    getSummary: jest.fn(),
    assignContact: jest.fn(),
    removeContact: jest.fn(),
  }
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('CompaniesController', () => {
  let controller: CompaniesController
  let service: ReturnType<typeof buildServiceMock>

  beforeEach(async () => {
    service = buildServiceMock()

    const module = await Test.createTestingModule({
      controllers: [CompaniesController],
      providers: [{ provide: CompaniesService, useValue: service }],
    }).compile()

    controller = module.get(CompaniesController)
  })

  // ─── findAll ──────────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('delegates to service with schema and query', async () => {
      service.findAll.mockResolvedValue(mockPaginated)

      const result = await controller.findAll(mockCtx, {})

      expect(service.findAll).toHaveBeenCalledWith(mockCtx.schemaName, {})
      expect(result.total).toBe(1)
      expect(result.data[0]?.name).toBe('Acme Corp S.A.S')
    })

    it('passes filters through to service', async () => {
      service.findAll.mockResolvedValue({ ...mockPaginated, data: [] })

      await controller.findAll(mockCtx, { taxRegime: TaxRegime.RESPONSIBLE_VAT, q: 'acme' })

      expect(service.findAll).toHaveBeenCalledWith(mockCtx.schemaName, {
        taxRegime: TaxRegime.RESPONSIBLE_VAT,
        q: 'acme',
      })
    })
  })

  // ─── create ───────────────────────────────────────────────────────────────

  describe('create', () => {
    it('delegates to service with schema, dto and user id', async () => {
      service.create.mockResolvedValue(mockCompany)

      const dto = { name: 'Acme Corp S.A.S', nit: '900123456' }
      const result = await controller.create(dto, mockCtx, mockUser)

      expect(service.create).toHaveBeenCalledWith(mockCtx.schemaName, dto, mockUser.id)
      expect(result.id).toBe('co-1')
      expect(result.nitFormatted).toBe('900.123.456-8')
    })
  })

  // ─── findOne ──────────────────────────────────────────────────────────────

  describe('findOne', () => {
    it('delegates to service with schema and id', async () => {
      service.findOne.mockResolvedValue(mockCompany)

      const result = await controller.findOne('co-1', mockCtx)

      expect(service.findOne).toHaveBeenCalledWith(mockCtx.schemaName, 'co-1')
      expect(result.name).toBe('Acme Corp S.A.S')
    })

    it('propagates NotFoundException from service', async () => {
      service.findOne.mockRejectedValue(new NotFoundException())

      await expect(controller.findOne('missing', mockCtx)).rejects.toThrow(NotFoundException)
    })
  })

  // ─── update ───────────────────────────────────────────────────────────────

  describe('update', () => {
    it('delegates to service with schema, id and dto', async () => {
      const updated = { ...mockCompany, name: 'Updated Corp' }
      service.update.mockResolvedValue(updated)

      const result = await controller.update('co-1', { name: 'Updated Corp' }, mockCtx)

      expect(service.update).toHaveBeenCalledWith(mockCtx.schemaName, 'co-1', {
        name: 'Updated Corp',
      })
      expect(result.name).toBe('Updated Corp')
    })
  })

  // ─── remove ───────────────────────────────────────────────────────────────

  describe('remove', () => {
    it('delegates to service and returns void', async () => {
      service.remove.mockResolvedValue(undefined)

      await expect(controller.remove('co-1', mockCtx)).resolves.toBeUndefined()
      expect(service.remove).toHaveBeenCalledWith(mockCtx.schemaName, 'co-1')
    })
  })

  // ─── getSummary ───────────────────────────────────────────────────────────

  describe('getSummary', () => {
    it('delegates to service and returns summary', async () => {
      service.getSummary.mockResolvedValue(mockSummary)

      const result = await controller.getSummary('co-1', mockCtx)

      expect(service.getSummary).toHaveBeenCalledWith(mockCtx.schemaName, 'co-1')
      expect(result.stats.contactCount).toBe(2)
      expect(result.stats.totalDealsValueCents).toBe(500000)
    })

    it('propagates NotFoundException from service', async () => {
      service.getSummary.mockRejectedValue(new NotFoundException())

      await expect(controller.getSummary('missing', mockCtx)).rejects.toThrow(NotFoundException)
    })
  })

  // ─── assignContact ────────────────────────────────────────────────────────

  describe('assignContact', () => {
    it('delegates to service with company id and contact id', async () => {
      service.assignContact.mockResolvedValue(undefined)

      await expect(
        controller.assignContact('co-1', { contactId: 'cnt-1' }, mockCtx),
      ).resolves.toBeUndefined()

      expect(service.assignContact).toHaveBeenCalledWith(mockCtx.schemaName, 'co-1', 'cnt-1')
    })
  })

  // ─── removeContact ────────────────────────────────────────────────────────

  describe('removeContact', () => {
    it('delegates to service with company id and contact id', async () => {
      service.removeContact.mockResolvedValue(undefined)

      await expect(controller.removeContact('co-1', 'cnt-1', mockCtx)).resolves.toBeUndefined()

      expect(service.removeContact).toHaveBeenCalledWith(mockCtx.schemaName, 'co-1', 'cnt-1')
    })

    it('propagates NotFoundException from service', async () => {
      service.removeContact.mockRejectedValue(new NotFoundException())

      await expect(controller.removeContact('co-1', 'not-assigned', mockCtx)).rejects.toThrow(
        NotFoundException,
      )
    })
  })
})
