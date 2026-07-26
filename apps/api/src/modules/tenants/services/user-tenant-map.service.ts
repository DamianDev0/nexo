import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { TenantDbService } from '@/shared/database/tenant-db.service'
import { UserTenantMap } from '../entities/user-tenant-map.entity'
import { Tenant } from '../entities/tenant.entity'

@Injectable()
export class UserTenantMapService implements OnApplicationBootstrap {
  private readonly logger = new Logger(UserTenantMapService.name)

  constructor(
    @InjectRepository(UserTenantMap)
    private readonly mapRepo: Repository<UserTenantMap>,
    @InjectRepository(Tenant)
    private readonly tenantRepo: Repository<Tenant>,
    private readonly tenantDb: TenantDbService,
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
    const mapping = await this.mapRepo.findOne({
      where: { email: email.toLowerCase() },
      relations: ['tenant'],
    })
    return mapping?.tenant ?? null
  }

  async backfill(): Promise<number> {
    const tenants = await this.tenantRepo.find({ where: { isActive: true } })
    let created = 0

    for (const tenant of tenants) {
      const users = await this.fetchUsersFromSchema(tenant.schemaName)

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

  private async fetchUsersFromSchema(schemaName: string): Promise<Array<{ email: string }>> {
    return this.tenantDb.query(schemaName, async (qr) => {
      const rows: Array<{ email: string }> = await qr.query(
        `SELECT LOWER(email) as email FROM "${schemaName}".users WHERE is_active = true`,
      )
      return rows
    })
  }
}
