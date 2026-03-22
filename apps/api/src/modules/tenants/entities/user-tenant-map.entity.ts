import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'

import { Tenant } from './tenant.entity'

/**
 * Lookup table in the public schema that maps user emails to tenants.
 * Enables resolving which tenant a user belongs to without knowing the schema.
 * Populated during onboarding, user invites, and Google OAuth sign-ups.
 */
@Entity({ name: 'user_tenant_map', schema: 'public' })
@Index(['email', 'tenantId'], { unique: true })
export class UserTenantMap {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'varchar', length: 255 })
  @Index()
  email: string

  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date
}
