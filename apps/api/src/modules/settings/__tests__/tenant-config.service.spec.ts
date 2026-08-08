import { TenantConfigService } from '../services/tenant-config.service'
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
  const service = new TenantConfigService(tenantRepo as never, historyRepo as never, cache as never)
  return { service, tenantRepo, historyRepo, cache }
}

describe('TenantConfigService', () => {
  describe('getContactTaxonomy', () => {
    it('returns the cached taxonomy without touching the tenant repo', async () => {
      const cached: ContactTaxonomy = { statuses: [], sources: [] }
      const { service, tenantRepo, cache } = buildService()
      cache.get.mockResolvedValue(cached)

      const result = await service.getContactTaxonomy(TENANT_ID)

      expect(result).toBe(cached)
      expect(tenantRepo.findOne).not.toHaveBeenCalled()
    })

    it('falls back to system defaults when the tenant has no stored taxonomy', async () => {
      const { service } = buildService({})

      const result = await service.getContactTaxonomy(TENANT_ID)

      expect(result.statuses).toEqual(DEFAULT_CONTACT_TAXONOMY.statuses)
      expect(result.sources).toEqual(DEFAULT_CONTACT_TAXONOMY.sources)
    })

    it('merges stored statuses with default sources when only statuses are customized', async () => {
      const customStatuses = [
        { key: 'custom', label: 'Custom', color: '#fff', order: 1, isSystem: false },
      ]
      const { service } = buildService({
        contactTaxonomy: { statuses: customStatuses, sources: [] },
      })

      const result = await service.getContactTaxonomy(TENANT_ID)

      expect(result.statuses).toEqual(customStatuses)
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
      const taxonomy: ContactTaxonomy = { statuses: [], sources: [] }

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
