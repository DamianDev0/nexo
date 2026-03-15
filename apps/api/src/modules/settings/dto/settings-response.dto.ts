import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import type { Tenant } from '@/modules/tenants/entities/tenant.entity'
import type {
  TenantConfig,
  SettingsIndustry,
  SettingsBilling,
  SettingsI18n,
  SettingsBusiness,
} from '../interfaces/settings.interface'

export class SettingsResponseDto {
  @ApiProperty() id: string
  @ApiProperty() name: string
  @ApiProperty() slug: string
  @ApiProperty() plan: string
  @ApiPropertyOptional() business: SettingsBusiness
  @ApiPropertyOptional() i18n: SettingsI18n
  @ApiPropertyOptional() billing: SettingsBilling
  @ApiPropertyOptional() industry: SettingsIndustry

  static from(tenant: Tenant): SettingsResponseDto {
    const config = (tenant.config ?? {}) as TenantConfig
    const dto = new SettingsResponseDto()
    dto.id = tenant.id
    dto.name = tenant.name
    dto.slug = tenant.slug
    dto.plan = tenant.plan?.name ?? ''
    dto.business = config.business ?? {}
    dto.i18n = config.i18n ?? {
      language: 'es',
      timezone: 'America/Bogota',
      currency: 'COP',
      dateFormat: 'DD/MM/YYYY',
      numberFormat: 'colombian',
    }
    dto.billing = config.billing ?? {}
    dto.industry = config.industry ?? {}
    return dto
  }
}
