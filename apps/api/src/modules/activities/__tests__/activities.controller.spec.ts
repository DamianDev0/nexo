import { NotFoundException } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { ActivitiesController } from '../activities.controller'
import { ActivitiesService } from '../activities.service'
import type {
  ActivityListItem,
  PaginatedActivities,
  TenantContext,
  AuthenticatedUser,
} from '@repo/shared-types'

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const mockCtx: TenantContext = {
  tenantId: 'tenant-1',
  schemaName: 'tenant_acme',
  slug: 'acme',
  plan: 'free',
  config: {},
}
const mockUser: AuthenticatedUser = {
  id: 'user-1',
  email: 'a@b.co',
  role: 'sales_rep' as AuthenticatedUser['role'],
  tenantId: 'tenant-1',
  schemaName: 'tenant_acme',
}

const mockActivity: ActivityListItem = {
  id: 'act-1',
  activityType: 'call',
  title: 'Follow up',
  description: null,
  dueDate: '2026-04-01T10:00:00Z',
  completedAt: null,
  status: 'pending',
  durationMinutes: 30,
  reminderAt: null,
  isActive: true,
  contactId: 'cnt-1',
  companyId: null,
  dealId: 'deal-1',
  assignedToId: 'user-1',
  createdById: 'user-1',
  createdAt: '2026-03-20T00:00:00Z',
  updatedAt: '2026-03-20T00:00:00Z',
  contactName: 'Juan Pérez',
  companyName: null,
  dealTitle: 'Big Deal',
  assignedToName: 'Carlos López',
}

const mockPaginated: PaginatedActivities = {
  data: [mockActivity],
  total: 1,
  page: 1,
  limit: 25,
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('ActivitiesController', () => {
  let controller: ActivitiesController
  let service: jest.Mocked<ActivitiesService>

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [ActivitiesController],
      providers: [
        {
          provide: ActivitiesService,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            complete: jest.fn(),
            cancel: jest.fn(),
            reopen: jest.fn(),
            getCalendar: jest.fn(),
          },
        },
      ],
    }).compile()

    controller = module.get(ActivitiesController)
    service = module.get(ActivitiesService)
  })

  describe('findAll', () => {
    it('delegates to service with filters', async () => {
      service.findAll.mockResolvedValue(mockPaginated)

      const result = await controller.findAll(mockCtx, { activityType: 'call' })

      expect(service.findAll).toHaveBeenCalledWith('tenant_acme', { activityType: 'call' })
      expect(result.total).toBe(1)
    })
  })

  describe('create', () => {
    it('delegates with dto and userId', async () => {
      service.create.mockResolvedValue(mockActivity)

      const result = await controller.create(
        { activityType: 'call', title: 'Follow up' },
        mockCtx,
        mockUser,
      )

      expect(service.create).toHaveBeenCalledWith(
        'tenant_acme',
        { activityType: 'call', title: 'Follow up' },
        'user-1',
      )
      expect(result.title).toBe('Follow up')
    })
  })

  describe('findOne', () => {
    it('returns activity detail', async () => {
      service.findOne.mockResolvedValue(mockActivity)

      const result = await controller.findOne('act-1', mockCtx)

      expect(result.contactName).toBe('Juan Pérez')
    })

    it('propagates NotFoundException', async () => {
      service.findOne.mockRejectedValue(new NotFoundException())

      await expect(controller.findOne('missing', mockCtx)).rejects.toThrow(NotFoundException)
    })
  })

  describe('update', () => {
    it('delegates to service', async () => {
      service.update.mockResolvedValue({ ...mockActivity, title: 'Updated' })

      const result = await controller.update('act-1', { title: 'Updated' }, mockCtx)

      expect(result.title).toBe('Updated')
    })
  })

  describe('remove', () => {
    it('resolves void', async () => {
      service.remove.mockResolvedValue(undefined)

      await expect(controller.remove('act-1', mockCtx)).resolves.toBeUndefined()
    })
  })

  describe('complete', () => {
    it('delegates to service', async () => {
      service.complete.mockResolvedValue({ ...mockActivity, status: 'completed' })

      const result = await controller.complete('act-1', mockCtx)

      expect(service.complete).toHaveBeenCalledWith('tenant_acme', 'act-1')
      expect(result.status).toBe('completed')
    })
  })

  describe('cancel', () => {
    it('delegates to service', async () => {
      service.cancel.mockResolvedValue({ ...mockActivity, status: 'cancelled' })

      const result = await controller.cancel('act-1', mockCtx)

      expect(result.status).toBe('cancelled')
    })
  })

  describe('reopen', () => {
    it('delegates to service', async () => {
      service.reopen.mockResolvedValue({ ...mockActivity, status: 'pending' })

      const result = await controller.reopen('act-1', mockCtx)

      expect(result.status).toBe('pending')
    })
  })

  describe('getCalendar', () => {
    it('delegates with query params', async () => {
      service.getCalendar.mockResolvedValue([
        {
          id: 'act-1',
          activityType: 'call',
          title: 'Call',
          dueDate: '2026-04-01T10:00:00Z',
          status: 'pending',
          contactName: 'Juan',
          dealTitle: null,
          assignedToId: 'user-1',
        },
      ])

      const result = await controller.getCalendar(mockCtx, { from: '2026-04-01', to: '2026-04-07' })

      expect(service.getCalendar).toHaveBeenCalledWith('tenant_acme', {
        from: '2026-04-01',
        to: '2026-04-07',
      })
      expect(result).toHaveLength(1)
    })
  })
})
