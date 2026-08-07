import { Column, Entity, Index, PrimaryColumn } from 'typeorm'

@Entity({ name: 'co_municipalities', schema: 'public' })
@Index('idx_co_municipalities_department', ['departmentCode'])
export class Municipality {
  @PrimaryColumn({ type: 'char', length: 5 })
  code: string

  @Column({ type: 'varchar', length: 120 })
  name: string

  @Column({ name: 'search_name', type: 'varchar', length: 120 })
  searchName: string

  @Column({ name: 'department_code', type: 'char', length: 2 })
  departmentCode: string

  @Column({ type: 'varchar', length: 120 })
  department: string

  @Column({ type: 'numeric', precision: 9, scale: 6, nullable: true })
  latitude: number | null

  @Column({ type: 'numeric', precision: 9, scale: 6, nullable: true })
  longitude: number | null
}
