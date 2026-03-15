import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { UserRole } from '@repo/shared-types'
import { Tenant } from '@/modules/tenants/entities/tenant.entity'
import { AuditLogService } from '@/shared/audit-log/audit-log.service'
import type { AuditMeta } from '@/shared/audit-log/audit-log.interfaces'
import { INDUSTRY_PRESETS } from '../constants/industry-presets'
import type { TenantConfig } from '../interfaces/settings.interface'
import type { UpdateSettingsDto } from '../dto/update-settings.dto'
import { SettingsResponseDto } from '../dto/settings-response.dto'
import { deepMerge } from '@/shared/utils/deep-merge'

const FISCAL_FIELDS = new Set(['nit', 'taxRegime'])

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(Tenant)
    private readonly tenantRepo: Repository<Tenant>,
    private readonly audit: AuditLogService,
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
    const config = (tenant.config ?? {}) as TenantConfig

    const updated: Partial<Tenant> = {}

    if (dto.businessName) {
      updated.name = dto.businessName
    }

    const patch: TenantConfig = {
      ...(dto.business && { business: dto.business }),
      ...(dto.i18n && { i18n: dto.i18n }),
      ...(dto.billing && { billing: dto.billing }),
      ...(dto.industry && { industry: dto.industry }),
    }

    const newConfig = deepMerge(
      config as Record<string, unknown>,
      patch as Record<string, unknown>,
    ) as TenantConfig

    if (dto.industry?.sector) {
      newConfig.industry = this.buildIndustryConfig(dto.industry.sector, newConfig)
    }

    updated.config = newConfig as Record<string, unknown>
    await this.tenantRepo.update(tenantId, updated as Parameters<typeof this.tenantRepo.update>[1])

    await this.audit.settingsUpdated(tenantId, actorId, schemaName, meta)

    const fresh = await this.findTenant(tenantId)
    return SettingsResponseDto.from(fresh)
  }

  async applyIndustryPreset(
    tenantId: string,
    sector: string,
    schemaName: string,
    meta?: AuditMeta,
  ): Promise<void> {
    const tenant = await this.findTenant(tenantId)
    const config = (tenant.config ?? {}) as TenantConfig
    const newConfig = { ...config, industry: this.buildIndustryConfig(sector, config) }
    await this.tenantRepo.update(tenantId, { config: newConfig })

    await this.audit.settingsUpdated(
      tenantId,
      undefined,
      schemaName,
      meta,
      `Industry preset applied: ${sector}`,
    )
  }

  private buildIndustryConfig(sector: string, config: TenantConfig): TenantConfig['industry'] {
    const preset = INDUSTRY_PRESETS[sector]
    if (!preset) return config.industry

    return {
      sector,
      nomenclature: preset.nomenclature,
      iconPack: preset.iconPack,
      pipelinePreset: preset.pipelineStages,
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
