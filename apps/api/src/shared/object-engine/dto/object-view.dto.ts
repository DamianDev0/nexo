import { PartialType } from '@nestjs/mapped-types'
import { Type } from 'class-transformer'
import { IsBoundedObject } from '@/shared/decorators/is-bounded-object.decorator'
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateNested,
} from 'class-validator'

import {
  OBJECT_TABLE_MAX_COLUMNS,
  OBJECT_TABLE_MAX_PINNED,
  OBJECT_VIEW_DENSITIES,
  OBJECT_VIEW_SORT_DIRECTIONS,
  OBJECT_VIEW_VISIBILITIES,
} from '@repo/shared-types'

export class ObjectViewSortDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  field!: string

  @IsIn(OBJECT_VIEW_SORT_DIRECTIONS)
  direction!: (typeof OBJECT_VIEW_SORT_DIRECTIONS)[number]
}

export class ObjectViewColumnsDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(OBJECT_TABLE_MAX_COLUMNS)
  order?: string[]

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(OBJECT_TABLE_MAX_COLUMNS)
  hidden?: string[]

  @IsOptional()
  @IsObject()
  widths?: Record<string, number>

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(OBJECT_TABLE_MAX_PINNED)
  pinnedLeft?: string[]

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(OBJECT_TABLE_MAX_PINNED)
  pinnedRight?: string[]
}

export class CreateObjectViewDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name!: string

  @IsOptional()
  @IsString()
  @MaxLength(300)
  description?: string

  @IsOptional()
  @IsBoundedObject()
  filters?: Record<string, unknown>

  @IsOptional()
  @IsBoundedObject()
  advancedFilters?: Record<string, unknown> | null

  @IsOptional()
  @ValidateNested()
  @Type(() => ObjectViewColumnsDto)
  columns?: ObjectViewColumnsDto

  @IsOptional()
  @ValidateNested()
  @Type(() => ObjectViewSortDto)
  sort?: ObjectViewSortDto | null

  @IsOptional()
  @IsIn(OBJECT_VIEW_DENSITIES)
  density?: (typeof OBJECT_VIEW_DENSITIES)[number]

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean

  @IsOptional()
  @IsBoolean()
  isFavorite?: boolean

  @IsOptional()
  @IsIn(OBJECT_VIEW_VISIBILITIES)
  visibility?: (typeof OBJECT_VIEW_VISIBILITIES)[number]
}

export class UpdateObjectViewDto extends PartialType(CreateObjectViewDto) {}

export class ReorderObjectViewsDto {
  @IsArray()
  @IsUUID('4', { each: true })
  @ArrayMaxSize(100)
  ids!: string[]
}

export class DuplicateObjectViewDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name?: string
}
