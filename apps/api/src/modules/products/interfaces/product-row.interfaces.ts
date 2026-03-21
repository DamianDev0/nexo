export interface ProductRow {
  id: string
  name: string
  sku: string | null
  barcode: string | null
  description: string | null
  category: string | null
  brand: string | null
  price_cents: string // BIGINT → string
  cost_cents: string
  iva_rate: number
  product_type: string
  unit_of_measure: string
  currency: string
  stock: number
  min_stock: number
  weight_grams: number | null
  tags: string[]
  images: string[]
  custom_fields: Record<string, unknown>
  is_active: boolean
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface ProductListRow {
  id: string
  name: string
  sku: string | null
  barcode: string | null
  category: string | null
  brand: string | null
  price_cents: string
  cost_cents: string
  iva_rate: number
  product_type: string
  unit_of_measure: string
  currency: string
  stock: number
  min_stock: number
  weight_grams: number | null
  tags: string[]
  is_active: boolean
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface MovementRow {
  id: string
  product_id: string
  quantity: number
  movement_type: string
  reference_type: string | null
  reference_id: string | null
  notes: string | null
  created_by: string | null
  created_at: string
}

export interface LowStockRow {
  id: string
  name: string
  sku: string | null
  stock: number
  min_stock: number
}
