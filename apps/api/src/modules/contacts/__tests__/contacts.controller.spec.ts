import { Test } from '@nestjs/testing'
import { ContactsController } from '../contacts.controller'
import { ContactsService } from '../contacts.service'
import { ContactStatus, ContactSource, UserRole } from '@repo/shared-types'
import type {
  TenantContext,
  AuthenticatedUser,
  Contact,
  PaginatedContacts,
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

const mockContact: Contact = {
  id: 'c-1',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  phone: '3001234567',
  whatsapp: null,
  documentType: null,
  documentNumber: null,
  city: 'Bogotá',
  department: null,
  municipioCode: null,
  status: ContactStatus.NEW,
  source: ContactSource.MANUAL,
  leadScore: 0,
  tags: [],
  companyId: null,
  assignedToId: null,
  customFields: {},
  isActive: true,
  createdById: 'user-1',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
}

const { customFields: _cf, ...mockContactListItem } = mockContact
const mockPaginated: PaginatedContacts = {
  data: [mockContactListItem],
  total: 1,
  page: 1,
  limit: 25,
}

// ─── Mock service ─────────────────────────────────────────────────────────────

function buildServiceMock() {
  return {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    getTimeline: jest.fn(),
  }
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('ContactsController', () => {
  let controller: ContactsController
  let service: ReturnType<typeof buildServiceMock>

  beforeEach(async () => {
    service = buildServiceMock()

    const module = await Test.createTestingModule({
      controllers: [ContactsController],
      providers: [{ provide: ContactsService, useValue: service }],
    }).compile()

    controller = module.get(ContactsController)
  })

  // ─── findAll ────────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('delegates to service with schema and query', async () => {
      service.findAll.mockResolvedValue(mockPaginated)

      const result = await controller.findAll(mockCtx, {})

      expect(service.findAll).toHaveBeenCalledWith(mockCtx.schemaName, {})
      expect(result.total).toBe(1)
    })

    it('passes query filters through to service', async () => {
      service.findAll.mockResolvedValue({ ...mockPaginated, data: [] })

      await controller.findAll(mockCtx, { status: ContactStatus.QUALIFIED, q: 'john' })

      expect(service.findAll).toHaveBeenCalledWith(mockCtx.schemaName, {
        status: ContactStatus.QUALIFIED,
        q: 'john',
      })
    })
  })

  // ─── create ─────────────────────────────────────────────────────────────

  describe('create', () => {
    it('delegates to service with schema, dto and user id', async () => {
      service.create.mockResolvedValue(mockContact)

      const dto = { firstName: 'John', email: 'john@example.com' }
      const result = await controller.create(dto, mockCtx, mockUser)

      expect(service.create).toHaveBeenCalledWith(mockCtx.schemaName, dto, mockUser.id)
      expect(result.id).toBe('c-1')
    })
  })

  // ─── findOne ────────────────────────────────────────────────────────────

  describe('findOne', () => {
    it('delegates to service with schema and id', async () => {
      service.findOne.mockResolvedValue(mockContact)

      const result = await controller.findOne('c-1', mockCtx)

      expect(service.findOne).toHaveBeenCalledWith(mockCtx.schemaName, 'c-1')
      expect(result.firstName).toBe('John')
    })

    it('propagates NotFoundException from service', async () => {
      const { NotFoundException } = await import('@nestjs/common')
      service.findOne.mockRejectedValue(new NotFoundException())

      await expect(controller.findOne('missing', mockCtx)).rejects.toThrow(NotFoundException)
    })
  })

  // ─── update ─────────────────────────────────────────────────────────────

  describe('update', () => {
    it('delegates to service with schema, id and dto', async () => {
      const updated = { ...mockContact, firstName: 'Jane' }
      service.update.mockResolvedValue(updated)

      const result = await controller.update('c-1', { firstName: 'Jane' }, mockCtx)

      expect(service.update).toHaveBeenCalledWith(mockCtx.schemaName, 'c-1', { firstName: 'Jane' })
      expect(result.firstName).toBe('Jane')
    })
  })

  // ─── remove ─────────────────────────────────────────────────────────────

  describe('remove', () => {
    it('delegates to service and returns void', async () => {
      service.remove.mockResolvedValue(undefined)

      await expect(controller.remove('c-1', mockCtx)).resolves.toBeUndefined()
      expect(service.remove).toHaveBeenCalledWith(mockCtx.schemaName, 'c-1')
    })
  })

  // ─── getTimeline ────────────────────────────────────────────────────────

  describe('getTimeline', () => {
    it('delegates to service and returns timeline', async () => {
      const timeline = { activities: [], deals: [] }
      service.getTimeline.mockResolvedValue(timeline)

      const result = await controller.getTimeline('c-1', mockCtx)

      expect(service.getTimeline).toHaveBeenCalledWith(mockCtx.schemaName, 'c-1')
      expect(result.activities).toHaveLength(0)
    })
  })
})
