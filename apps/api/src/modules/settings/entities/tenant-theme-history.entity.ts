import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm'
import type { TenantTheme } from '../interfaces/tenant-theme.interface'

@Entity({ name: 'tenant_theme_history', schema: 'public' })
@Index(['tenantId', 'createdAt'])
export class TenantThemeHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string

  @Column({ name: 'changed_by', type: 'uuid', nullable: true })
  changedBy: string | null

  @Column({ name: 'previous_config', type: 'jsonb' })
  previousConfig: TenantTheme

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date
}
