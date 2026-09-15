import { Test } from '@nestjs/testing'
import { ContactsController } from '../controllers/contacts.controller'
import { ContactsService } from '../services/contacts.service'
import { ContactMergeService } from '../services/contact-merge.service'
import { ContactImportService } from '../services/contact-import.service'
import { CustomFieldsValidator } from '@/modules/settings/services/custom-fields-validator.service'
import { TenantConfigService } from '@/modules/settings/services/tenant-config.service'
import { makeAuthenticatedUser, makeTenantContext } from '@/shared/testing/tenant-context.mock'
import { DEFAULT_CONTACT_TAXONOMY, LifecycleStage, UserRole } from '@repo/shared-types'
import type { Contact, FieldDef, PaginatedContacts } from '@repo/shared-types'

function makeFieldDef(overrides: Partial<FieldDef> = {}): FieldDef {
  return {
    key: 'industry',
    label: 'Industry',
    type: 'text',
    required: false,
    unique: false,
    order: 1,
    isActive: true,
    ...overrides,
  }
}

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
  avatarUrl: null,
  city: 'Bogotá',
  municipioCode: null,
  status: 'new',
  statusChangedAt: null,
  lifecycleStage: LifecycleStage.LEAD,
  source: 'manual',
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

const { customFields: _cf, ...contactBase } = mockContact
const mockContactListItem = {
  ...contactBase,
  assignedToName: null,
  noteCount: 0,
  optedOutChannels: [],
  nextActivity: null,
}
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
    restore: jest.fn(),
    getTimeline: jest.fn(),
    counts: jest.fn(),
    taxonomyUsage: jest.fn(),
    reassignTaxonomy: jest.fn(),
    probeDuplicates: jest.fn(),
  }
}

function buildImportServiceMock() {
  return {
    analyze: jest.fn(),
    preview: jest.fn(),
    validate: jest.fn(),
    execute: jest.fn(),
  }
}

