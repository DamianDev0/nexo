import { TenantConfigService } from '../services/tenant-config.service'
import { TenantConfigRepository } from '../repositories/tenant-config.repository'
import { DEFAULT_CONTACT_TAXONOMY } from '@repo/shared-types'
import type { ContactTaxonomy, OnboardingStatus } from '@repo/shared-types'

const TENANT_ID = 'tenant-1'
const SLUG = 'acme'

function buildTenantRepoMock(config: Record<string, unknown> = {}) {
  return {
    findOne: jest.fn().mockResolvedValue({ id: TENANT_ID, config }),
    query: jest.fn().mockResolvedValue(undefined),
  }
}

function buildHistoryRepoMock() {
  return {
    find: jest.fn(),
    count: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    remove: jest.fn(),
    findOneOrFail: jest.fn(),
  }
}

function buildCacheMock() {
  return {
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue(undefined),
    del: jest.fn().mockResolvedValue(undefined),
  }
}

function buildService(config: Record<string, unknown> = {}) {
  const tenantRepo = buildTenantRepoMock(config)
  const historyRepo = buildHistoryRepoMock()
  const cache = buildCacheMock()
  const service = new TenantConfigService(
    tenantRepo as never,
    historyRepo as never,
    cache as never,
    new TenantConfigRepository(tenantRepo as never),
  )
  return { service, tenantRepo, historyRepo, cache }
}

