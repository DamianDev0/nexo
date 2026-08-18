import type { MovementType, ProductType } from '@repo/shared-types'
import type { FieldMap } from '@/shared/utils/field-map'
import type { UpdateProductDto } from '../dto/product.dto'

export const PRODUCT_TYPES: readonly ProductType[] = ['product', 'service']

export const MOVEMENT_TYPES: readonly MovementType[] = [
  'purchase',
  'sale',
  'adjustment',
  'return',
  'transfer',
]

export const UPDATABLE_FIELDS: FieldMap<UpdateProductDto> = [
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
