import { Global, Module } from '@nestjs/common'
import { AuditLogService } from './services/audit-log.service'
import { AuditLogListener } from './listeners/audit-log.listener'
import { AuditLogRepository } from './repositories/audit-log.repository'
import { AuditLogController } from './controllers/audit-log.controller'
import { CsvExportService } from '@/shared/csv/csv-export.service'

@Global()
@Module({
  controllers: [AuditLogController],
  providers: [AuditLogService, AuditLogListener, AuditLogRepository, CsvExportService],
  exports: [AuditLogService, CsvExportService],
})
export class AuditLogModule {}
