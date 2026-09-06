import ExcelJS from 'exceljs'
import type { BulkExportFormat } from '@repo/shared-types'
import { BULK_EXPORT_HIDDEN_COLUMNS } from '../constants/bulk-action.constants'

type ExportRow = Record<string, unknown>

const XLSX_SHEET_NAME = 'Export'

export function exportColumns(rows: ReadonlyArray<ExportRow>, columns?: string[]): string[] {
  const first = rows[0]
  return (columns?.length ? columns : first ? Object.keys(first) : []).filter(
    (column) => !BULK_EXPORT_HIDDEN_COLUMNS.has(column),
  )
}

function cellText(value: unknown): string {
  if (value === null || value === undefined) return ''
  if (value instanceof Date) return value.toISOString()
  return typeof value === 'object' ? JSON.stringify(value) : String(value)
}

function csvCell(value: unknown): string {
  const text = cellText(value)
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}

export function toCsv(rows: ReadonlyArray<ExportRow>, columns?: string[]): string {
  const headers = exportColumns(rows, columns)
  const lines = rows.map((row) => headers.map((column) => csvCell(row[column])).join(','))
  return [headers.join(','), ...lines].join('\n')
}

export function toJson(rows: ReadonlyArray<ExportRow>, columns?: string[]): string {
  const headers = exportColumns(rows, columns)
  const picked = rows.map((row) =>
    Object.fromEntries(headers.map((column) => [column, row[column] ?? null])),
  )
  return JSON.stringify(picked)
}

function xlsxCell(value: unknown): ExcelJS.CellValue {
  if (value === null || value === undefined) return null
  if (value instanceof Date || typeof value === 'number' || typeof value === 'boolean') return value
  return cellText(value)
}

export async function toXlsx(rows: ReadonlyArray<ExportRow>, columns?: string[]): Promise<Buffer> {
  const headers = exportColumns(rows, columns)
  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet(XLSX_SHEET_NAME)
  sheet.columns = headers.map((header) => ({ header, key: header }))
  for (const row of rows) sheet.addRow(headers.map((column) => xlsxCell(row[column])))
  const output = await workbook.xlsx.writeBuffer()
  return Buffer.from(output as ArrayBuffer)
}

export async function serializeExport(
  format: BulkExportFormat,
  rows: ReadonlyArray<ExportRow>,
  columns?: string[],
): Promise<Buffer> {
  switch (format) {
    case 'xlsx':
      return toXlsx(rows, columns)
    case 'json':
      return Buffer.from(toJson(rows, columns), 'utf8')
    case 'csv':
      return Buffer.from(toCsv(rows, columns), 'utf8')
  }
}
