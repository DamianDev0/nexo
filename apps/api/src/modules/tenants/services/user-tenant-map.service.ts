import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { UserTenantMap } from '../entities/user-tenant-map.entity'
import { Tenant } from '../entities/tenant.entity'
import { UserTenantMapRepository } from '../repositories/user-tenant-map.repository'

@Injectable()
export class UserTenantMapService implements OnApplicationBootstrap {
  private readonly logger = new Logger(UserTenantMapService.name)

  constructor(
    @InjectRepository(UserTenantMap)
    private readonly mapRepo: Repository<UserTenantMap>,
    @InjectRepository(Tenant)
    private readonly tenantRepo: Repository<Tenant>,
    private readonly userTenantMapRepository: UserTenantMapRepository,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    try {
      const count = await this.backfill()
      if (count > 0) {
        this.logger.log(`Backfilled ${count} user-tenant mappings`)
      }
    } catch (error) {
      this.logger.error('Failed to backfill user-tenant mappings', error)
    }
  }

  async register(email: string, tenantId: string): Promise<void> {
    const normalized = email.toLowerCase()

    const exists = await this.mapRepo.findOne({
      where: { email: normalized, tenantId },
    })
    if (exists) return

    await this.mapRepo.save(this.mapRepo.create({ email: normalized, tenantId }))
    this.logger.debug(`Mapped ${normalized} → tenant ${tenantId}`)
  }

  async updateEmail(oldEmail: string, newEmail: string, tenantId: string): Promise<void> {
    await this.mapRepo.update(
      { email: oldEmail.toLowerCase(), tenantId },
      { email: newEmail.toLowerCase() },
    )
  }

  async remove(email: string, tenantId: string): Promise<void> {
    await this.mapRepo.delete({ email: email.toLowerCase(), tenantId })
  }

  async findTenantByEmail(email: string): Promise<Tenant | null> {
    const mappings = await this.mapRepo.find({
      where: { email: email.toLowerCase() },
      relations: ['tenant'],
      order: { createdAt: 'ASC' },
    })

    return mappings.find((mapping) => mapping.tenant?.isActive)?.tenant ?? null
  }

  async backfill(): Promise<number> {
    const tenants = await this.tenantRepo.find({ where: { isActive: true } })
    let created = 0

    for (const tenant of tenants) {
      const users = await this.userTenantMapRepository.findActiveUserEmails(tenant.schemaName)

      for (const user of users) {
        const exists = await this.mapRepo.findOne({
          where: { email: user.email, tenantId: tenant.id },
        })

        if (!exists) {
          await this.mapRepo.save(this.mapRepo.create({ email: user.email, tenantId: tenant.id }))
          created++
        }
      }
    }

    return created
  }
}
