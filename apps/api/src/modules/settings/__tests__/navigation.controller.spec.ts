import { BadRequestException } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { NavigationController } from '../controllers/navigation.controller'
import { TenantConfigService } from '../services/tenant-config.service'
import { sidebarConfig, sidebarModule } from '@/shared/testing/sidebar.factory'
import { PlanName, type SidebarConfig, type TenantContext } from '@repo/shared-types'

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
    getSidebarConfig: jest.fn(),
    updateSidebarConfig: jest.fn(),
  }
}

describe('NavigationController', () => {
  let controller: NavigationController
  let configService: ReturnType<typeof buildServiceMock>

  beforeEach(async () => {
    configService = buildServiceMock()

    const module = await Test.createTestingModule({
      controllers: [NavigationController],
      providers: [{ provide: TenantConfigService, useValue: configService }],
    }).compile()

    controller = module.get(NavigationController)
  })

  describe('getSidebar', () => {
    it('returns the sidebar config from service', async () => {
      configService.getSidebarConfig.mockResolvedValue(sidebarConfig())

      const result = await controller.getSidebar(mockCtx)

      expect(configService.getSidebarConfig).toHaveBeenCalledWith(mockCtx.tenantId)
      expect(result.modules).toHaveLength(3)
    })

    it('exposes module availability so the client does not hardcode it', async () => {
      configService.getSidebarConfig.mockResolvedValue(sidebarConfig())

      const result = await controller.getSidebar(mockCtx)

      expect(result.modules.map((m) => [m.key, m.status])).toEqual([
        ['dashboard', 'available'],
        ['contacts', 'available'],
        ['settings', 'available'],
      ])
    })
  })

  describe('updateSidebar', () => {
    it('updates the sidebar when all required modules stay enabled', async () => {
      const updated = sidebarConfig([
        sidebarModule('dashboard', { order: 1 }),
        sidebarModule('contacts', { order: 2, enabled: false }),
        sidebarModule('settings', { order: 9 }),
      ])
      configService.updateSidebarConfig.mockResolvedValue(updated)

      const result = await controller.updateSidebar(updated, mockCtx)

      expect(configService.updateSidebarConfig).toHaveBeenCalledWith(
        mockCtx.tenantId,
        updated,
        mockCtx.slug,
      )
      expect(result.modules[1]?.enabled).toBe(false)
    })

    it('propagates BadRequestException when a required module is disabled', async () => {
      const invalidConfig = sidebarConfig([
        sidebarModule('dashboard', { order: 1, enabled: false }),
        sidebarModule('settings', { order: 9 }),
      ])
      configService.updateSidebarConfig.mockRejectedValue(
        new BadRequestException('Required modules cannot be disabled: dashboard'),
      )

      await expect(controller.updateSidebar(invalidConfig, mockCtx)).rejects.toThrow(
        BadRequestException,
      )
    })

    it('propagates BadRequestException when multiple required modules are disabled', async () => {
      const invalidConfig = sidebarConfig([
        sidebarModule('dashboard', { order: 1, enabled: false }),
        sidebarModule('settings', { order: 9, enabled: false }),
      ])
      configService.updateSidebarConfig.mockRejectedValue(
        new BadRequestException('Required modules cannot be disabled: dashboard, settings'),
      )

      await expect(controller.updateSidebar(invalidConfig, mockCtx)).rejects.toThrow(
        BadRequestException,
      )
    })
  })
})

describe('TenantConfigService sidebar required module guard', () => {
  it('validates required modules directly via service integration', async () => {
    const mockRepo = { findOne: jest.fn(), update: jest.fn() }
    const mockHistoryRepo = {
      find: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
      count: jest.fn(),
      remove: jest.fn(),
    }
    const mockCache = { get: jest.fn().mockResolvedValue(null), set: jest.fn(), del: jest.fn() }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- partial DI for a pure guard check
    const svc = new (TenantConfigService as any)(mockRepo, mockHistoryRepo, mockCache)

    const invalidConfig: SidebarConfig = sidebarConfig([
      sidebarModule('dashboard', { order: 1, enabled: false }),
    ])

    await expect(svc.updateSidebarConfig('tenant-1', invalidConfig, 'acme')).rejects.toThrow(
      BadRequestException,
    )
  })
})
