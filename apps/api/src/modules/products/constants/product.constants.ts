import type { UpdateProductDto } from '../dto/product.dto'

// ─── Updatable fields map: DTO key → SQL column ──────────────────────────────

export const UPDATABLE_FIELDS: [keyof UpdateProductDto, string][] = [
  ['name', 'name'],
  ['sku', 'sku'],
  ['barcode', 'barcode'],
  ['description', 'description'],
  ['category', 'category'],
  ['brand', 'brand'],
  ['priceCents', 'price_cents'],
  ['costCents', 'cost_cents'],
  ['ivaRate', 'iva_rate'],
  ['productType', 'product_type'],
  ['unitOfMeasure', 'unit_of_measure'],
  ['currency', 'currency'],
  ['minStock', 'min_stock'],
  ['weightGrams', 'weight_grams'],
  ['tags', 'tags'],
  ['images', 'images'],
  ['customFields', 'custom_fields'],
]

// ─── SQL column selections ───────────────────────────────────────────────────

export const PRODUCT_LIST_COLUMNS = `
  id, name, sku, barcode, category, brand,
  price_cents, cost_cents, iva_rate, product_type,
  unit_of_measure, currency, stock, min_stock,
  weight_grams, tags, is_active, created_by,
  created_at, updated_at
`

export const PRODUCT_ALL_COLUMNS = `
  id, name, sku, barcode, description, category, brand,
  price_cents, cost_cents, iva_rate, product_type,
  unit_of_measure, currency, stock, min_stock,
  weight_grams, tags, images, custom_fields,
  is_active, created_by, created_at, updated_at
`
