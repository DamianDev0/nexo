import { IsHexColor, IsIn, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator'
import type { TagEntityType } from '@repo/shared-types'

export const TAG_ENTITY_TYPES: readonly TagEntityType[] = ['contact', 'company', 'deal', 'product']

export class TagQueryDto {
  @IsOptional()
  @IsIn(TAG_ENTITY_TYPES)
  entityType?: TagEntityType
}

export class CreateTagDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string

  @IsOptional()
  @IsHexColor()
  color?: string

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
  @IsHexColor()
  color?: string
}
