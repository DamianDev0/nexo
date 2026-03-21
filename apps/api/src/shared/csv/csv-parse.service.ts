import { BadRequestException, Injectable } from '@nestjs/common'

export interface CsvParseResult<T> {
  data: T[]
  errors: { row: number; message: string }[]
}

@Injectable()
export class CsvParseService {
  /**
   * Parse a CSV buffer into an array of objects.
   * Expects the first row to be headers.
   * Returns parsed data + per-row errors (does not throw on individual row failures).
   */
  parse<T>(
    buffer: Buffer,
    mapRow: (row: Record<string, string>, index: number) => T | null,
  ): CsvParseResult<T> {
    const content = buffer.toString('utf-8').replace(/\r\n/g, '\n').replace(/\r/g, '\n')
    const lines = this.splitLines(content)

    if (lines.length < 2) {
      throw new BadRequestException('CSV file must have a header row and at least one data row')
    }

    const headerLine = lines[0]
    if (!headerLine) {
      throw new BadRequestException('CSV file must have a header row')
    }

    const headers = this.parseLine(headerLine).map((h) => h.trim().toLowerCase())
    const data: T[] = []
    const errors: { row: number; message: string }[] = []

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i]
      if (!line || line.trim() === '') continue

      try {
        const values = this.parseLine(line)
        const record: Record<string, string> = {}

        for (let j = 0; j < headers.length; j++) {
          const key = headers[j]
          if (key) {
            record[key] = values[j]?.trim() ?? ''
          }
        }

        const mapped = mapRow(record, i + 1) // 1-based row number (header = row 1)
        if (mapped !== null) {
          data.push(mapped)
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        errors.push({ row: i + 1, message })
      }
    }

    return { data, errors }
  }

  /** Split content into lines, respecting quoted fields that span multiple lines */
  private splitLines(content: string): string[] {
    const lines: string[] = []
    let current = ''
    let inQuotes = false

    for (const char of content) {
      if (char === '"') {
        inQuotes = !inQuotes
      }

      if (char === '\n' && !inQuotes) {
        lines.push(current)
        current = ''
      } else {
        current += char
      }
    }

    if (current.trim()) {
      lines.push(current)
    }

    return lines
  }

  /** Parse a single CSV line into fields, handling RFC 4180 quoting */
  private parseLine(line: string): string[] {
    const fields: string[] = []
    let current = ''
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
      const char = line[i]

      if (inQuotes) {
        if (char === '"') {
          if (line[i + 1] === '"') {
            current += '"'
            i++ // skip escaped quote
          } else {
            inQuotes = false
          }
        } else {
          current += char
        }
      } else {
        if (char === '"') {
          inQuotes = true
        } else if (char === ',') {
          fields.push(current)
          current = ''
        } else {
          current += char
        }
      }
    }

    fields.push(current)
    return fields
  }
}
