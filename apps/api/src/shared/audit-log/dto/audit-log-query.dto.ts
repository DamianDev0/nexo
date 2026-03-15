import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsEnum, IsInt, IsISO8601, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator'
import { Type } from 'class-transformer'
import { AuditAction, AuditEntityType, AuditSeverity } from '../audit-log.interfaces'

export class AuditLogQueryDto {
  @ApiPropertyOptional({ description: 'Filter by user ID' })
  @IsOptional()
  @IsUUID()
  userId?: string

  @ApiPropertyOptional({ enum: AuditAction, description: 'Filter by action type' })
  @IsOptional()
  @IsEnum(AuditAction)
  action?: AuditAction

  @ApiPropertyOptional({ enum: ['info', 'warning', 'critical'], description: 'Filter by severity' })
  @IsOptional()
  @IsString()
  severity?: AuditSeverity

  @ApiPropertyOptional({ enum: AuditEntityType, description: 'Filter by entity type' })
  @IsOptional()
  @IsEnum(AuditEntityType)
  entityType?: AuditEntityType

  @ApiPropertyOptional({
    example: '2026-01-01T00:00:00Z',
    description: 'Start of date range (ISO 8601)',
  })
  @IsOptional()
  @IsISO8601()
  from?: string

  @ApiPropertyOptional({
    example: '2026-12-31T23:59:59Z',
    description: 'End of date range (ISO 8601)',
  })
  @IsOptional()
  @IsISO8601()
  to?: string

  @ApiPropertyOptional({ description: 'Cursor for next page (returned by previous response)' })
  @IsOptional()
  @IsString()
  cursor?: string

  @ApiPropertyOptional({ default: 50, minimum: 1, maximum: 200 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  limit?: number
}
