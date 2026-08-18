import { BadRequestException, Injectable } from '@nestjs/common'
import ExcelJS from 'exceljs'
import type { ParsedFile } from '../interfaces/import.interfaces'
import { IMPORT_SAMPLE_SIZE } from '../constants/import.constants'

type CellValue = ExcelJS.CellValue

function cellToText(value: CellValue): string {
  if (value === null || value === undefined) return ''
  if (value instanceof Date) return value.toISOString().slice(0, 10)
  if (typeof value === 'object') {
    if ('text' in value && typeof value.text === 'string') return value.text.trim()
    if ('result' in value) return cellToText(value.result as CellValue)
    if ('richText' in value && Array.isArray(value.richText)) {
      return value.richText
        .map((part) => part.text)
        .join('')
        .trim()
    }
    return ''
  }
  return String(value).trim()
}

function headersFrom(sheet: ExcelJS.Worksheet): string[] {
  const headers: string[] = []
  sheet.getRow(1).eachCell({ includeEmpty: true }, (cell, column) => {
    headers[column - 1] = cellToText(cell.value)
  })
  return headers.map((header, index) => header || `Column ${index + 1}`)
}

function isEmptyRecord(record: Record<string, string>): boolean {
  return Object.values(record).every((value) => value === '')
}

@Injectable()
export class ImportXlsxParserService {
  async analyze(buffer: Buffer): Promise<ParsedFile> {
    const { headers, rows } = await this.read(buffer)

    return {
      columns: headers,
      sampleRows: rows.slice(0, IMPORT_SAMPLE_SIZE),
      totalRows: rows.length,
    }
  }

  async parseAll(buffer: Buffer): Promise<Record<string, string>[]> {
    const { rows } = await this.read(buffer)
    if (rows.length === 0) {
      throw new BadRequestException('The spreadsheet contains no data rows.')
    }
    return rows
  }

  private async read(
    buffer: Buffer,
  ): Promise<{ headers: string[]; rows: Record<string, string>[] }> {
    const workbook = new ExcelJS.Workbook()

    try {
      await workbook.xlsx.load(new Uint8Array(buffer).buffer)
    } catch {
      throw new BadRequestException('The spreadsheet could not be read. Save it again as .xlsx.')
    }

    const sheet = workbook.worksheets[0]
    if (!sheet) {
      throw new BadRequestException('The spreadsheet has no sheets.')
    }

    const headers = headersFrom(sheet)
    if (headers.length === 0) {
      throw new BadRequestException(
        'No columns detected in the spreadsheet. Ensure the first row contains headers.',
      )
    }

    const rows: Record<string, string>[] = []
    sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber === 1) return

      const record: Record<string, string> = {}
      headers.forEach((header, index) => {
        record[header] = cellToText(row.getCell(index + 1).value)
      })

      if (!isEmptyRecord(record)) rows.push(record)
    })

    return { headers, rows }
  }
}
