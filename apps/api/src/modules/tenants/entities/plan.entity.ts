import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

import { Tenant } from './tenant.entity'

@Entity({ name: 'plans', schema: 'public' })
export class Plan {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'varchar', length: 50, unique: true })
  name: string

  @Column({ type: 'bigint', default: 0 })
  priceCop: number

  @Column({ type: 'jsonb', default: {} })
  limits: {
    users: number
    contacts: number
    invoicesPerMonth: number
    workflows: number
    whatsapp: string
    ai: boolean
    apiAccess: boolean
    requestsPerMinute: number
  }

  @OneToMany(() => Tenant, (tenant) => tenant.plan)
  tenants: Tenant[]

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date
}
