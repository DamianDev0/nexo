import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

import { Plan } from './plan.entity'

@Entity({ name: 'tenants', schema: 'public' })
export class Tenant {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'varchar', length: 63, unique: true })
  slug: string

  @Column({ type: 'varchar', length: 300 })
  name: string

  @Column({ type: 'varchar', length: 100, unique: true })
  schemaName: string

  @ManyToOne(() => Plan, (plan) => plan.tenants)
  @JoinColumn({ name: 'plan_id' })
  plan: Plan

  @Column({ name: 'plan_id', type: 'uuid' })
  planId: string

  @Column({ type: 'jsonb', default: {} })
  config: Record<string, unknown>

  @Column({ name: 'product_name', type: 'varchar', length: 100, nullable: true })
  productName: string | null

  @Column({ name: 'custom_domain', type: 'varchar', length: 255, nullable: true })
  customDomain: string | null

  @Column({ name: 'domain_verified', type: 'boolean', default: false })
  domainVerified: boolean

  @Column({ name: 'domain_verified_at', type: 'timestamptz', nullable: true })
  domainVerifiedAt: Date | null

  @Column({ type: 'boolean', default: true })
  isActive: boolean

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date
}
