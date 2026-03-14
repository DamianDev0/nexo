import type { Tenant } from '../entities/tenant.entity'

export class TenantResponseDto {
  id: string
  slug: string
  name: string
  schemaName: string
  plan: string
  isActive: boolean
  createdAt: Date

  static fromEntity(tenant: Tenant): TenantResponseDto {
    return {
      id: tenant.id,
      slug: tenant.slug,
      name: tenant.name,
      schemaName: tenant.schemaName,
      plan: tenant.plan?.name ?? 'free',
      isActive: tenant.isActive,
      createdAt: tenant.createdAt,
    }
  }
}
