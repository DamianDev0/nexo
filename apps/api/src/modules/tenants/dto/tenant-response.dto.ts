import { PlanName } from '@repo/shared-types'
import type { Tenant } from '../entities/tenant.entity'

export class TenantResponseDto {
  id: string
  slug: string
  name: string
  schemaName: string
  plan: PlanName
  isActive: boolean
  createdAt: Date

  static fromEntity(tenant: Tenant): TenantResponseDto {
    return {
      id: tenant.id,
      slug: tenant.slug,
      name: tenant.name,
      schemaName: tenant.schemaName,
      plan: (tenant.plan?.name ?? PlanName.FREE) as PlanName,
      isActive: tenant.isActive,
      createdAt: tenant.createdAt,
    }
  }
}
