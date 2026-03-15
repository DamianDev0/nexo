import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import type { AuditLogRow } from '../repositories/audit-log.repository'
import type { AuditSeverity } from '../audit-log.interfaces'

export class AuditLogEntryDto {
  @ApiProperty() id: string
  @ApiProperty() action: string
  @ApiProperty() entityType: string
  @ApiPropertyOptional() entityId: string | null
  @ApiPropertyOptional() userId: string | null
  @ApiPropertyOptional() ipAddress: string | null
  @ApiPropertyOptional() userAgent: string | null
  @ApiProperty({ enum: ['info', 'warning', 'critical'] }) severity: AuditSeverity
  @ApiPropertyOptional() description: string | null
  @ApiPropertyOptional() metadata: Record<string, unknown> | null
  @ApiProperty() createdAt: string

  static from(row: AuditLogRow): AuditLogEntryDto {
    const dto = new AuditLogEntryDto()
    dto.id = row.id
    dto.action = row.action
    dto.entityType = row.entity_type
    dto.entityId = row.entity_id
    dto.userId = row.user_id
    dto.ipAddress = row.ip_address
    dto.userAgent = row.user_agent
    dto.severity = row.severity
    dto.description = row.description
    dto.metadata = row.metadata
    dto.createdAt =
      row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at)
    return dto
  }
}

export class AuditLogPageDto {
  @ApiProperty({ type: [AuditLogEntryDto] }) data: AuditLogEntryDto[]
  @ApiPropertyOptional({ description: 'Pass as cursor param to get the next page' })
  nextCursor: string | null
}
