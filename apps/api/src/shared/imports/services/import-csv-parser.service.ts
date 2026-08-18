import { BadRequestException, Injectable } from '@nestjs/common'
import { parse } from 'csv-parse'
import type { ParsedFile } from '../interfaces/import.interfaces'
import { IMPORT_SAMPLE_SIZE } from '../constants/import.constants'

const PARSE_OPTIONS = {
  columns: true,
  skip_empty_lines: true,
  trim: true,
  relax_column_count: true,
  bom: true,
} as const

@Injectable()
export class ImportCsvParserService {
  async analyze(buffer: Buffer): Promise<ParsedFile> {
    const sampleRows: Record<string, string>[] = []
    let columns: string[] = []
    let totalRows = 0

    const parser = parse(buffer, PARSE_OPTIONS)

    for await (const record of parser) {
      totalRows++
      if (columns.length === 0) {
        columns = Object.keys(record as Record<string, string>)
      }
      if (sampleRows.length < IMPORT_SAMPLE_SIZE) {
        sampleRows.push(record as Record<string, string>)
      }
    }

    if (columns.length === 0) {
      throw new BadRequestException(
        'No columns detected in the CSV file. Ensure the first row contains headers.',
      )
    }

    return { columns, sampleRows, totalRows }
  }

  async parseAll(buffer: Buffer): Promise<Record<string, string>[]> {
    const rows: Record<string, string>[] = []

    const parser = parse(buffer, PARSE_OPTIONS)

    for await (const record of parser) {
      rows.push(record as Record<string, string>)
    }

    if (rows.length === 0) {
      throw new BadRequestException('The CSV file contains no data rows.')
    }

    return rows
  }
}
