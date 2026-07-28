import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { PlanName } from '@repo/shared-types'
import type { GeneralSettings } from '@repo/shared-types'
import { CURRENCY_CODE } from '@repo/shared-utils'
import type { Tenant } from '@/modules/tenants/entities/tenant.entity'
import type {
  TenantSettingsRow,
  SettingsIndustry,
  SettingsBilling,
  SettingsI18n,
  SettingsBusiness,
} from '../interfaces/settings.interface'

export class SettingsResponseDto implements GeneralSettings {
  @ApiProperty() id: string
  @ApiProperty() name: string
  @ApiProperty() slug: string
  @ApiProperty({ enum: Object.values(PlanName) }) plan: PlanName
  @ApiPropertyOptional() business: SettingsBusiness
  @ApiPropertyOptional() i18n: SettingsI18n
  @ApiPropertyOptional() billing: SettingsBilling
  @ApiPropertyOptional() industry: SettingsIndustry

  static from(tenant: Tenant): SettingsResponseDto {
    const config = (tenant.config ?? {}) as TenantSettingsRow
    const dto = new SettingsResponseDto()
    dto.id = tenant.id
    dto.name = tenant.name
    dto.slug = tenant.slug
    dto.plan = (tenant.plan?.name ?? PlanName.FREE) as PlanName
    dto.business = config.business ?? {}
    dto.i18n = config.i18n ?? {
      language: 'es',
      timezone: 'America/Bogota',
      currency: CURRENCY_CODE,
      dateFormat: 'DD/MM/YYYY',
      numberFormat: 'colombian',
    }
    dto.billing = config.billing ?? {}
    dto.industry = config.industry ?? {}
    return dto
  }
}
