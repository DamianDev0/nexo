import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { UserRole } from '@repo/shared-types'
import type { IndustrySector } from '@repo/shared-types'
import { Tenant } from '@/modules/tenants/entities/tenant.entity'
import { AuditLogService } from '@/modules/audit-log/services/audit-log.service'
import type { AuditMeta } from '@/modules/audit-log/interfaces/audit-log.interfaces'
import { DEFAULT_CONTACT_TAXONOMY } from '@repo/shared-types'
import { INDUSTRY_PRESETS } from '../constants/industry-presets'
import { withContactSystemFields } from '../constants/contact-system-fields'
import type { IndustryPreset } from '../constants/industry-presets'
import type { TenantSettingsRow } from '../interfaces/settings.interface'
import type { TenantFullConfig } from '../interfaces/tenant-config.interface'
import type { UpdateSettingsDto } from '../dto/update-settings.dto'
import { SettingsResponseDto } from '../dto/settings-response.dto'
import { TenantConfigService } from './tenant-config.service'
import { PipelineSettingsService } from './pipeline-settings.service'
import { IndustryPresetRepository } from '../repositories/industry-preset.repository'
import { deepMerge } from '@/shared/utils/deep-merge'

const FISCAL_FIELDS = new Set(['nit', 'taxRegime'])

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(Tenant)
    private readonly tenantRepo: Repository<Tenant>,
    private readonly audit: AuditLogService,
    private readonly tenantConfig: TenantConfigService,
    private readonly pipelines: PipelineSettingsService,
    private readonly presetRepo: IndustryPresetRepository,
  ) {}

  async getSettings(tenantId: string): Promise<SettingsResponseDto> {
    const tenant = await this.findTenant(tenantId)
    return SettingsResponseDto.from(tenant)
  }

  async updateSettings(
    tenantId: string,
    dto: UpdateSettingsDto,
    actorRole: UserRole,
    schemaName: string,
    actorId: string,
    meta?: AuditMeta,
  ): Promise<SettingsResponseDto> {
    this.assertFiscalPermission(dto, actorRole)

    const tenant = await this.findTenant(tenantId)
    const config = (tenant.config ?? {}) as TenantSettingsRow

    const updated: Partial<Tenant> = {}

    if (dto.businessName) {
      updated.name = dto.businessName
    }

    const patch: TenantSettingsRow = {
      ...(dto.business && { business: dto.business }),
      ...(dto.i18n && { i18n: dto.i18n }),
      ...(dto.billing && { billing: { ...dto.billing } }),
      ...(dto.industry && { industry: dto.industry }),
    }

    const newConfig = deepMerge(
      config as Record<string, unknown>,
      patch as Record<string, unknown>,
    ) as TenantSettingsRow

    if (dto.industry?.sector) {
      const preset = INDUSTRY_PRESETS[dto.industry.sector]
      newConfig.industry = { sector: dto.industry.sector, iconPack: preset?.iconPack }
    }

    updated.config = newConfig as Record<string, unknown>
    await this.tenantRepo.update(tenantId, updated as Parameters<typeof this.tenantRepo.update>[1])

    if (dto.industry?.sector) {
      await this.applyPreset(tenantId, dto.industry.sector, schemaName, tenant.slug)
    }

    await this.audit.settingsUpdated(tenantId, actorId, schemaName, meta)

    const fresh = await this.findTenant(tenantId)
    return SettingsResponseDto.from(fresh)
  }

  async applyPreset(
    tenantId: string,
    sector: IndustrySector,
    schemaName: string,
    slug: string,
  ): Promise<void> {
    const preset: IndustryPreset | undefined = INDUSTRY_PRESETS[sector]
    if (!preset) return

    const tenant = await this.findTenant(tenantId)
    const config = (tenant.config ?? {}) as TenantFullConfig

    if (!config.nomenclature) {
      await this.tenantConfig.updateNomenclature(tenantId, preset.nomenclature, slug)
    }

    if (!config.contactTaxonomy) {
      await this.tenantConfig.updateContactTaxonomy(
        tenantId,
        { ...DEFAULT_CONTACT_TAXONOMY, lifecycleStages: preset.lifecycleStages },
        slug,
      )
    }

    const storedFields = config.customFields
    const hasFields =
      storedFields !== undefined &&
      Object.values(storedFields).some((defs) => Array.isArray(defs) && defs.length > 0)
    if (!hasFields) {
      await this.tenantConfig.updateCustomFields(
        tenantId,
        {
          ...preset.customFields,
          contacts: withContactSystemFields(preset.customFields.contacts, sector),
        },
        slug,
      )
    }

    await this.presetRepo.insertTagsIfEmpty(schemaName, preset.tags)

    const existing = await this.pipelines.findAll(schemaName)
    if (existing.length === 0) {
      await this.pipelines.create(schemaName, {
        name: preset.pipelineName,
        isDefault: true,
        stages: preset.pipelineStages.map((s) => ({
          name: s.name,
          color: s.color,
          probability: s.probability,
          position: s.order - 1,
        })),
      })
    }
  }

  private assertFiscalPermission(dto: UpdateSettingsDto, role: UserRole): void {
    const touchesFiscal =
      dto.business && Object.keys(dto.business).some((k) => FISCAL_FIELDS.has(k))
    const touchesBilling = !!dto.billing

    if ((touchesFiscal || touchesBilling) && role !== UserRole.OWNER) {
      throw new ForbiddenException('Only the Owner can update fiscal and billing settings')
    }
  }

  private async findTenant(tenantId: string): Promise<Tenant> {
    const tenant = await this.tenantRepo.findOne({
      where: { id: tenantId, isActive: true },
      relations: ['plan'],
    })
    if (!tenant) throw new NotFoundException('Tenant not found')
    return tenant
  }
}
