import { Injectable } from '@nestjs/common'
import type {
  ColumnAnalysis,
  ImportFieldDef,
  ImportFieldError,
  ImportRowMapper,
  PreviewRow,
  ValidationPreview,
} from '../interfaces/import.interfaces'

@Injectable()
export class ImportFieldMapperService {
  normalizeColumnName(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replaceAll(/[\u0300-\u036f]/g, '')
      .replaceAll(/[_-]/g, ' ')
      .replaceAll(/\s+/g, ' ')
  }

  suggestMapping(columns: string[], fieldDefs: ImportFieldDef[]): Record<string, string | null> {
    const mapping: Record<string, string | null> = {}
    const usedFields = new Set<string>()

    for (const column of columns) {
      const normalized = this.normalizeColumnName(column)
      let matched: string | null = null

      for (const def of fieldDefs) {
        if (usedFields.has(def.field)) continue

        if (normalized === def.field.toLowerCase()) {
          matched = def.field
          break
        }

        if (def.aliases.some((alias) => normalized === alias || normalized.includes(alias))) {
          matched = def.field
          break
        }
      }

      if (matched) usedFields.add(matched)
      mapping[column] = matched
    }

    return mapping
  }

  analyzeColumns(
    columns: string[],
    sampleRows: Record<string, string>[],
    fieldDefs: ImportFieldDef[],
  ): ColumnAnalysis[] {
    const mapping = this.suggestMapping(columns, fieldDefs)

    return columns.map((csvColumn) => {
      const values = sampleRows.map((row) => row[csvColumn] ?? '')
      const filled = values.filter((v) => v.trim().length > 0)
      const fillRate =
        sampleRows.length > 0 ? Math.round((filled.length / sampleRows.length) * 100) : 0

      return {
        csvColumn,
        suggestedField: mapping[csvColumn] ?? null,
        sampleValues: filled.slice(0, 5),
        fillRate,
      }
    })
  }

  mapRow(
    rawRow: Record<string, string>,
    mapping: Record<string, string | null>,
    mapper: ImportRowMapper,
  ): { data: Record<string, unknown>; errors: ImportFieldError[] } {
    const data: Record<string, unknown> = {}
    const errors: ImportFieldError[] = []

    for (const [csvColumn, rawValue] of Object.entries(rawRow)) {
      const entityField = mapping[csvColumn]
      const value = rawValue?.trim() ?? ''
      if (!value || !entityField) continue

      const normalized = mapper.normalizeValue(entityField, value)
      const fieldError = mapper.validateField(entityField, normalized)

      if (fieldError) {
        errors.push(fieldError)
        continue
      }

      data[entityField] = normalized
    }

    return { data, errors }
  }

  validateSampleRows(
    sampleRows: Record<string, string>[],
    mapping: Record<string, string | null>,
    mapper: ImportRowMapper,
  ): ValidationPreview {
    const rows: PreviewRow[] = []

    for (const [i, raw] of sampleRows.entries()) {
      const { data, errors } = this.mapRow(raw, mapping, mapper)

      for (const def of mapper.fieldDefs) {
        if (def.required && data[def.field] === undefined) {
          errors.push({ field: def.field, message: `${def.label} is required` })
        }
      }

      rows.push({
        rowNumber: i + 2,
        raw,
        mapped: data,
        errors,
        isValid: errors.length === 0,
      })
    }

    const validRows = rows.filter((r) => r.isValid).length

    return {
      totalSampleRows: sampleRows.length,
      validRows,
      invalidRows: sampleRows.length - validRows,
      rows,
    }
  }

  findMissingRequiredFields(
    mapping: Record<string, string | null>,
    fieldDefs: ImportFieldDef[],
  ): string[] {
    const mappedFields = new Set(Object.values(mapping).filter(Boolean))
    return fieldDefs
      .filter((def) => def.required && !mappedFields.has(def.field))
      .map((def) => def.field)
  }
}
