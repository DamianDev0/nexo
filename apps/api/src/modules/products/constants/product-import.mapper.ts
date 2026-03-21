import type {
  ImportFieldDef,
  ImportFieldError,
  ImportRowMapper,
} from '@/shared/imports/interfaces/import.interfaces'

// ─── Field definitions with aliases for smart mapping ────────────────────────

const PRODUCT_FIELD_DEFS: ImportFieldDef[] = [
  {
    field: 'name',
    label: 'Product name',
    required: true,
    aliases: [
      'nombre',
      'product',
      'producto',
      'nombre producto',
      'product name',
      'title',
      'titulo',
    ],
  },
  {
    field: 'sku',
    label: 'SKU',
    required: false,
    aliases: ['codigo', 'code', 'ref', 'referencia', 'reference', 'part number'],
  },
  {
    field: 'barcode',
    label: 'Barcode',
    required: false,
    aliases: ['codigo barras', 'ean', 'upc', 'gtin', 'bar code'],
  },
  {
    field: 'description',
    label: 'Description',
    required: false,
    aliases: ['descripcion', 'detalle', 'detail', 'desc'],
  },
  {
    field: 'category',
    label: 'Category',
    required: false,
    aliases: ['categoria', 'cat', 'grupo', 'group', 'linea', 'line'],
  },
  {
    field: 'brand',
    label: 'Brand',
    required: false,
    aliases: ['marca', 'fabricante', 'manufacturer'],
  },
  {
    field: 'priceCents',
    label: 'Price (cents)',
    required: true,
    aliases: ['precio', 'price', 'precio venta', 'sale price', 'pvp', 'price cents', 'valor'],
  },
  {
    field: 'costCents',
    label: 'Cost (cents)',
    required: false,
    aliases: ['costo', 'cost', 'precio compra', 'purchase price', 'cost cents'],
  },
  {
    field: 'ivaRate',
    label: 'IVA rate (%)',
    required: false,
    aliases: ['iva', 'tax', 'impuesto', 'tax rate', 'tarifa iva'],
  },
  {
    field: 'productType',
    label: 'Type (product/service)',
    required: false,
    aliases: ['tipo', 'type', 'tipo producto'],
  },
  {
    field: 'unitOfMeasure',
    label: 'Unit of measure',
    required: false,
    aliases: ['unidad', 'unit', 'unidad medida', 'uom', 'um'],
  },
  {
    field: 'currency',
    label: 'Currency',
    required: false,
    aliases: ['moneda', 'divisa'],
  },
  {
    field: 'stock',
    label: 'Stock',
    required: false,
    aliases: ['inventario', 'inventory', 'cantidad', 'quantity', 'existencia', 'qty'],
  },
  {
    field: 'minStock',
    label: 'Minimum stock',
    required: false,
    aliases: ['stock minimo', 'min stock', 'minimum', 'min'],
  },
  {
    field: 'tags',
    label: 'Tags (semicolon separated)',
    required: false,
    aliases: ['etiquetas', 'labels', 'categorias'],
  },
]

// ─── Product row mapper implementation ───────────────────────────────────────

export const productImportMapper: ImportRowMapper = {
  fieldDefs: PRODUCT_FIELD_DEFS,
  uniqueKeyField: 'sku',

  normalizeValue(field: string, value: string): unknown {
    switch (field) {
      case 'priceCents':
      case 'costCents':
      case 'stock':
      case 'minStock':
      case 'ivaRate': {
        const num = Number.parseInt(value.replaceAll(/[^\d-]/g, ''), 10)
        return Number.isNaN(num) ? 0 : num
      }

      case 'productType': {
        const lower = value.toLowerCase().trim()
        if (lower === 'servicio' || lower === 'service') return 'service'
        return 'product'
      }

      case 'tags':
        return value
          .split(/[;,]/)
          .map((t) => t.trim())
          .filter(Boolean)

      case 'name':
        return value.trim()

      default:
        return value.trim()
    }
  },

  validateField(field: string, value: unknown): ImportFieldError | null {
    switch (field) {
      case 'priceCents':
        if (typeof value === 'number' && value < 0) {
          return { field, message: 'Price must be >= 0', value: String(value) }
        }
        break

      case 'ivaRate':
        if (typeof value === 'number' && (value < 0 || value > 100)) {
          return { field, message: 'IVA rate must be between 0 and 100', value: String(value) }
        }
        break

      case 'productType':
        if (typeof value === 'string' && !['product', 'service'].includes(value)) {
          return { field, message: 'Type must be "product" or "service"', value }
        }
        break
    }

    return null
  },
}
