import { BadRequestException } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { NavigationController } from '../controllers/navigation.controller'
import { TenantConfigService } from '../services/tenant-config.service'
import { UserRole } from '@repo/shared-types'
import type { TenantContext, SidebarConfig } from '@repo/shared-types'

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const mockCtx: TenantContext = {
  tenantId: 'tenant-1',
  slug: 'acme',
  schemaName: 'tenant_acme',
  plan: 'free',
  config: {},
}

function makeSidebarConfig(overrides: Partial<SidebarConfig> = {}): SidebarConfig {
  return {
    modules: [
      {
        key: 'dashboard',
        label: 'Dashboard',
        icon: 'home',
        enabled: true,
        order: 1,
        customIconUrl: null,
        required: true,
      },
      {
        key: 'contacts',
        label: 'Contacts',
        icon: 'users',
        enabled: true,
        order: 2,
        customIconUrl: null,
        required: false,
      },
      {
        key: 'settings',
        label: 'Settings',
        icon: 'cog',
        enabled: true,
        order: 9,
        customIconUrl: null,
        required: true,
      },
    ],
    ...overrides,
  }
}

// ─── Mock service ─────────────────────────────────────────────────────────────

function buildServiceMock() {
  return {
    getSidebarConfig: jest.fn(),
    updateSidebarConfig: jest.fn(),
  }
}

// ─── Tests ────────────────────────────────────────────────────────────────────

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

  // ─── getSidebar ─────────────────────────────────────────────────────────

  describe('getSidebar', () => {
    it('returns the sidebar config from service', async () => {
      const sidebar = makeSidebarConfig()
      configService.getSidebarConfig.mockResolvedValue(sidebar)

      const result = await controller.getSidebar(mockCtx)

      expect(configService.getSidebarConfig).toHaveBeenCalledWith(mockCtx.tenantId)
      expect(result.modules).toHaveLength(3)
    })
  })

  // ─── updateSidebar ──────────────────────────────────────────────────────

  describe('updateSidebar', () => {
    it('updates the sidebar when all required modules stay enabled', async () => {
      const updated = makeSidebarConfig({
        modules: [
          {
            key: 'dashboard',
            label: 'Dashboard',
            icon: 'home',
            enabled: true,
            order: 1,
            customIconUrl: null,
            required: true,
          },
          {
            key: 'contacts',
            label: 'Contacts',
            icon: 'users',
            enabled: false,
            order: 2,
            customIconUrl: null,
            required: false,
          },
          {
            key: 'settings',
            label: 'Settings',
            icon: 'cog',
            enabled: true,
            order: 9,
            customIconUrl: null,
            required: true,
          },
        ],
      })
      configService.updateSidebarConfig.mockResolvedValue(updated)

      const result = await controller.updateSidebar(updated, mockCtx)

      expect(configService.updateSidebarConfig).toHaveBeenCalledWith(
        mockCtx.tenantId,
        updated,
        mockCtx.slug,
      )
      expect(result.modules[1]?.enabled).toBe(false) // contacts can be disabled
    })

    it('propagates BadRequestException when a required module is disabled', async () => {
      const invalidConfig = makeSidebarConfig({
        modules: [
          {
            key: 'dashboard',
            label: 'Dashboard',
            icon: 'home',
            enabled: false,
            order: 1,
            customIconUrl: null,
            required: true,
          },
          {
            key: 'settings',
            label: 'Settings',
            icon: 'cog',
            enabled: true,
            order: 9,
            customIconUrl: null,
            required: true,
          },
        ],
      })
      configService.updateSidebarConfig.mockRejectedValue(
        new BadRequestException('Required modules cannot be disabled: dashboard'),
      )

      await expect(controller.updateSidebar(invalidConfig, mockCtx)).rejects.toThrow(
        BadRequestException,
      )
    })

    it('propagates BadRequestException when multiple required modules are disabled', async () => {
      const invalidConfig = makeSidebarConfig({
        modules: [
          {
            key: 'dashboard',
            label: 'Dashboard',
            icon: 'home',
            enabled: false,
            order: 1,
            customIconUrl: null,
            required: true,
          },
          {
            key: 'settings',
            label: 'Settings',
            icon: 'cog',
            enabled: false,
            order: 9,
            customIconUrl: null,
            required: true,
          },
        ],
      })
      configService.updateSidebarConfig.mockRejectedValue(
        new BadRequestException('Required modules cannot be disabled: dashboard, settings'),
      )

      await expect(controller.updateSidebar(invalidConfig, mockCtx)).rejects.toThrow(
        BadRequestException,
      )
    })
  })
})

// ─── TenantConfigService.updateSidebarConfig — unit test for the guard logic ─

describe('TenantConfigService sidebar required module guard', () => {
  it('validates required modules directly via service integration', async () => {
    // This test imports the real service to verify the guard logic in isolation
    const { TenantConfigService } = await import('../services/tenant-config.service')
    const { InjectRepository } = await import('@nestjs/typeorm')

    const mockRepo = { findOne: jest.fn(), update: jest.fn() }
    const mockHistoryRepo = {
      find: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
      count: jest.fn(),
      remove: jest.fn(),
    }
    const mockCache = { get: jest.fn().mockResolvedValue(null), set: jest.fn(), del: jest.fn() }

    const module = await Test.createTestingModule({
      providers: [
        TenantConfigService,
        { provide: 'TenantRepository', useValue: mockRepo },
        { provide: 'TenantThemeHistoryRepository', useValue: mockHistoryRepo },
        { provide: 'CacheService', useValue: mockCache },
      ],
    })
      .overrideProvider(TenantConfigService)
      .useFactory({
        factory: () => {
          const svc = new (TenantConfigService as any)(mockRepo, mockHistoryRepo, mockCache)
          return svc
        },
      })
      .compile()

    // Directly construct service and call the method to test the guard
    const svc = new (TenantConfigService as any)(mockRepo, mockHistoryRepo, mockCache)

    const invalidConfig: SidebarConfig = {
      modules: [
        {
          key: 'dashboard',
          label: 'Dashboard',
          icon: 'home',
          enabled: false,
          order: 1,
          customIconUrl: null,
          required: true,
        },
      ],
    }

    await expect(svc.updateSidebarConfig('tenant-1', invalidConfig, 'acme')).rejects.toThrow(
      BadRequestException,
    )
  })
})
