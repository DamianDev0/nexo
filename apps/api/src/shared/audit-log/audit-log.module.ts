import { Global, Module } from '@nestjs/common'
import { AuditLogService } from './audit-log.service'
import { AuditLogRepository } from './repositories/audit-log.repository'
import { AuditLogController } from './controllers/audit-log.controller'
import { CsvExportService } from '@/shared/csv/csv-export.service'

@Global()
@Module({
  controllers: [AuditLogController],
  providers: [AuditLogService, AuditLogRepository, CsvExportService],
  exports: [AuditLogService, CsvExportService],
})
export class AuditLogModule {}
