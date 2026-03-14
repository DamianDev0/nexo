import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { Plan } from '../entities/plan.entity'
import { TenantsRepository } from '../repositories/tenants.repository'
import { TenantProvisioningService } from './tenant-provisioning.service'
import type { CreateTenantDto } from '../dto/create-tenant.dto'
import { TenantResponseDto } from '../dto/tenant-response.dto'

@Injectable()
export class TenantsService {
  private readonly logger = new Logger(TenantsService.name)

  constructor(
    private readonly tenantsRepo: TenantsRepository,
    private readonly provisioning: TenantProvisioningService,
    @InjectRepository(Plan)
    private readonly planRepo: Repository<Plan>,
  ) {}

  async create(dto: CreateTenantDto): Promise<TenantResponseDto> {
    // Check slug uniqueness
    if (await this.tenantsRepo.slugExists(dto.slug)) {
      throw new ConflictException(`Subdomain "${dto.slug}" is already taken`)
    }

    // Resolve plan
    const planName = dto.planName ?? 'free'
    const plan = await this.planRepo.findOne({ where: { name: planName } })
    if (!plan) {
      throw new NotFoundException(`Plan "${planName}" not found`)
    }

    const schemaName = `tenant_${dto.slug.replaceAll('-', '_')}`

    // Create the tenant record
    const tenant = await this.tenantsRepo.create({
      slug: dto.slug,
      name: dto.name,
      schemaName,
      planId: plan.id,
    })

    // Provision the isolated schema
    await this.provisioning.createTenantSchema(schemaName)

    this.logger.log(`Tenant created: ${dto.slug} (${schemaName})`)

    // Re-fetch with plan relation
    const fullTenant = await this.tenantsRepo.findById(tenant.id)
    return TenantResponseDto.fromEntity(fullTenant!)
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
}
