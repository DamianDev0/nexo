import { PartialType } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  IsArray,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator'

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(300)
  name: string

  @IsOptional()
  @IsString()
  @MaxLength(100)
  sku?: string

  @IsOptional()
  @IsString()
  @MaxLength(100)
  barcode?: string

  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  @IsString()
  @MaxLength(100)
  category?: string

  @IsOptional()
  @IsString()
  @MaxLength(100)
  brand?: string

  @IsInt()
  @Min(0)
  @Type(() => Number)
  priceCents: number

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  costCents?: number

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  ivaRate?: number

  @IsOptional()
  @IsIn(['product', 'service'])
  productType?: string

  @IsOptional()
  @IsString()
  @MaxLength(30)
  unitOfMeasure?: string

  @IsOptional()
  @IsString()
  @MaxLength(3)
  currency?: string

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  minStock?: number

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  weightGrams?: number

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[]

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[]

  @IsOptional()
  customFields?: Record<string, unknown>
}

export class UpdateProductDto extends PartialType(CreateProductDto) {}

export class ProductQueryDto {
  @IsOptional()
  @IsString()
  q?: string

  @IsOptional()
  @IsString()
  category?: string

  @IsOptional()
  @IsString()
  brand?: string

  @IsOptional()
  @IsIn(['product', 'service'])
  productType?: string

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[]

  @IsOptional()
  @IsIn(['true', 'false'])
  lowStock?: string

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number
}

// ─── Execute import (step 2) ─────────────────────────────────────────────────

export class ExecuteImportDto {
  @IsString()
  @IsNotEmpty()
  fileId: string

  @IsOptional()
  mapping?: Record<string, string | null>

  @IsOptional()
  @IsIn(['skip', 'create', 'update'])
  duplicateStrategy?: string
}

// ─── Bulk price update ───────────────────────────────────────────────────────

export class BulkPriceUpdateDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  category?: string

  @IsOptional()
  @IsString()
  @MaxLength(100)
  brand?: string

  @IsInt()
  @Min(-100)
  @Max(1000)
  @Type(() => Number)
  percentChange: number
}

// ─── Inventory adjustment ────────────────────────────────────────────────────

export class InventoryAdjustmentDto {
  @IsInt()
  @Type(() => Number)
  quantity: number

  @IsIn(['purchase', 'sale', 'adjustment', 'return', 'transfer'])
  movementType: string

  @IsOptional()
  @IsString()
  @MaxLength(30)
  referenceType?: string

  @IsOptional()
  @IsUUID()
  referenceId?: string

  @IsOptional()
  @IsString()
  notes?: string
}
