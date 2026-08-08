import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Tenant } from '@/modules/tenants/entities/tenant.entity'
import { Plan } from '@/modules/tenants/entities/plan.entity'
import { TenantThemeHistory } from './entities/tenant-theme-history.entity'
import { SettingsController } from './controllers/settings.controller'
import { ThemeController } from './controllers/theme.controller'
import { NomenclatureController } from './controllers/nomenclature.controller'
import { ContactTaxonomyController } from './controllers/contact-taxonomy.controller'
import { NavigationController } from './controllers/navigation.controller'
import { CustomFieldsController } from './controllers/custom-fields.controller'
import { TenantPublicController } from './controllers/tenant-public.controller'
import { PipelineController } from './controllers/pipeline.controller'
import { ActivityTypesController } from './controllers/activity-types.controller'
import { BrandingController } from './controllers/branding.controller'
import { OnboardingSettingsController } from './controllers/onboarding-settings.controller'
import { SettingsService } from './services/settings.service'
import { TenantConfigService } from './services/tenant-config.service'
import { PipelineSettingsService } from './services/pipeline-settings.service'
import { ThemeCssService } from './services/theme-css.service'
import { ThemeExportService } from './services/theme-export.service'
import { ThemeImportService } from './services/theme-import.service'
import { CustomFieldsValidator } from './services/custom-fields-validator.service'
import { CustomFieldsComputer } from './services/custom-fields-computer.service'
import { PipelineSettingsRepository } from './repositories/pipeline-settings.repository'
import { TenantConfigRepository } from './repositories/tenant-config.repository'
import { ModuleEnabledGuard } from './guards/module-enabled.guard'

@Module({
  imports: [TypeOrmModule.forFeature([Tenant, Plan, TenantThemeHistory])],
  controllers: [
    SettingsController,
    ThemeController,
    NomenclatureController,
    NavigationController,
    ContactTaxonomyController,
    CustomFieldsController,
    TenantPublicController,
    PipelineController,
    ActivityTypesController,
    BrandingController,
    OnboardingSettingsController,
  ],
  providers: [
    SettingsService,
    TenantConfigService,
    PipelineSettingsService,
    ThemeCssService,
    ThemeExportService,
    ThemeImportService,
    CustomFieldsValidator,
    CustomFieldsComputer,
    PipelineSettingsRepository,
    TenantConfigRepository,
    ModuleEnabledGuard,
  ],
  exports: [
    SettingsService,
    TenantConfigService,
    PipelineSettingsService,
    CustomFieldsValidator,
    CustomFieldsComputer,
    ModuleEnabledGuard,
  ],
})
export class SettingsModule {}
