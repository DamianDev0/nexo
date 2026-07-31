import { PartialType } from '@nestjs/mapped-types'
import { Type } from 'class-transformer'
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator'

import {
  CONTACT_VIEW_DENSITIES,
  CONTACT_VIEW_SORT_DIRECTIONS,
  CONTACT_VIEW_VISIBILITIES,
} from '@repo/shared-types'

export class ContactViewSortDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  field!: string

  @IsIn(CONTACT_VIEW_SORT_DIRECTIONS)
  direction!: (typeof CONTACT_VIEW_SORT_DIRECTIONS)[number]
}

export class ContactViewColumnsDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(60)
  order?: string[]

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(60)
  hidden?: string[]

  @IsOptional()
  @IsObject()
  widths?: Record<string, number>

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(10)
  pinnedLeft?: string[]

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(10)
  pinnedRight?: string[]
}

export class CreateContactViewDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name!: string

  @IsOptional()
  @IsObject()
  filters?: Record<string, unknown>

  @IsOptional()
  @IsObject()
  advancedFilters?: Record<string, unknown> | null

  @IsOptional()
  @ValidateNested()
  @Type(() => ContactViewColumnsDto)
  columns?: ContactViewColumnsDto

  @IsOptional()
  @ValidateNested()
  @Type(() => ContactViewSortDto)
  sort?: ContactViewSortDto | null

  @IsOptional()
  @IsIn(CONTACT_VIEW_DENSITIES)
  density?: (typeof CONTACT_VIEW_DENSITIES)[number]

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean

  @IsOptional()
  @IsBoolean()
  isFavorite?: boolean

  @IsOptional()
  @IsIn(CONTACT_VIEW_VISIBILITIES)
  visibility?: (typeof CONTACT_VIEW_VISIBILITIES)[number]
}

export class UpdateContactViewDto extends PartialType(CreateContactViewDto) {}

export class ReorderContactViewsDto {
  @IsArray()
  @IsUUID('4', { each: true })
  @ArrayMaxSize(100)
  ids!: string[]
}

export class DuplicateContactViewDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name?: string
}

export class ContactViewPositionDto {
  @IsInt()
  @Type(() => Number)
  @Min(0)
  @Max(1000)
  position!: number
}
