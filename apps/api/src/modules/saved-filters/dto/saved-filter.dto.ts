import {
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator'
import type { SavedFilterEntityType } from '@repo/shared-types'

export const SAVED_FILTER_ENTITY_TYPES: readonly SavedFilterEntityType[] = [
  'contact',
  'company',
  'deal',
  'activity',
  'product',
  'invoice',
]

export class SavedFilterQueryDto {
  @IsOptional()
  @IsIn(SAVED_FILTER_ENTITY_TYPES)
  entityType?: SavedFilterEntityType
}

export class CreateSavedFilterDto {
  @IsIn(SAVED_FILTER_ENTITY_TYPES)
  entityType: SavedFilterEntityType

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name: string

  @IsObject()
  filters: Record<string, unknown>

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean
}

export class UpdateSavedFilterDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name?: string

  @IsOptional()
  @IsObject()
  filters?: Record<string, unknown>

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean
}
