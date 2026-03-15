import { ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { Plan } from '../entities/plan.entity'
import { TenantsRepository } from '../repositories/tenants.repository'
import { TenantProvisioningService } from './tenant-provisioning.service'
import type { CreateTenantDto } from '../dto/create-tenant.dto'
import { TenantResponseDto } from '../dto/tenant-response.dto'

@Injectable()
export class TenantsService {
  constructor(
    @InjectPinoLogger(TenantsService.name)
    private readonly logger: PinoLogger,
    private readonly tenantsRepo: TenantsRepository,
    private readonly provisioning: TenantProvisioningService,
    @InjectRepository(Plan)
    private readonly planRepo: Repository<Plan>,
  ) {}

  async create(dto: CreateTenantDto): Promise<TenantResponseDto> {
    if (await this.tenantsRepo.slugExists(dto.slug)) {
      throw new ConflictException(`Subdomain "${dto.slug}" is already taken`)
    }

    const planName = dto.planName ?? 'free'
    const plan = await this.planRepo.findOne({ where: { name: planName } })
    if (!plan) {
      throw new NotFoundException(`Plan "${planName}" not found`)
    }

    const schemaName = `tenant_${dto.slug.replaceAll('-', '_')}`

    const tenant = await this.tenantsRepo.create({
      slug: dto.slug,
      name: dto.name,
      schemaName,
      planId: plan.id,
    })

    await this.provisioning.createTenantSchema(schemaName)

    this.logger.info({ slug: dto.slug, schemaName }, 'Tenant created')

    const fullTenant = await this.tenantsRepo.findById(tenant.id)
    if (!fullTenant) throw new NotFoundException(`Tenant "${dto.slug}" not found after creation`)
    return TenantResponseDto.fromEntity(fullTenant)
  }

  async findAll(): Promise<TenantResponseDto[]> {
    const tenants = await this.tenantsRepo.findAll()
    return tenants.map(TenantResponseDto.fromEntity)
  }

  async findBySlug(slug: string): Promise<TenantResponseDto> {
    const tenant = await this.tenantsRepo.findBySlug(slug)
    if (!tenant) {
      throw new NotFoundException(`Tenant "${slug}" not found`)
    }
    return TenantResponseDto.fromEntity(tenant)
  }

  /**
   * Hard-deletes a tenant record and drops its schema.
   * Used as rollback during failed onboarding — not exposed via API.
   */
  async delete(tenantId: string): Promise<void> {
    const tenant = await this.tenantsRepo.findById(tenantId)
    if (!tenant) return

    await this.provisioning.dropTenantSchema(tenant.schemaName)
    await this.tenantsRepo.deleteById(tenantId)
    this.logger.warn({ slug: tenant.slug }, 'Tenant deleted (onboarding rollback)')
  }
}