describe('ContactsController', () => {
  let controller: ContactsController
  let service: ReturnType<typeof buildServiceMock>
  let mergeService: { merge: jest.Mock }
  let importService: ReturnType<typeof buildImportServiceMock>
  let tenantConfig: { getContactTaxonomy: jest.Mock; getCustomFields: jest.Mock }

  beforeEach(async () => {
    service = buildServiceMock()
    mergeService = { merge: jest.fn() }
    importService = buildImportServiceMock()
    tenantConfig = {
      getContactTaxonomy: jest.fn().mockResolvedValue(DEFAULT_CONTACT_TAXONOMY),
      getCustomFields: jest.fn().mockResolvedValue({ contacts: [], companies: [], deals: [] }),
    }

    const module = await Test.createTestingModule({
      controllers: [ContactsController],
      providers: [
        { provide: ContactsService, useValue: service },
        { provide: ContactMergeService, useValue: mergeService },
        { provide: ContactImportService, useValue: importService },
        { provide: CustomFieldsValidator, useValue: { validate: jest.fn() } },
        { provide: TenantConfigService, useValue: tenantConfig },
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
        { id: mockUser.id, tenantId: mockCtx.tenantId },
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

  describe('restore', () => {
    it('delegates to service with schema, id and the current user id', async () => {
      service.restore.mockResolvedValue(mockContact)

      const result = await controller.restore('c-1', mockCtx, mockUser)

      expect(service.restore).toHaveBeenCalledWith(mockCtx.schemaName, 'c-1', mockUser.id)
      expect(result).toBe(mockContact)
    })
  })

  describe('taxonomyUsage', () => {
    it('delegates to service with schema', async () => {
      const usage = {
        statuses: { new: 3 },
        sources: { manual: 5 },
        lifecycleStages: { lead: 2 },
        tags: { vip: 1 },
      }
      service.taxonomyUsage.mockResolvedValue(usage)

      const result = await controller.taxonomyUsage(mockCtx)

      expect(service.taxonomyUsage).toHaveBeenCalledWith(mockCtx.schemaName)
      expect(result).toEqual(usage)
    })
  })

  describe('reassignTaxonomy', () => {
    it('delegates to service with schema, kind, fromKey and toKey', async () => {
      service.reassignTaxonomy.mockResolvedValue({ reassigned: 4 })

      const result = await controller.reassignTaxonomy(
        { kind: 'tag', fromKey: 'vip', toKey: 'gold' },
        mockCtx,
      )

      expect(service.reassignTaxonomy).toHaveBeenCalledWith(
        mockCtx.schemaName,
        'tag',
        'vip',
        'gold',
      )
      expect(result).toEqual({ reassigned: 4 })
    })
  })

  describe('counts', () => {
    it('delegates to service with schema', async () => {
      const counts = {
        total: 5,
        archived: 0,
        mine: 1,
        unassigned: 4,
        unassignedRecent: 2,
        byStatus: { new: 5 },
      }
      service.counts.mockResolvedValue(counts)

      const result = await controller.counts(mockCtx, mockUser)

      expect(service.counts).toHaveBeenCalledWith(mockCtx.schemaName, mockUser.id)
      expect(result).toEqual(counts)
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

  describe('merge', () => {
    it('hands the surviving id, the loser and the actor to the merge service', async () => {
      const result = { contact: { id: 'c-1' }, movedRecords: 3 }
      mergeService.merge.mockResolvedValue(result)

      await expect(
        controller.merge(mockCtx, mockUser, 'c-1', { loserId: 'c-2', fieldsFromLoser: ['email'] }),
      ).resolves.toBe(result)

      expect(mergeService.merge).toHaveBeenCalledWith(
        mockCtx.schemaName,
        'c-1',
        { loserId: 'c-2', fieldsFromLoser: ['email'] },
        mockUser.id,
      )
    })
  })

  describe('getTimeline', () => {
    it('delegates to service and returns timeline', async () => {
      const timeline = { activities: [], deals: [] }
      service.getTimeline.mockResolvedValue(timeline)

      const result = await controller.getTimeline('c-1', mockCtx, {})

      expect(service.getTimeline).toHaveBeenCalledWith(mockCtx.schemaName, 'c-1', undefined)
      expect(result.activities).toHaveLength(0)
    })

    it('leaves the default limit to the service when the query omits it', async () => {
      service.getTimeline.mockResolvedValue({ activities: [], deals: [] })

      await controller.getTimeline('c-1', mockCtx, {})

      const [, , limitArg] = service.getTimeline.mock.calls[0] as [
        string,
        string,
        number | undefined,
      ]
      expect(limitArg).toBeUndefined()
    })

    it('passes a caller-provided limit through to the service', async () => {
      service.getTimeline.mockResolvedValue({ activities: [], deals: [] })

      await controller.getTimeline('c-1', mockCtx, { limit: 10 })

      expect(service.getTimeline).toHaveBeenCalledWith(mockCtx.schemaName, 'c-1', 10)
    })
  })

  describe('import routes', () => {
    const customFieldsConfig = {
      contacts: [
        makeFieldDef({ key: 'industry' }),
        makeFieldDef({ key: 'legacy', isActive: false }),
      ],
      companies: [],
      deals: [],
    }

    beforeEach(() => {
      tenantConfig.getCustomFields.mockResolvedValue(customFieldsConfig)
    })

    describe('analyzeImport', () => {
      it('passes the uploaded file and the active custom field defs to the import service', async () => {
        const file = { originalname: 'contacts.csv' } as Express.Multer.File
        const analyzeResult = { columns: [], suggestions: [], sampleRows: [] }
        importService.analyze.mockResolvedValue(analyzeResult)

        const result = await controller.analyzeImport(file, mockCtx)

        expect(tenantConfig.getCustomFields).toHaveBeenCalledWith(mockCtx.tenantId)
        expect(importService.analyze).toHaveBeenCalledWith(mockCtx.schemaName, file, [
          makeFieldDef({ key: 'industry' }),
        ])
        expect(result).toBe(analyzeResult)
      })
    })

    describe('previewImport', () => {
      it('passes fileId, mapping and the active custom fields', async () => {
        const preview = { rows: [], issues: [] }
        importService.preview.mockResolvedValue(preview)

        const result = await controller.previewImport(
          { fileId: 'file-1', mapping: { email: 'Email' } },
          mockCtx,
        )

        expect(importService.preview).toHaveBeenCalledWith(
          mockCtx.schemaName,
          'file-1',
          { email: 'Email' },
          [makeFieldDef({ key: 'industry' })],
        )
        expect(result).toBe(preview)
      })

      it('defaults mapping to an empty object when not provided', async () => {
        importService.preview.mockResolvedValue({ rows: [], issues: [] })

        await controller.previewImport({ fileId: 'file-1' }, mockCtx)

        expect(importService.preview).toHaveBeenCalledWith(mockCtx.schemaName, 'file-1', {}, [
          makeFieldDef({ key: 'industry' }),
        ])
      })
    })

    describe('validateImport', () => {
      it('passes fileId, mapping, taxonomy and the active custom fields', async () => {
        const report = { valid: 0, invalid: 0, issues: [] }
        importService.validate.mockResolvedValue(report)

        const result = await controller.validateImport(
          { fileId: 'file-1', mapping: { email: 'Email' } },
          mockCtx,
        )

        expect(importService.validate).toHaveBeenCalledWith(
          mockCtx.schemaName,
          'file-1',
          { email: 'Email' },
          DEFAULT_CONTACT_TAXONOMY,
          [makeFieldDef({ key: 'industry' })],
        )
        expect(result).toBe(report)
      })

      it('defaults mapping to an empty object when not provided', async () => {
        importService.validate.mockResolvedValue({ valid: 0, invalid: 0, issues: [] })

        await controller.validateImport({ fileId: 'file-1' }, mockCtx)

        expect(importService.validate).toHaveBeenCalledWith(
          mockCtx.schemaName,
          'file-1',
          {},
          DEFAULT_CONTACT_TAXONOMY,
          [makeFieldDef({ key: 'industry' })],
        )
      })
    })

    describe('executeImport', () => {
      it('passes fileId, mapping, duplicateStrategy, user id, taxonomy and custom fields', async () => {
        const importResult = { created: 1, updated: 0, skipped: 0, errors: [] }
        importService.execute.mockResolvedValue(importResult)

        const result = await controller.executeImport(
          { fileId: 'file-1', mapping: { email: 'Email' }, duplicateStrategy: 'update' },
          mockCtx,
          mockUser,
        )

        expect(importService.execute).toHaveBeenCalledWith(
          mockCtx.schemaName,
          'file-1',
          { email: 'Email' },
          'update',
          mockUser.id,
          DEFAULT_CONTACT_TAXONOMY,
          [makeFieldDef({ key: 'industry' })],
        )
        expect(result).toBe(importResult)
      })

      it('defaults mapping to {} and duplicateStrategy to "skip" when not provided', async () => {
        importService.execute.mockResolvedValue({ created: 0, updated: 0, skipped: 0, errors: [] })

        await controller.executeImport({ fileId: 'file-1' }, mockCtx, mockUser)

        expect(importService.execute).toHaveBeenCalledWith(
          mockCtx.schemaName,
          'file-1',
          {},
          'skip',
          mockUser.id,
          DEFAULT_CONTACT_TAXONOMY,
          [makeFieldDef({ key: 'industry' })],
        )
      })
    })
  })
})
