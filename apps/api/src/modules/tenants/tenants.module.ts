import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { Tenant } from './entities/tenant.entity'
import { Plan } from './entities/plan.entity'
import { TenantsController } from './controllers/tenants.controller'
import { TenantsService } from './services/tenants.service'
import { TenantsRepository } from './repositories/tenants.repository'
import { TenantProvisioningService } from './services/tenant-provisioning.service'

@Module({
  imports: [TypeOrmModule.forFeature([Tenant, Plan])],
  controllers: [TenantsController],
  providers: [TenantsService, TenantsRepository, TenantProvisioningService],
  exports: [TenantsService, TenantProvisioningService],
})
export class TenantsModule {}
