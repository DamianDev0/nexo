import { Transform, Type } from 'class-transformer'
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator'
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '@repo/shared-utils'
import { SWATCH_COLOR_PATTERN, TAXONOMY_DESCRIPTION_MAX } from '@repo/shared-types'
import type { TagEntityType } from '@repo/shared-types'

export const TAG_ENTITY_TYPES: readonly TagEntityType[] = ['contact', 'company', 'deal', 'product']

export class TagQueryDto {
  @IsOptional()
  @IsIn(TAG_ENTITY_TYPES)
  entityType?: TagEntityType

  @IsOptional()
  @Transform(({ value }: { value: unknown }) => value === true || value === 'true')
  @IsBoolean()
  deleted?: boolean

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_PAGE_SIZE)
  limit?: number = DEFAULT_PAGE_SIZE
}

export class CreateTagDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string

  @IsOptional()
  @Matches(SWATCH_COLOR_PATTERN)
  color?: string

  @IsOptional()
  @IsString()
  @MaxLength(TAXONOMY_DESCRIPTION_MAX)
  description?: string

  @IsIn(TAG_ENTITY_TYPES)
  entityType: TagEntityType
}

export class UpdateTagDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name?: string

  @IsOptional()
  @Matches(SWATCH_COLOR_PATTERN)
  color?: string

  @IsOptional()
  @IsString()
  @MaxLength(TAXONOMY_DESCRIPTION_MAX)
  description?: string

  @IsOptional()
  @IsBoolean()
  enabled?: boolean
}
