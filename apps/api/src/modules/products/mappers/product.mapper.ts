import type {
  InventoryMovement,
  LowStockItem,
  MovementType,
  Product,
  ProductListItem,
  ProductType,
} from '@repo/shared-types'
import type {
  LowStockRow,
  MovementRow,
  ProductListRow,
  ProductRow,
} from '../interfaces/product-row.interfaces'

function mapProductCommon(r: ProductListRow): ProductListItem {
  return {
    id: r.id,
    name: r.name,
    sku: r.sku,
    barcode: r.barcode,
    category: r.category,
    brand: r.brand,
    priceCents: Number(r.price_cents),
    costCents: Number(r.cost_cents),
    ivaRate: r.iva_rate,
    productType: r.product_type as ProductType,
    unitOfMeasure: r.unit_of_measure,
    currency: r.currency,
    stock: r.stock,
    minStock: r.min_stock,
    weightGrams: r.weight_grams,
    tags: r.tags ?? [],
    isActive: r.is_active,
    createdById: r.created_by,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }
}

export function mapProduct(r: ProductRow): Product {
  return {
    ...mapProductCommon(r),
    description: r.description,
    images: r.images ?? [],
    customFields: r.custom_fields ?? {},
  }
}

export function mapProductListItem(r: ProductListRow): ProductListItem {
  return mapProductCommon(r)
}

export function mapInventoryMovement(r: MovementRow): InventoryMovement {
  return {
    id: r.id,
    productId: r.product_id,
    quantity: r.quantity,
    movementType: r.movement_type as MovementType,
    referenceType: r.reference_type,
    referenceId: r.reference_id,
    notes: r.notes,
    createdById: r.created_by,
    createdAt: r.created_at,
  }
}

export function mapLowStockItem(r: LowStockRow): LowStockItem {
  return {
    id: r.id,
    name: r.name,
    sku: r.sku,
    stock: r.stock,
    minStock: r.min_stock,
  }
}
