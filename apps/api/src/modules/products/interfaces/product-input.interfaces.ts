export interface ProductListFilters {
  q?: string
  category?: string
  brand?: string
  productType?: string
  tags?: string[]
  lowStock?: boolean
}

export interface ProductCreateValues {
  name: string
  sku: string | null
  barcode: string | null
  description: string | null
  category: string | null
  brand: string | null
  priceCents: number
  costCents: number
  ivaRate: number
  productType: string
  unitOfMeasure: string
  currency: string
  minStock: number
  weightGrams: number | null
  tags: string[]
  images: string[]
  customFields: Record<string, unknown>
  createdById: string
}

export type ProductUpdateEntry = [column: string, value: unknown]

export interface MovementInput {
  quantity: number
  movementType: string
  referenceType: string | null
  referenceId: string | null
  notes: string | null
  createdById: string
}

export interface ProductImportCandidate {
  name: string
  sku: string | null
  data: Record<string, unknown>
}

export interface ImportCounts {
  imported: number
  updated: number
  skipped: number
}
