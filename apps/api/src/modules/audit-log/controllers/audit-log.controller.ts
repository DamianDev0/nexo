import { Controller, Get, Query, Res, HttpStatus } from '@nestjs/common'
import { ApiOkResponse, ApiProduces, ApiTags } from '@nestjs/swagger'
import type { Response } from 'express'
import type { TenantContext } from '@repo/shared-types'
import { UserRole } from '@repo/shared-types'
import { ApiEndpoint } from '@/shared/decorators/api-endpoint.decorator'
import { TenantCtx } from '@/shared/decorators/tenant-context.decorator'
import { CsvExportService, type CsvColumn } from '@/shared/csv/csv-export.service'
import { AuditLogService } from '../services/audit-log.service'
import type { AuditLogRow } from '../interfaces/audit-log-row.interfaces'
import { AuditLogQueryDto } from '../dto/audit-log-query.dto'
import { AuditLogEntryDto, AuditLogPageDto } from '../dto/audit-log-response.dto'

const CSV_COLUMNS: CsvColumn<AuditLogRow>[] = [
  {
    header: 'Created At',
    value: (r) =>
      r.created_at instanceof Date ? r.created_at.toISOString() : String(r.created_at),
  },
  { header: 'Action', value: (r) => r.action },
  { header: 'Severity', value: (r) => r.severity },
  { header: 'Entity Type', value: (r) => r.entity_type },
  { header: 'Entity ID', value: (r) => r.entity_id ?? '' },
  { header: 'User ID', value: (r) => r.user_id ?? '' },
  { header: 'Description', value: (r) => r.description ?? '' },
  { header: 'IP Address', value: (r) => r.ip_address ?? '' },
  { header: 'User Agent', value: (r) => r.user_agent ?? '' },
]

@ApiTags('Audit Log')
@Controller('audit-log')
export class AuditLogController {
  constructor(
    private readonly auditLog: AuditLogService,
    private readonly csv: CsvExportService,
  ) {}

  @Get()
  @ApiEndpoint({
    summary: 'List audit log entries with cursor pagination and filters',
    roles: [UserRole.ADMIN],
    status: HttpStatus.OK,
  })
  @ApiOkResponse({ type: AuditLogPageDto })
  async findAll(
    @TenantCtx() tenantCtx: TenantContext,
    @Query() query: AuditLogQueryDto,
  ): Promise<AuditLogPageDto> {
    const page = await this.auditLog.findPage(tenantCtx.schemaName, query)
    return {
      data: page.rows.map(AuditLogEntryDto.from),
      nextCursor: page.nextCursor,
    }
  }

  @Get('export.csv')
  @ApiEndpoint({ summary: 'Export filtered audit log entries as CSV', roles: [UserRole.ADMIN] })
  @ApiProduces('text/csv')
  async exportCsv(
    @TenantCtx() tenantCtx: TenantContext,
    @Query() query: AuditLogQueryDto,
    @Res() res: Response,
  ): Promise<void> {
    const { userId, action, severity, entityType, from, to } = query
    const rows = await this.auditLog.findAll(tenantCtx.schemaName, {
      userId,
      action,
      severity,
      entityType,
      from,
      to,
    })

    const buffer = this.csv.toBuffer(rows, CSV_COLUMNS)
    const filename = `audit-log-${new Date().toISOString().slice(0, 10)}.csv`

    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    res.setHeader('Content-Length', buffer.length)
    res.end(buffer)
  }
}
