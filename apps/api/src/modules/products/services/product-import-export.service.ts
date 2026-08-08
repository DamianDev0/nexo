import { Injectable } from '@nestjs/common'
import type { AnalyzeResult, DuplicateStrategy, ImportResult } from '@repo/shared-types'
import { CsvExportService } from '@/shared/csv/csv-export.service'
import { ImportService } from '@/shared/imports/services/import.service'
import { ProductsRepository } from '../repositories/products.repository'
import { productImportMapper } from '../constants/product-import.mapper'
import type { ProductRow } from '../interfaces/product-row.interfaces'
import type { ProductImportCandidate } from '../interfaces/product-input.interfaces'

const CSV_COLUMNS = [
  { header: 'name', value: (r: ProductRow) => r.name },
  { header: 'sku', value: (r: ProductRow) => r.sku ?? '' },
  { header: 'barcode', value: (r: ProductRow) => r.barcode ?? '' },
  { header: 'description', value: (r: ProductRow) => r.description ?? '' },
  { header: 'category', value: (r: ProductRow) => r.category ?? '' },
  { header: 'brand', value: (r: ProductRow) => r.brand ?? '' },
  { header: 'price_cents', value: (r: ProductRow) => r.price_cents },
  { header: 'cost_cents', value: (r: ProductRow) => r.cost_cents },
  { header: 'iva_rate', value: (r: ProductRow) => String(r.iva_rate) },
  { header: 'product_type', value: (r: ProductRow) => r.product_type },
  { header: 'unit_of_measure', value: (r: ProductRow) => r.unit_of_measure },
  { header: 'currency', value: (r: ProductRow) => r.currency },
  { header: 'stock', value: (r: ProductRow) => String(r.stock) },
  { header: 'min_stock', value: (r: ProductRow) => String(r.min_stock) },
  { header: 'tags', value: (r: ProductRow) => (r.tags ?? []).join(';') },
]

@Injectable()
export class ProductImportExportService {
  constructor(
    private readonly repository: ProductsRepository,
    private readonly csvExport: CsvExportService,
    private readonly importService: ImportService,
  ) {}

  async exportCsv(schemaName: string): Promise<Buffer> {
    const rows = await this.repository.listAllActive(schemaName)
    return this.csvExport.toBuffer(rows, CSV_COLUMNS)
  }

  async analyzeImport(file: {
    buffer: Buffer
    originalname: string
    mimetype: string
    size: number
  }): Promise<AnalyzeResult> {
    return this.importService.analyze(file, productImportMapper)
  }

  async executeImport(
    schemaName: string,
    fileId: string,
    mapping: Record<string, string | null>,
    duplicateStrategy: DuplicateStrategy,
    createdById: string,
  ): Promise<ImportResult> {
    const { rows, cleanup } = await this.importService.getRowsForExecution(
      fileId,
      mapping,
      productImportMapper,
    )

    let skipped = 0
    const errors: { row: number; message: string }[] = []
    const candidates: ProductImportCandidate[] = []

    for (const [i, { data, errors: rowErrors }] of rows.entries()) {
      if (rowErrors.length > 0) {
        errors.push({ row: i + 2, message: rowErrors.join('; ') })
        skipped++
        continue
      }

      const name = data['name'] as string | undefined
      if (!name) {
        errors.push({ row: i + 2, message: 'Name is required' })
        skipped++
        continue
      }

      candidates.push({ name, sku: (data['sku'] as string) || null, data })
    }

    const counts = await this.repository.importRows(
      schemaName,
      candidates,
      duplicateStrategy,
      createdById,
    )
    cleanup()

    return {
      imported: counts.imported,
      updated: counts.updated,
      skipped: skipped + counts.skipped,
      errors,
    }
  }
}
