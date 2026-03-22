import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { Tenant } from './entities/tenant.entity'
import { Plan } from './entities/plan.entity'
import { UserTenantMap } from './entities/user-tenant-map.entity'
import { TenantsController } from './controllers/tenants.controller'
import { TenantsService } from './services/tenants.service'
import { TenantsRepository } from './repositories/tenants.repository'
import { TenantProvisioningService } from './services/tenant-provisioning.service'
import { UserTenantMapService } from './services/user-tenant-map.service'

@Module({
  imports: [TypeOrmModule.forFeature([Tenant, Plan, UserTenantMap])],
  controllers: [TenantsController],
  providers: [TenantsService, TenantsRepository, TenantProvisioningService, UserTenantMapService],
  exports: [TenantsService, TenantProvisioningService, UserTenantMapService],
})
export class TenantsModule {}
