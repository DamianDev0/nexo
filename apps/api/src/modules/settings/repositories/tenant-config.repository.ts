import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Tenant } from '@/modules/tenants/entities/tenant.entity'

@Injectable()
export class TenantConfigRepository {
  constructor(
    @InjectRepository(Tenant)
    private readonly tenantRepo: Repository<Tenant>,
  ) {}

  async saveConfigSection(tenantId: string, section: string, value: unknown): Promise<void> {
    await this.tenantRepo.query(
      `UPDATE public.tenants
         SET config = jsonb_set(COALESCE(config, '{}'::jsonb), $2::text[], $3::jsonb, true)
       WHERE id = $1`,
      [tenantId, `{${section}}`, JSON.stringify(value)],
    )
  }
}
