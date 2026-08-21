import { Test } from '@nestjs/testing'
import { ContactsController } from '../controllers/contacts.controller'
import { ContactsService } from '../services/contacts.service'
import { ContactImportService } from '../services/contact-import.service'
import { CustomFieldsValidator } from '@/modules/settings/services/custom-fields-validator.service'
import { TenantConfigService } from '@/modules/settings/services/tenant-config.service'
import { makeAuthenticatedUser, makeTenantContext } from '@/shared/testing/tenant-context.mock'
import { DEFAULT_CONTACT_TAXONOMY, LifecycleStage, UserRole } from '@repo/shared-types'
import type { Contact, PaginatedContacts } from '@repo/shared-types'

const mockCtx = makeTenantContext()
const mockUser = makeAuthenticatedUser({ email: 'owner@acme.com', role: UserRole.OWNER })

const mockContact: Contact = {
  id: 'c-1',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  phone: '3001234567',
  whatsapp: null,
  documentType: null,
  documentNumber: null,
  jobTitle: null,
  linkedinUrl: null,
  birthday: null,
  address: null,
  city: 'Bogotá',
  department: null,
  municipioCode: null,
  country: 'Colombia',
  status: 'new',
  statusChangedAt: null,
  avatarUrl: null,
  lifecycleStage: LifecycleStage.LEAD,
  source: 'manual',
  type: null,
  typeLabel: null,
  leadScore: 0,
  dataConsent: false,
  consentDate: null,
  consentSource: null,
  optOutEmail: false,
  optOutSms: false,
  optOutWhatsapp: false,
  lastContactedAt: null,
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

function buildServiceMock() {
  return {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    getTimeline: jest.fn(),
    counts: jest.fn(),
    probeDuplicates: jest.fn(),
  }
}

describe('ContactsController', () => {
  let controller: ContactsController
  let service: ReturnType<typeof buildServiceMock>

  beforeEach(async () => {
    service = buildServiceMock()

    const importService = { analyze: jest.fn(), preview: jest.fn(), execute: jest.fn() }

    const module = await Test.createTestingModule({
      controllers: [ContactsController],
      providers: [
        { provide: ContactsService, useValue: service },
        { provide: ContactImportService, useValue: importService },
        { provide: CustomFieldsValidator, useValue: { validate: jest.fn() } },
        {
          provide: TenantConfigService,
          useValue: {
            getContactTaxonomy: jest.fn().mockResolvedValue(DEFAULT_CONTACT_TAXONOMY),
          },
        },
      ],
    }).compile()

    controller = module.get(ContactsController)
  })

  describe('findAll', () => {
    it('delegates to service with schema and query', async () => {
      service.findAll.mockResolvedValue(mockPaginated)

      const result = await controller.findAll(mockCtx, {})

      expect(service.findAll).toHaveBeenCalledWith(mockCtx.schemaName, {})
      expect(result.total).toBe(1)
    })

    it('passes query filters through to service', async () => {
      service.findAll.mockResolvedValue({ ...mockPaginated, data: [] })

      await controller.findAll(mockCtx, { status: 'qualified', q: 'john' })

      expect(service.findAll).toHaveBeenCalledWith(mockCtx.schemaName, {
        status: 'qualified',
        q: 'john',
      })
    })
  })

  describe('create', () => {
    it('delegates to service with schema, dto and user id', async () => {
      service.create.mockResolvedValue(mockContact)

      const dto = { firstName: 'John', email: 'john@example.com' }
      const result = await controller.create(dto, mockCtx, mockUser, undefined)

      expect(service.create).toHaveBeenCalledWith(
        mockCtx.schemaName,
        dto,
        mockUser.id,
        false,
        DEFAULT_CONTACT_TAXONOMY,
      )
      expect(result.id).toBe('c-1')
    })
  })

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

  describe('update', () => {
    it('delegates to service with schema, id and dto', async () => {
      const updated = { ...mockContact, firstName: 'Jane' }
      service.update.mockResolvedValue(updated)

      const result = await controller.update(
        'c-1',
        { firstName: 'Jane' },
        mockCtx,
        mockUser,
        undefined,
      )

      expect(service.update).toHaveBeenCalledWith(
        mockCtx.schemaName,
        'c-1',
        { firstName: 'Jane' },
        false,
        DEFAULT_CONTACT_TAXONOMY,
        mockUser.id,
      )
      expect(result.firstName).toBe('Jane')
    })
  })

  describe('remove', () => {
    it('delegates to service and returns void', async () => {
      service.remove.mockResolvedValue(undefined)

      await expect(controller.remove('c-1', mockCtx)).resolves.toBeUndefined()
      expect(service.remove).toHaveBeenCalledWith(mockCtx.schemaName, 'c-1')
    })
  })

  describe('counts', () => {
    it('delegates to service with schema', async () => {
      service.counts.mockResolvedValue({ total: 5, byStatus: { new: 5 } })

      const result = await controller.counts(mockCtx)

      expect(service.counts).toHaveBeenCalledWith(mockCtx.schemaName)
      expect(result).toEqual({ total: 5, byStatus: { new: 5 } })
    })
  })

  describe('probeDuplicates', () => {
    it('delegates to service with schema and probe query', async () => {
      service.probeDuplicates.mockResolvedValue({ duplicate: null })

      const query = { email: 'john@example.com', excludeId: 'c-1' }
      const result = await controller.probeDuplicates(mockCtx, query)

      expect(service.probeDuplicates).toHaveBeenCalledWith(mockCtx.schemaName, query)
      expect(result).toEqual({ duplicate: null })
    })
  })

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
