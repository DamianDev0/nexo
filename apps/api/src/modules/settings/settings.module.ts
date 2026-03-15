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
import { SettingsService } from './services/settings.service'
import { TenantConfigService } from './services/tenant-config.service'
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
  ],
  providers: [SettingsService, TenantConfigService, ModuleEnabledGuard],
  exports: [SettingsService, TenantConfigService, ModuleEnabledGuard],
})
export class SettingsModule {}
