import { Test } from '@nestjs/testing'
import { ContactWorkspaceController } from '../controllers/contact-workspace.controller'
import { ContactWorkspaceService } from '../services/contact-workspace.service'
import { PlanName, UserRole } from '@repo/shared-types'
import type { AuthenticatedUser, ContactWorkspace, TenantContext } from '@repo/shared-types'

const mockCtx: TenantContext = {
  tenantId: 'tenant-1',
  slug: 'acme',
  schemaName: 'tenant_acme',
  plan: PlanName.FREE,
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

const mockWorkspace: ContactWorkspace = {
  views: [],
  activeViewId: null,
  tableState: {},
  columns: [],
  quickFilters: { statuses: [], sources: [], lifecycleStages: [] },
  counts: { total: 0, byStatus: {} },
}

function buildServiceMock() {
  return {
    getWorkspace: jest.fn(),
    updateState: jest.fn(),
  }
}

describe('ContactWorkspaceController', () => {
  let controller: ContactWorkspaceController
  let service: ReturnType<typeof buildServiceMock>

  beforeEach(async () => {
    service = buildServiceMock()

    const module = await Test.createTestingModule({
      controllers: [ContactWorkspaceController],
      providers: [{ provide: ContactWorkspaceService, useValue: service }],
    }).compile()

    controller = module.get(ContactWorkspaceController)
  })

  describe('getWorkspace', () => {
    it('delegates to service with schema and current user', async () => {
      service.getWorkspace.mockResolvedValue(mockWorkspace)

      const result = await controller.getWorkspace(mockCtx, mockUser)

      expect(service.getWorkspace).toHaveBeenCalledWith(mockCtx.schemaName, mockUser.id)
      expect(result).toEqual(mockWorkspace)
    })
  })

  describe('updateState', () => {
    it('delegates to service with schema, user and dto', async () => {
      service.updateState.mockResolvedValue(undefined)
      const dto = { activeViewId: 'view-1', tableState: { density: 'compact' } }

      await controller.updateState(mockCtx, mockUser, dto)

      expect(service.updateState).toHaveBeenCalledWith(mockCtx.schemaName, mockUser.id, dto)
    })
  })
})
