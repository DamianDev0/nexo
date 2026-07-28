import { PartialType } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import type { DuplicateStrategy, MovementType, ProductType } from '@repo/shared-types'
import { MAX_PAGE_SIZE } from '@repo/shared-utils'
import { DUPLICATE_STRATEGIES, MOVEMENT_TYPES, PRODUCT_TYPES } from '../constants/product.constants'
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
  @IsIn(PRODUCT_TYPES)
  productType?: ProductType

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
  @IsIn(PRODUCT_TYPES)
  productType?: ProductType

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
  @Max(MAX_PAGE_SIZE)
  limit?: number
}

export class ExecuteImportDto {
  @IsString()
  @IsNotEmpty()
  fileId: string

  @IsOptional()
  mapping?: Record<string, string | null>

  @IsOptional()
  @IsIn(DUPLICATE_STRATEGIES)
  duplicateStrategy?: DuplicateStrategy
}

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

export class InventoryAdjustmentDto {
  @IsInt()
  @Type(() => Number)
  quantity: number

  @IsIn(MOVEMENT_TYPES)
  movementType: MovementType

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
