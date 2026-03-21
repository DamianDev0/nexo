import { BadRequestException, Injectable } from '@nestjs/common'
import { parse } from 'csv-parse'

const CSV_SAMPLE_SIZE = 5
const MAX_FILE_SIZE = 10 * 1024 * 1024
const ALLOWED_MIMES = new Set(['text/csv', 'application/vnd.ms-excel', 'text/plain'])

@Injectable()
export class ImportCsvParserService {
  validateFile(file: { mimetype: string; size: number }): void {
    if (!ALLOWED_MIMES.has(file.mimetype)) {
      throw new BadRequestException(
        `File type "${file.mimetype}" not supported. Upload a CSV file.`,
      )
    }
    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException('File size exceeds the 10 MB limit.')
    }
  }

  async analyze(buffer: Buffer): Promise<{
    columns: string[]
    sampleRows: Record<string, string>[]
    totalRows: number
  }> {
    const sampleRows: Record<string, string>[] = []
    let columns: string[] = []
    let totalRows = 0

    const parser = parse(buffer, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      relax_column_count: true,
      bom: true,
    })

    for await (const record of parser) {
      totalRows++
      if (columns.length === 0) {
        columns = Object.keys(record as Record<string, string>)
      }
      if (sampleRows.length < CSV_SAMPLE_SIZE) {
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

    const parser = parse(buffer, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      relax_column_count: true,
      bom: true,
    })

    for await (const record of parser) {
      rows.push(record as Record<string, string>)
    }

    if (rows.length === 0) {
      throw new BadRequestException('The CSV file contains no data rows.')
    }

    return rows
  }
}
