import { Global, Module } from '@nestjs/common'
import { ImportCsvParserService } from './services/import-csv-parser.service'
import { ImportFileParserService } from './services/import-file-parser.service'
import { ImportXlsxParserService } from './services/import-xlsx-parser.service'
import { ImportFieldMapperService } from './services/import-field-mapper.service'
import { ImportFileStoreService } from './services/import-file-store.service'
import { ImportService } from './services/import.service'

@Global()
@Module({
  providers: [
    ImportCsvParserService,
    ImportXlsxParserService,
    ImportFileParserService,
    ImportFieldMapperService,
    ImportFileStoreService,
    ImportService,
  ],
  exports: [ImportService, ImportFieldMapperService],
})
export class ImportsModule {}
