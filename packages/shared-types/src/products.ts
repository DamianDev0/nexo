export type ProductType = 'product' | 'service'

export type Product = {
  id: string
  name: string
  sku: string | null
  barcode: string | null
  description: string | null
  category: string | null
  brand: string | null
  priceCents: number
  costCents: number
  ivaRate: number
  productType: ProductType
  unitOfMeasure: string
  currency: string
  stock: number
  minStock: number
  weightGrams: number | null
  tags: string[]
  images: string[]
  customFields: Record<string, unknown>
  isActive: boolean
  createdById: string | null
  createdAt: string
  updatedAt: string
}

export type ProductListItem = Omit<Product, 'customFields' | 'description' | 'images'>

export type PaginatedProducts = {
  data: ProductListItem[]
  total: number
  page: number
  limit: number
}

export type MovementType = 'purchase' | 'sale' | 'adjustment' | 'return' | 'transfer'

export type InventoryMovement = {
  id: string
  productId: string
  quantity: number
  movementType: MovementType
  referenceType: string | null
  referenceId: string | null
  notes: string | null
  createdById: string | null
  createdAt: string
}

export type ProductWithMovements = Product & {
  movements: InventoryMovement[]
}

export type LowStockItem = {
  id: string
  name: string
  sku: string | null
  stock: number
  minStock: number
}