describe('TenantConfigService', () => {
  describe('getContactTaxonomy', () => {
    it('returns the cached taxonomy normalized without touching the tenant repo', async () => {
      const cachedOption = {
        key: 'custom',
        label: 'Custom',
        color: '#fff',
        order: 1,
        isSystem: false,
      } as ContactTaxonomy['statuses'][number]
      const cached = {
        statuses: [cachedOption],
        sources: [],
        types: [],
        lifecycleStages: [],
      } as ContactTaxonomy
      const { service, tenantRepo, cache } = buildService()
      cache.get.mockResolvedValue(cached)

      const result = await service.getContactTaxonomy(TENANT_ID)

      expect(result.statuses).toEqual([{ ...cachedOption, description: null, enabled: true }])
      expect(tenantRepo.findOne).not.toHaveBeenCalled()
    })

    it('falls back to system defaults when the tenant has no stored taxonomy', async () => {
      const { service } = buildService({})

      const result = await service.getContactTaxonomy(TENANT_ID)

      expect(result.statuses).toEqual(DEFAULT_CONTACT_TAXONOMY.statuses)
      expect(result.sources).toEqual(DEFAULT_CONTACT_TAXONOMY.sources)
      expect(result.types).toEqual(DEFAULT_CONTACT_TAXONOMY.types)
    })

    it('merges stored statuses with default sources when only statuses are customized', async () => {
      const customStatuses = [
        {
          key: 'custom',
          label: 'Custom',
          description: null,
          color: '#fff',
          order: 1,
          isSystem: false,
          enabled: true,
        },
      ]
      const { service } = buildService({
        contactTaxonomy: { statuses: customStatuses, sources: [], types: [] },
      })

      const result = await service.getContactTaxonomy(TENANT_ID)

      expect(result.statuses).toEqual(customStatuses)
      expect(result.sources).toEqual(DEFAULT_CONTACT_TAXONOMY.sources)
      expect(result.types).toEqual(DEFAULT_CONTACT_TAXONOMY.types)
    })

    it('keeps stored types while falling back for the other sections', async () => {
      const customTypes = [
        {
          key: 'distributor',
          label: 'Distribuidor',
          description: null,
          color: '#0EA5E9',
          order: 1,
          isSystem: false,
          enabled: true,
        },
      ]
      const { service } = buildService({
        contactTaxonomy: { statuses: [], sources: [], types: customTypes },
      })

      const result = await service.getContactTaxonomy(TENANT_ID)

      expect(result.types).toEqual(customTypes)
      expect(result.statuses).toEqual(DEFAULT_CONTACT_TAXONOMY.statuses)
      expect(result.sources).toEqual(DEFAULT_CONTACT_TAXONOMY.sources)
    })

    it('caches the resolved taxonomy for the tenant', async () => {
      const { service, cache } = buildService({})

      await service.getContactTaxonomy(TENANT_ID)

      expect(cache.set).toHaveBeenCalledWith(
        `tenant:contact-taxonomy:${TENANT_ID}`,
        expect.any(Object),
        600,
      )
    })
  })

  describe('updateContactTaxonomy', () => {
    it('persists the taxonomy and invalidates both the taxonomy and slug cache entries', async () => {
      const { service, tenantRepo, cache } = buildService()
      const taxonomy: ContactTaxonomy = {
        statuses: [],
        sources: [],
        types: [],
        lifecycleStages: [],
      }

      const result = await service.updateContactTaxonomy(TENANT_ID, taxonomy, SLUG)

      expect(result).toBe(taxonomy)
      expect(tenantRepo.query).toHaveBeenCalledWith(expect.stringContaining('jsonb_set'), [
        TENANT_ID,
        '{contactTaxonomy}',
        JSON.stringify(taxonomy),
      ])
      expect(cache.del).toHaveBeenCalledWith(`tenant:contact-taxonomy:${TENANT_ID}`)
      expect(cache.del).toHaveBeenCalledWith(`tenant:slug:${SLUG}`)
    })
  })

  describe('getOnboarding', () => {
    it('returns the default status when the tenant has none stored', async () => {
      const { service } = buildService({})

      const result = await service.getOnboarding(TENANT_ID)

      expect(result).toEqual({ step: 1, completed: false })
    })

    it('returns the stored onboarding status', async () => {
      const stored: OnboardingStatus = { step: 3, completed: true }
      const { service } = buildService({ onboarding: stored })

      const result = await service.getOnboarding(TENANT_ID)

      expect(result).toEqual(stored)
    })
  })

  describe('getSidebarConfig', () => {
    it('derives default labels from the tenant nomenclature when sidebar is not customized', async () => {
      const { service } = buildService({
        nomenclature: {
          contact: { singular: 'Paciente', plural: 'Pacientes' },
          deal: { singular: 'Tratamiento', plural: 'Tratamientos' },
        },
      })

      const sidebar = await service.getSidebarConfig(TENANT_ID)
      const labels = Object.fromEntries(sidebar.modules.map((m) => [m.key, m.label]))

      expect(labels.contacts).toBe('Pacientes')
      expect(labels.deals).toBe('Tratamientos')
      expect(labels.companies).toBe('Empresas')
      expect(labels.dashboard).toBe('Dashboard')
    })

    it('keeps a customized sidebar label untouched', async () => {
      const stored = {
        modules: [
          {
            key: 'contacts',
            label: 'Mi gente',
            icon: 'users',
            enabled: true,
            order: 1,
            customIconUrl: null,
            required: false,
          },
        ],
      }
      const { service } = buildService({
        sidebarConfig: stored,
        nomenclature: { contact: { singular: 'Paciente', plural: 'Pacientes' } },
      })

      const sidebar = await service.getSidebarConfig(TENANT_ID)

      expect(sidebar.modules[0]).toMatchObject(stored.modules[0]!)
    })

    it('derives module status for sidebars stored before the field existed', async () => {
      const stored = {
        modules: [
          {
            key: 'deals',
            label: 'Negocios',
            icon: 'briefcase',
            enabled: true,
            order: 1,
            customIconUrl: null,
            required: false,
          },
        ],
      }
      const { service } = buildService({ sidebarConfig: stored })

      const sidebar = await service.getSidebarConfig(TENANT_ID)

      expect(sidebar.modules[0]?.status).toBe('coming_soon')
    })
  })

  describe('updateOnboarding', () => {
    it('saves the onboarding section and returns it', async () => {
      const { service, tenantRepo } = buildService()
      const status: OnboardingStatus = { step: 2, completed: false }

      const result = await service.updateOnboarding(TENANT_ID, status)

      expect(result).toBe(status)
      expect(tenantRepo.query).toHaveBeenCalledWith(expect.stringContaining('jsonb_set'), [
        TENANT_ID,
        '{onboarding}',
        JSON.stringify(status),
      ])
    })
  })
})
