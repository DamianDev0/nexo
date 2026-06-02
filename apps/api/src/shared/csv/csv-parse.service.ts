import { BadRequestException, Injectable } from '@nestjs/common'

export interface CsvParseResult<T> {
  data: T[]
  errors: { row: number; message: string }[]
}

@Injectable()
export class CsvParseService {
  parse<T>(
    buffer: Buffer,
    mapRow: (row: Record<string, string>, index: number) => T | null,
  ): CsvParseResult<T> {
    const content = buffer.toString('utf-8').replaceAll('\r\n', '\n').replaceAll('\r', '\n')
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

      const rowNumber = i + 1
      try {
        const record = this.buildRecord(headers, this.parseLine(line))
        const mapped = mapRow(record, rowNumber)
        if (mapped !== null) data.push(mapped)
      } catch (err) {
        errors.push({ row: rowNumber, message: err instanceof Error ? err.message : String(err) })
      }
    }

    return { data, errors }
  }

  private buildRecord(headers: string[], values: string[]): Record<string, string> {
    const record: Record<string, string> = {}
    for (let j = 0; j < headers.length; j++) {
      const key = headers[j]
      if (key) record[key] = values[j]?.trim() ?? ''
    }
    return record
  }

  private splitLines(content: string): string[] {
    const lines: string[] = []
    let current = ''
    let inQuotes = false

    for (const char of content) {
      if (char === '"') inQuotes = !inQuotes

      if (char === '\n' && !inQuotes) {
        lines.push(current)
        current = ''
      } else {
        current += char
      }
    }

    if (current.trim()) lines.push(current)

    return lines
  }

  private parseLine(line: string): string[] {
    const fields: string[] = []
    let current = ''
    let inQuotes = false
    let i = 0

    while (i < line.length) {
      const char = line[i]

      if (inQuotes) {
        const next = this.readQuotedChar(line, i, current)
        current = next.current
        i = next.index + 1
        inQuotes = next.inQuotes
        continue
      }

      if (char === '"') {
        inQuotes = true
      } else if (char === ',') {
        fields.push(current)
        current = ''
      } else {
        current += char
      }
      i++
    }

    fields.push(current)
    return fields
  }

  private readQuotedChar(
    line: string,
    index: number,
    current: string,
  ): { current: string; index: number; inQuotes: boolean } {
    const char = line[index]

    if (char !== '"') return { current: current + char, index, inQuotes: true }
    if (line[index + 1] === '"') return { current: current + '"', index: index + 1, inQuotes: true }
    return { current, index, inQuotes: false }
  }
}
