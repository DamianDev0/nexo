import { Injectable } from '@nestjs/common'

export interface CsvColumn<T> {
  header: string
  value: (row: T) => string
}

@Injectable()
export class CsvExportService {
  toBuffer<T>(rows: T[], columns: CsvColumn<T>[]): Buffer {
    const header = columns.map((c) => this.escape(c.header)).join(',')
    const lines = rows.map((row) => columns.map((c) => this.escape(c.value(row))).join(','))
    return Buffer.from([header, ...lines].join('\r\n'), 'utf-8')
  }

  private escape(value: string): string {
    if (
      value.includes(',') ||
      value.includes('"') ||
      value.includes('\r') ||
      value.includes('\n')
    ) {
      return `"${value.replaceAll('"', '""')}"`
    }
    return value
  }
}
