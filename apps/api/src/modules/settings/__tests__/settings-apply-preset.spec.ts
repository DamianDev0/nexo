import { Test } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { IndustrySector } from '@repo/shared-types'
import { SettingsService } from '../services/settings.service'
import { TenantConfigService } from '../services/tenant-config.service'
import { PipelineSettingsService } from '../services/pipeline-settings.service'
import { IndustryPresetRepository } from '../repositories/industry-preset.repository'
import { AuditLogService } from '@/modules/audit-log/services/audit-log.service'
import { Tenant } from '@/modules/tenants/entities/tenant.entity'
import { INDUSTRY_PRESETS } from '../constants/industry-presets'

const TENANT_ID = 'tenant-1'
const SCHEMA = 'tenant_acme'
const SLUG = 'acme'

function buildMocks(config: Record<string, unknown>) {
  return {
    tenantRepo: {
      findOne: jest.fn().mockResolvedValue({ id: TENANT_ID, slug: SLUG, config }),
      update: jest.fn(),
    },
    tenantConfig: {
      updateNomenclature: jest.fn(),
      updateContactTaxonomy: jest.fn(),
      updateCustomFields: jest.fn(),
    },
    pipelines: { findAll: jest.fn().mockResolvedValue([]), create: jest.fn() },
    presetRepo: { insertTagsIfEmpty: jest.fn().mockResolvedValue(true) },
  }
}

async function buildService(mocks: ReturnType<typeof buildMocks>) {
  const module = await Test.createTestingModule({
    providers: [
      SettingsService,
      { provide: getRepositoryToken(Tenant), useValue: mocks.tenantRepo },
      { provide: AuditLogService, useValue: { settingsUpdated: jest.fn() } },
      { provide: TenantConfigService, useValue: mocks.tenantConfig },
      { provide: PipelineSettingsService, useValue: mocks.pipelines },
      { provide: IndustryPresetRepository, useValue: mocks.presetRepo },
    ],
  }).compile()

  return module.get(SettingsService)
}

describe('SettingsService.applyPreset', () => {
  it('materialises nomenclature, taxonomy, fields, tags and pipeline on a fresh workspace', async () => {
    const mocks = buildMocks({})
    const service = await buildService(mocks)
    const preset = INDUSTRY_PRESETS.salud

    await service.applyPreset(TENANT_ID, IndustrySector.SALUD, SCHEMA, SLUG)

    expect(mocks.tenantConfig.updateNomenclature).toHaveBeenCalledWith(
      TENANT_ID,
      preset.nomenclature,
      SLUG,
    )
    expect(mocks.tenantConfig.updateContactTaxonomy).toHaveBeenCalledWith(
      TENANT_ID,
      expect.objectContaining({ lifecycleStages: preset.lifecycleStages }),
      SLUG,
    )
    expect(mocks.tenantConfig.updateCustomFields).toHaveBeenCalledWith(
      TENANT_ID,
      expect.objectContaining({
        companies: preset.customFields.companies,
        deals: preset.customFields.deals,
        contacts: expect.arrayContaining([
          ...preset.customFields.contacts,
          expect.objectContaining({ key: 'role', isSystem: true }),
        ]),
      }),
      SLUG,
    )
    expect(mocks.presetRepo.insertTagsIfEmpty).toHaveBeenCalledWith(SCHEMA, preset.tags)
    expect(mocks.pipelines.create).toHaveBeenCalledWith(
      SCHEMA,
      expect.objectContaining({ name: preset.pipelineName, isDefault: true }),
    )
  })

  it('never overwrites a workspace that is already configured', async () => {
    const mocks = buildMocks({
      nomenclature: { contact: { singular: 'Paciente', plural: 'Pacientes' } },
      contactTaxonomy: { statuses: [], sources: [], lifecycleStages: [] },
      customFields: {
        contacts: [
          {
            key: 'propio',
            label: 'Propio',
            type: 'text',
            required: false,
            unique: false,
            order: 1,
          },
        ],
        companies: [],
        deals: [],
      },
    })
    mocks.pipelines.findAll.mockResolvedValue([{ id: 'p-1' }])
    const service = await buildService(mocks)

    await service.applyPreset(TENANT_ID, IndustrySector.TECNOLOGIA, SCHEMA, SLUG)

    expect(mocks.tenantConfig.updateNomenclature).not.toHaveBeenCalled()
    expect(mocks.tenantConfig.updateContactTaxonomy).not.toHaveBeenCalled()
    expect(mocks.tenantConfig.updateCustomFields).not.toHaveBeenCalled()
    expect(mocks.pipelines.create).not.toHaveBeenCalled()
  })

  it('every sector preset ships a complete starter pack', () => {
    for (const preset of Object.values(INDUSTRY_PRESETS)) {
      expect(preset.nomenclature.contact.plural.length).toBeGreaterThan(0)
      expect(preset.pipelineStages.length).toBeGreaterThan(0)
      expect(preset.lifecycleStages.length).toBeGreaterThan(0)
      expect(preset.tags.length).toBeGreaterThan(0)
      const fieldKeys = [
        ...preset.customFields.contacts,
        ...preset.customFields.companies,
        ...preset.customFields.deals,
      ].map((def) => def.key)
      expect(new Set(fieldKeys).size).toBe(fieldKeys.length)
    }
  })
})
