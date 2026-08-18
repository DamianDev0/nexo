import { BadRequestException, Injectable } from '@nestjs/common'
import { extname } from 'node:path'
import { ImportCsvParserService } from './import-csv-parser.service'
import { ImportXlsxParserService } from './import-xlsx-parser.service'
import type { ParsedFile, UploadedImportFile } from '../interfaces/import.interfaces'
import {
  IMPORT_ACCEPTED_EXTENSIONS,
  IMPORT_CSV_EXTENSIONS,
  IMPORT_LEGACY_EXCEL_EXTENSIONS,
  IMPORT_MAX_FILE_SIZE,
  IMPORT_XLSX_EXTENSIONS,
} from '../constants/import.constants'

const MEGABYTE = 1024 * 1024

function extensionOf(fileName: string): string {
  return extname(fileName).toLowerCase()
}

function includes(list: readonly string[], value: string): boolean {
  return list.includes(value)
}

@Injectable()
export class ImportFileParserService {
  constructor(
    private readonly csv: ImportCsvParserService,
    private readonly xlsx: ImportXlsxParserService,
  ) {}

  validateFile(file: UploadedImportFile): void {
    const extension = extensionOf(file.originalname)

    if (includes(IMPORT_LEGACY_EXCEL_EXTENSIONS, extension)) {
      throw new BadRequestException(
        'Excel 97-2003 (.xls) is not supported. Open the file and save it as .xlsx or .csv.',
      )
    }

    if (!includes(IMPORT_ACCEPTED_EXTENSIONS, extension)) {
      throw new BadRequestException(
        `File type "${extension || file.mimetype}" is not supported. Upload a .csv or .xlsx file.`,
      )
    }

    if (file.size > IMPORT_MAX_FILE_SIZE) {
      throw new BadRequestException(
        `File size exceeds the ${Math.round(IMPORT_MAX_FILE_SIZE / MEGABYTE)} MB limit.`,
      )
    }
  }

  async analyze(buffer: Buffer, fileName: string): Promise<ParsedFile> {
    return this.isSpreadsheet(fileName) ? this.xlsx.analyze(buffer) : this.csv.analyze(buffer)
  }

  async parseAll(buffer: Buffer, fileName: string): Promise<Record<string, string>[]> {
    return this.isSpreadsheet(fileName) ? this.xlsx.parseAll(buffer) : this.csv.parseAll(buffer)
  }

  private isSpreadsheet(fileName: string): boolean {
    const extension = extensionOf(fileName)
    if (includes(IMPORT_XLSX_EXTENSIONS, extension)) return true
    if (includes(IMPORT_CSV_EXTENSIONS, extension)) return false

    throw new BadRequestException(`File type "${extension}" is not supported.`)
  }
}
