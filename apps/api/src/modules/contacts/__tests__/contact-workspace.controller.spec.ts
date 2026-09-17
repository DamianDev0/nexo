import { Test } from '@nestjs/testing'
import { ContactWorkspaceController } from '../controllers/contact-workspace.controller'
import { ContactWorkspaceService } from '../services/contact-workspace.service'
import { CONTACT_OBJECT } from '../constants/contact-object.definition'
import { ObjectWorkspaceService } from '@/shared/object-engine/services/object-workspace.service'
import type { UpdateObjectWorkspaceDto } from '@/shared/object-engine/dto/object-workspace.dto'
import { TenantConfigService } from '@/modules/settings/services/tenant-config.service'
import { makeAuthenticatedUser, makeTenantContext } from '@/shared/testing/tenant-context.mock'
import { DEFAULT_CONTACT_TAXONOMY, UserRole } from '@repo/shared-types'
import type { ContactWorkspace } from '@repo/shared-types'

const mockCtx = makeTenantContext()
const mockUser = makeAuthenticatedUser({ email: 'owner@acme.com', role: UserRole.OWNER })

const mockWorkspace: ContactWorkspace = {
  views: [],
  activeViewId: null,
  tableState: {},
  columns: [],
  quickFilters: { statuses: [], sources: [], lifecycleStages: [] },
  counts: { total: 0, archived: 0, mine: 0, unassigned: 0, unassignedRecent: 0, byStatus: {} },
}

function buildServiceMock() {
  return {
    getWorkspace: jest.fn(),
    updateState: jest.fn(),
  }
}

function buildEngineMock() {
  return { updateState: jest.fn() }
}

describe('ContactWorkspaceController', () => {
  let controller: ContactWorkspaceController
  let service: ReturnType<typeof buildServiceMock>
  let engine: ReturnType<typeof buildEngineMock>

  beforeEach(async () => {
    service = buildServiceMock()
    engine = buildEngineMock()

    const module = await Test.createTestingModule({
      controllers: [ContactWorkspaceController],
      providers: [
        { provide: ContactWorkspaceService, useValue: service },
        { provide: ObjectWorkspaceService, useValue: engine },
        {
          provide: TenantConfigService,
          useValue: {
            getContactTaxonomy: jest.fn().mockResolvedValue(DEFAULT_CONTACT_TAXONOMY),
            getCustomFields: jest
              .fn()
              .mockResolvedValue({ contacts: [], companies: [], deals: [] }),
          },
        },
      ],
    }).compile()

    controller = module.get(ContactWorkspaceController)
  })

  describe('getWorkspace', () => {
    it('delegates to service with schema and current user', async () => {
      service.getWorkspace.mockResolvedValue(mockWorkspace)

      const result = await controller.getWorkspace(mockCtx, mockUser)

      expect(service.getWorkspace).toHaveBeenCalledWith(
        mockCtx.schemaName,
        mockUser.id,
        DEFAULT_CONTACT_TAXONOMY,
        [],
      )
      expect(result).toEqual(mockWorkspace)
    })
  })

  describe('updateState', () => {
    it('delegates to the object engine with the contact definition', async () => {
      engine.updateState.mockResolvedValue(undefined)
      const dto: UpdateObjectWorkspaceDto = {
        activeViewId: 'view-1',
        tableState: { density: 'compact' },
      }

      await controller.updateState(mockCtx, mockUser, dto)

      expect(engine.updateState).toHaveBeenCalledWith(
        mockCtx.schemaName,
        CONTACT_OBJECT,
        mockUser.id,
        dto,
      )
    })
  })
})
