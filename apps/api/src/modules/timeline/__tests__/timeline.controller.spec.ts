import { Test } from '@nestjs/testing'
import { NotFoundException } from '@nestjs/common'
import { TimelineController } from '../controllers/timeline.controller'
import { TimelineService } from '../services/timeline.service'
import { makeTenantContext } from '@/shared/testing/tenant-context.mock'
import { expectNotFoundPropagation } from '@/shared/testing/crud-assertions'
import type { PaginatedTimeline } from '@repo/shared-types'

const mockCtx = makeTenantContext()
const OTHER_TENANT_CTX = makeTenantContext({
  tenantId: 'tenant-2',
  slug: 'other',
  schemaName: 'tenant_other',
})

const emptyTimeline: PaginatedTimeline = { data: [], total: 0, page: 1, limit: 25 }

function buildServiceMock() {
  return {
    getContactTimeline: jest.fn(),
    getDealTimeline: jest.fn(),
    getCompanyTimeline: jest.fn(),
  }
}

describe('TimelineController', () => {
  let controller: TimelineController
  let service: ReturnType<typeof buildServiceMock>

  beforeEach(async () => {
    service = buildServiceMock()

    const module = await Test.createTestingModule({
      controllers: [TimelineController],
      providers: [{ provide: TimelineService, useValue: service }],
    }).compile()

    controller = module.get(TimelineController)
  })

  describe('getContactTimeline', () => {
    it('delegates to the service with the tenant schema, id and page 1 by default', async () => {
      service.getContactTimeline.mockResolvedValue(emptyTimeline)

      const result = await controller.getContactTimeline('contact-1', mockCtx, undefined)

      expect(service.getContactTimeline).toHaveBeenCalledWith(mockCtx.schemaName, 'contact-1', 1)
      expect(result).toEqual(emptyTimeline)
    })

    it('forwards a numeric page query parameter', async () => {
      service.getContactTimeline.mockResolvedValue(emptyTimeline)

      await controller.getContactTimeline('contact-1', mockCtx, '3')

      expect(service.getContactTimeline).toHaveBeenCalledWith(mockCtx.schemaName, 'contact-1', 3)
    })

    it('resolves against the tenant schema of the calling tenant, never another one', async () => {
      service.getContactTimeline.mockResolvedValue(emptyTimeline)

      await controller.getContactTimeline('contact-1', OTHER_TENANT_CTX, undefined)

      expect(service.getContactTimeline).toHaveBeenCalledWith(
        OTHER_TENANT_CTX.schemaName,
        'contact-1',
        1,
      )
      expect(service.getContactTimeline).not.toHaveBeenCalledWith(
        mockCtx.schemaName,
        expect.anything(),
        expect.anything(),
      )
    })

    it('propagates NotFoundException when the service rejects', async () => {
      await expectNotFoundPropagation(service.getContactTimeline, () =>
        controller.getContactTimeline('missing', mockCtx, undefined),
      )
    })

    it('passes a NaN page through to the service when given a non-numeric page string, with no validation', async () => {
      service.getContactTimeline.mockResolvedValue(emptyTimeline)

      await controller.getContactTimeline('contact-1', mockCtx, 'not-a-number')

      const [, , page] = service.getContactTimeline.mock.calls[0] as [string, string, number]
      expect(Number.isNaN(page)).toBe(true)
    })
  })

  describe('getDealTimeline', () => {
    it('delegates to the service with the tenant schema, id and parsed page', async () => {
      service.getDealTimeline.mockResolvedValue(emptyTimeline)

      await controller.getDealTimeline('deal-1', mockCtx, '2')

      expect(service.getDealTimeline).toHaveBeenCalledWith(mockCtx.schemaName, 'deal-1', 2)
    })

    it('propagates NotFoundException when the service rejects', async () => {
      await expectNotFoundPropagation(service.getDealTimeline, () =>
        controller.getDealTimeline('missing', mockCtx, undefined),
      )
    })
  })

  describe('getCompanyTimeline', () => {
    it('delegates to the service with the tenant schema, id and parsed page', async () => {
      service.getCompanyTimeline.mockResolvedValue(emptyTimeline)

      await controller.getCompanyTimeline('company-1', mockCtx, '4')

      expect(service.getCompanyTimeline).toHaveBeenCalledWith(mockCtx.schemaName, 'company-1', 4)
    })

    it('propagates NotFoundException when the service rejects', async () => {
      await expectNotFoundPropagation(service.getCompanyTimeline, () =>
        controller.getCompanyTimeline('missing', mockCtx, undefined),
      )
    })
  })
})
