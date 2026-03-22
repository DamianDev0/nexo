import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Tenant } from '@/modules/tenants/entities/tenant.entity'
import { Plan } from '@/modules/tenants/entities/plan.entity'
import { TenantThemeHistory } from './entities/tenant-theme-history.entity'
import { SettingsController } from './controllers/settings.controller'
import { ThemeController } from './controllers/theme.controller'
import { NomenclatureController } from './controllers/nomenclature.controller'
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
import { ModuleEnabledGuard } from './guards/module-enabled.guard'

@Module({
  imports: [TypeOrmModule.forFeature([Tenant, Plan, TenantThemeHistory])],
  controllers: [
    SettingsController,
    ThemeController,
    NomenclatureController,
    NavigationController,
    CustomFieldsController,
    TenantPublicController,
    PipelineController,
    ActivityTypesController,
    BrandingController,
    OnboardingSettingsController,
  ],
  providers: [SettingsService, TenantConfigService, PipelineSettingsService, ModuleEnabledGuard],
  exports: [SettingsService, TenantConfigService, PipelineSettingsService, ModuleEnabledGuard],
})
export class SettingsModule {}
